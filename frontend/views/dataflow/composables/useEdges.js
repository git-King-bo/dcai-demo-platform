/**
 * useEdges Composable
 * 管理边的创建、删除和连接逻辑,包括参数传递和类型检查
 */
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

export function useEdges(nodes, onNodeUpdate) {
  // State
  const edges = ref([])
  const connectionSeparator = ref('|')

  /**
   * 从字段的默认值推断类型
   */
  const inferTypeFromValue = (value) => {
    if (value === null || value === undefined) {
      return 'any'
    }

    if (Array.isArray(value)) {
      return 'array'
    }

    if (typeof value === 'object') {
      return 'object'
    }

    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'int' : 'float'
    }

    if (typeof value === 'boolean') {
      return 'bool'
    }

    if (typeof value === 'string') {
      return 'string'
    }

    return 'any'
  }

  /**
   * 基于字段命名规则推断类型
   */
  const inferTypeFromFieldName = (fieldName) => {
    if (!fieldName) return null

    const name = fieldName.toLowerCase()

    if (name.includes('file') || name.includes('path') ||
        name.includes('dir') || name.includes('url') ||
        name.includes('output') || name.includes('input')) {
      return 'string'
    }

    if (name.includes('_id') || name.includes('name') ||
        name.includes('key') || name.includes('token') ||
        name.includes('text') || name.includes('content')) {
      return 'string'
    }

    if (name.includes('list') || name.includes('ids') ||
        name.includes('tags') || name.includes('items') ||
        name.includes('fields')) {
      return 'array'
    }

    if (name.includes('count') || name.includes('size') ||
        name.includes('num') || name.includes('batch') ||
        name.includes('limit') || name.includes('max') ||
        name.includes('min')) {
      return 'int'
    }

    if (name.includes('rate') || name.includes('ratio') ||
        name.includes('threshold') || name.includes('score') ||
        name.includes('weight') || name.includes('alpha')) {
      return 'float'
    }

    if (name.startsWith('is_') || name.startsWith('enable_') ||
        name.startsWith('has_') || name.startsWith('use_') ||
        name.startsWith('show_')) {
      return 'bool'
    }

    return null
  }

  /**
   * 获取字段类型
   */
  const getFieldType = (nodeId, fieldKey) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node) {
      return 'any'
    }

    // 数据集节点的字段都是 string 类型
    if (node.type === 'dataset') {
      return 'string'
    }

    const operator = node?.data?.operator

    // 从用户配置的实际值推断
    const userValue = node.data?.runConfig?.[fieldKey] ??
                      node.data?.initConfig?.[fieldKey]
    if (userValue !== null && userValue !== undefined) {
      const typeFromUserValue = inferTypeFromValue(userValue)
      return typeFromUserValue
    }

    // 从算子默认值推断
    const defaultValue = operator?.config?.run?.[fieldKey] ??
                         operator?.config?.init?.[fieldKey]
    const typeFromValue = inferTypeFromValue(defaultValue)
    if (typeFromValue !== 'any') {
      return typeFromValue
    }

    // 从字段名称启发式推断
    const typeFromName = inferTypeFromFieldName(fieldKey)
    if (typeFromName) {
      return typeFromName
    }

    return 'any'
  }

  /**
   * 检查两个类型是否兼容
   */
  const areTypesCompatible = (sourceType, targetType) => {
    if (sourceType === 'any' || targetType === 'any') {
      return true
    }

    if (sourceType === targetType) {
      return true
    }

    const numericTypes = ['int', 'float', 'number']
    if (numericTypes.includes(sourceType) && numericTypes.includes(targetType)) {
      return true
    }

    return false
  }

  /**
   * 获取类型的友好显示名称
   */
  const getTypeFriendlyName = (type) => {
    const typeNames = {
      'string': '字符串',
      'int': '整数',
      'float': '浮点数',
      'bool': '布尔值',
      'array': '数组',
      'object': '对象',
      'any': '任意类型'
    }
    return typeNames[type] || type
  }

  /**
   * 判断字段属于 run 还是 init 配置
   */
  const determineFieldCategory = (nodeId, fieldKey) => {
    const node = nodes.value.find(n => n.id === nodeId)
    const operator = node?.data?.operator

    if (operator?.config?.run && fieldKey in operator.config.run) {
      return 'run'
    } else if (operator?.config?.init && fieldKey in operator.config.init) {
      return 'init'
    }

    // 特殊处理：PromptTemplatedGenerator 的动态变量字段
    if (operator?.name === 'PromptTemplatedGenerator') {
      const inputKeys = node?.data?.runConfig?.input_keys || {}
      if (fieldKey in inputKeys) {
        return 'run'
      }
    }

    return null
  }

  /**
   * 获取连接到同一目标端口的所有源值并拼接
   */
  const getMergedValueForTargetPort = (targetNodeId, targetPort, getSourceFieldValue) => {
    const incomingEdges = edges.value.filter(edge =>
      edge.target === targetNodeId && edge.targetHandle === targetPort
    )

    if (incomingEdges.length === 0) {
      return undefined
    }

    if (incomingEdges.length === 1) {
      const edge = incomingEdges[0]
      const sourceValue = getSourceFieldValue(edge.source, edge.sourceHandle)
      return sourceValue
    }

    // 多个连接，需要合并
    const sourceValues = []
    incomingEdges.forEach((edge) => {
      const sourceValue = getSourceFieldValue(edge.source, edge.sourceHandle)
      if (sourceValue !== undefined && sourceValue !== null && sourceValue !== '') {
        sourceValues.push(String(sourceValue))
      }
    })

    if (sourceValues.length === 0) {
      return undefined
    }

    return sourceValues.join(connectionSeparator.value)
  }

  /**
   * 获取改变的字段值
   */
  const getChangedFieldValue = (fieldKey, updates) => {
    if (updates.runConfig?.[fieldKey] !== undefined) {
      return updates.runConfig[fieldKey]
    }
    if (updates.initConfig?.[fieldKey] !== undefined) {
      return updates.initConfig[fieldKey]
    }

    if (updates.datasetFields && Array.isArray(updates.datasetFields)) {
      let actualFieldName = fieldKey
      if (fieldKey.startsWith('dataset-field-')) {
        actualFieldName = fieldKey.replace('dataset-field-', '')
      }

      if (updates.datasetFields.includes(actualFieldName)) {
        return actualFieldName
      }
    }

    return undefined
  }

  /**
   * 传播参数值到下游节点
   */
  const propagateDisplayValues = (sourceNodeId, updates, getSourceFieldValue) => {
    const affectedTargetPorts = new Set()

    edges.value.forEach(edge => {
      if (edge.source === sourceNodeId) {
        const sourceField = edge.sourceHandle
        const targetField = edge.targetHandle

        const sourceValue = getChangedFieldValue(sourceField, updates)

        if (sourceValue !== undefined) {
          const targetPortKey = `${edge.target}.${targetField}`
          affectedTargetPorts.add(targetPortKey)
        }
      }
    })

    affectedTargetPorts.forEach(targetPortKey => {
      const [targetNodeId, targetField] = targetPortKey.split('.')

      const mergedValue = getMergedValueForTargetPort(targetNodeId, targetField, getSourceFieldValue)
      if (mergedValue !== undefined) {
        const targetCategory = determineFieldCategory(targetNodeId, targetField)

        if (targetCategory === 'run') {
          const targetNode = nodes.value.find(n => n.id === targetNodeId)
          const isPromptTemplatedGenerator = targetNode?.data?.operator?.name === 'PromptTemplatedGenerator'

          if (isPromptTemplatedGenerator) {
            const inputKeys = targetNode?.data?.runConfig?.input_keys || {}
            if (targetField in inputKeys) {
              onNodeUpdate(targetNodeId, {
                runConfig: {
                  input_keys: {
                    ...inputKeys,
                    [targetField]: mergedValue
                  }
                },
                _fromConnection: true
              })
            } else {
              onNodeUpdate(targetNodeId, {
                runConfig: { [targetField]: mergedValue },
                _fromConnection: true
              })
            }
          } else {
            onNodeUpdate(targetNodeId, {
              runConfig: { [targetField]: mergedValue },
              _fromConnection: true
            })
          }
        } else if (targetCategory === 'init') {
          onNodeUpdate(targetNodeId, {
            initConfig: { [targetField]: mergedValue },
            _fromConnection: true
          })
        }
      }
    })
  }

  /**
   * 处理连接建立
   */
  const onConnect = (connection, getSourceFieldValue) => {
    // 禁止节点自连
    if (connection.source === connection.target) {
      ElMessage.warning('不允许节点连接到自身')
      return
    }

    const sourcePort = connection.sourceHandle
    const targetPort = connection.targetHandle

    // 类型检查
    const sourceType = getFieldType(connection.source, sourcePort)
    const targetType = getFieldType(connection.target, targetPort)

    if (!areTypesCompatible(sourceType, targetType)) {
      const sourceTypeName = getTypeFriendlyName(sourceType)
      const targetTypeName = getTypeFriendlyName(targetType)

      ElMessage.warning({
        message: `类型不匹配：${sourcePort}(${sourceTypeName}) 无法连接到 ${targetPort}(${targetTypeName})`,
        duration: 4000,
        showClose: true
      })

      return
    }

    // 创建边
    const newEdge = {
      ...connection,
      id: `edge-${Date.now()}`,
      type: 'default',
      animated: true,
      style: {
        strokeWidth: 6,
        stroke: '#FF6B35'
      }
    }

    edges.value.push(newEdge)

    if (!sourcePort || !targetPort) {
      return
    }

    // 获取合并后的值并更新目标字段
    const mergedValue = getMergedValueForTargetPort(connection.target, targetPort, getSourceFieldValue)

    if (mergedValue !== undefined) {
      const targetCategory = determineFieldCategory(connection.target, targetPort)

      if (targetCategory === 'run') {
        const targetNode = nodes.value.find(n => n.id === connection.target)
        const isPromptTemplatedGenerator = targetNode?.data?.operator?.name === 'PromptTemplatedGenerator'

        if (isPromptTemplatedGenerator) {
          const inputKeys = targetNode?.data?.runConfig?.input_keys || {}
          if (targetPort in inputKeys) {
            onNodeUpdate(connection.target, {
              runConfig: {
                input_keys: {
                  ...inputKeys,
                  [targetPort]: mergedValue
                }
              },
              _fromConnection: true
            })
          } else {
            onNodeUpdate(connection.target, {
              runConfig: { [targetPort]: mergedValue },
              _fromConnection: true
            })
          }
        } else {
          onNodeUpdate(connection.target, {
            runConfig: { [targetPort]: mergedValue },
            _fromConnection: true
          })
        }
      } else if (targetCategory === 'init') {
        onNodeUpdate(connection.target, {
          initConfig: { [targetPort]: mergedValue },
          _fromConnection: true
        })
      }
    }
  }

  /**
   * 处理边变化(包括删除)
   */
  const onEdgesChange = (changes, getSourceFieldValue) => {
    console.log('[边变化] 检测到边变化:', changes)

    const affectedTargetPorts = new Set()

    changes.forEach(change => {
      if (change.type === 'remove') {
        const removedEdge = edges.value.find(edge => edge.id === change.id)
        if (removedEdge && removedEdge.target && removedEdge.targetHandle) {
          const targetPortKey = `${removedEdge.target}.${removedEdge.targetHandle}`
          affectedTargetPorts.add(targetPortKey)
        }
      }
    })

    nextTick(() => {
      affectedTargetPorts.forEach(targetPortKey => {
        const [targetNodeId, targetField] = targetPortKey.split('.')

        const mergedValue = getMergedValueForTargetPort(targetNodeId, targetField, getSourceFieldValue)
        const targetCategory = determineFieldCategory(targetNodeId, targetField)

        if (targetCategory === 'run') {
          onNodeUpdate(targetNodeId, {
            runConfig: { [targetField]: mergedValue || '' },
            _fromConnection: true
          })
        } else if (targetCategory === 'init') {
          onNodeUpdate(targetNodeId, {
            initConfig: { [targetField]: mergedValue || '' },
            _fromConnection: true
          })
        }
      })
    })
  }

  /**
   * 清空所有边
   */
  const clearEdges = () => {
    edges.value = []
  }

  /**
   * 监听分隔符变化
   */
  watch(connectionSeparator, (newSeparator, oldSeparator) => {
    if (newSeparator !== oldSeparator) {
      // 重新计算所有多端口连接的合并值
      // (实现逻辑略)
    }
  })

  return {
    // State
    edges,
    connectionSeparator,

    // Methods
    onConnect,
    onEdgesChange,
    clearEdges,
    getFieldType,
    areTypesCompatible,
    getTypeFriendlyName,
    determineFieldCategory,
    getMergedValueForTargetPort,
    propagateDisplayValues,
    getChangedFieldValue,
  }
}
