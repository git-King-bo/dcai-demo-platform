/**
 * useNodes Composable
 * 管理节点的创建、更新、删除和验证
 */
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useAgentStore } from '@/store/modules/agent'
let agentStore = null
function getAgentStore() {
  if (!agentStore) {
    agentStore = useAgentStore()
  }
  return agentStore
}

export function useNodes(operators, onNodeUpdateCallback = null) {
  // State
  const nodes = ref([])
  const selectedNodeId = ref(null)
  const nodeIdCounter = ref(1)

  /**
   * 判断节点是否为算子节点
   */
  const isOperatorNode = (node) => {
    if ( node.type === 'dataset') {
      return true
    }

    if ( node.type === 'model') {
      return false
    }

    if (node.data?.operator) {
      const operatorId = node.data.operator.id
      const operatorName = node.data.operator.name

      return operators.value.some(op =>
        op.id === operatorId || op.name === operatorName
      )
    }

    return false
  }

  /**
   * 添加节点到画布
   */
  const addNode = (nodeData) => {
    nodes.value.push(nodeData)
    return nodeData
  }

  /**
   * 更新节点数据
   */
  const onNodeUpdate = (nodeId, updates) => {
    console.log('[DEBUG onNodeUpdate] 调用:', { nodeId, updates })

    const nodeIndex = nodes.value.findIndex(node => node.id === nodeId)
    if (nodeIndex !== -1) {
      const currentNode = nodes.value[nodeIndex]
      console.log('[DEBUG onNodeUpdate] 找到节点:', { nodeId, nodeIndex })
      // 更新runConfig
      if (updates.runConfig) {
        if (!currentNode.data.runConfig) {
          currentNode.data.runConfig = {}
        }
        Object.assign(currentNode.data.runConfig, updates.runConfig)
        console.log('[DEBUG onNodeUpdate] 更新 runConfig:', currentNode.data.runConfig)
      }

      // 更新initConfig
      if (updates.initConfig) {
        if (!currentNode.data.initConfig) {
          currentNode.data.initConfig = {}
        }
        Object.assign(currentNode.data.initConfig, updates.initConfig)
      }

      // 处理其他字段更新
      Object.keys(updates).forEach(key => {
        if (key !== 'runConfig' && key !== 'initConfig' && key !== '_fromConnection') {
          currentNode.data[key] = updates[key]
        }
      })

      // 添加时间戳触发更新
      currentNode.data._timestamp = Date.now()

      // 如果有回调函数，调用它来传播更新到下游节点
      if (onNodeUpdateCallback) {
        onNodeUpdateCallback(nodeId, updates)
      }
    } else {
      console.error('[DEBUG onNodeUpdate] 未找到节点:', nodeId)
    }
  }

  /**
   * 删除节点
   */
  const onNodeDelete = (nodeId) => {
    const nodeIndex = nodes.value.findIndex(node => node.id === nodeId)
    if (nodeIndex !== -1) {
      nodes.value.splice(nodeIndex, 1)
      return true
    }
    return false
  }

  /**
   * 处理节点点击
   */
  const onNodeClick = (event) => {
    selectedNodeId.value = event.node.id
  }

  /**
   * 处理画布点击
   */
  const onPaneClick = () => {
    selectedNodeId.value = ''
    if (getAgentStore().isOpen) {
      getAgentStore().closePanel()
    }
  }

  /**
   * 添加数据集节点
   */
  const addDatasetNode = () => {
    const existingDatasetNode = nodes.value.find(node => node.type === 'dataset')
    if (existingDatasetNode) {
      ElMessage.warning('画布上已存在数据集节点，无需重复添加')
      return null
    }

    const position = {
      x: 50,
      y: 500
    }

    const newNode = {
      id: `dataset${nodeIdCounter.value++}`,
      type: 'dataset',
      position,
      data: {
        type: 'dataset',
        label: '数据集',
        config: {
          selectedDataset: getAgentStore().agentDatasetVal || '',
          datasets: []
        }
      }
    }

    nodes.value.push(newNode)
    ElMessage.success('已添加数据集节点')
    return newNode
  }

  /**
   * 添加模型节点
   */
  const addModelNode = (systemLlmConfig = null) => {
    const existingModelNode = nodes.value.find(node => node.type === 'model')
    if (existingModelNode) {
      ElMessage.warning('画布上已存在模型配置节点，无需重复添加')
      return null
    }

    const position = {
      x: 800,
      y: 500
    }

    let savedConfig = {
      name: '',
      baseUrl: '',
      apiKey: ''
    }

    if (systemLlmConfig) {
      savedConfig = {
        name: systemLlmConfig.name || '',
        baseUrl: systemLlmConfig.openai_base_url || '',
        apiKey: systemLlmConfig.openai_api_key || ''
      }
    }

    const newNode = {
      id: `model${nodeIdCounter.value++}`,
      type: 'model',
      position,
      data: {
        type: 'model',
        label: '模型配置',
        config: savedConfig
      }
    }

    nodes.value.push(newNode)
    return newNode
  }

  /**
   * 清空画布
   */
  const clearNodes = () => {
    nodes.value = []
    selectedNodeId.value = null
    nodeIdCounter.value = 1
  }

  /**
   * 验证节点必填字段
   */
  const validateRequiredFields = () => {
    const emptyFields = []

    nodes.value.forEach(node => {
      if (node.type === 'dataset') {
        if (!node.data?.config?.selectedDataset) {
          emptyFields.push({
            nodeId: node.id,
            nodeName: '数据集',
            nodeType: 'dataset',
            missingFields: ['数据集选择']
          })
        }
      } else if (isOperatorNode(node)) {
        const operator = node.data?.operator
        if (!operator) return

        const missing = []

        // 检查 run 配置的必填字段
        if (operator.config?.run) {
          Object.keys(operator.config.run).forEach(key => {
            const fieldConfig = operator.config.run[key]
            const userValue = node.data?.runConfig?.[key]

            if (userValue === undefined || userValue === null || userValue === '') {
              if (fieldConfig === null) {
                missing.push(`${key}`)
              }
            }
          })
        }

        // 检查 init 配置的必填字段
        if (operator.config?.init) {
          Object.keys(operator.config.init).forEach(key => {
            const fieldConfig = operator.config.init[key]
            const userValue = node.data?.initConfig?.[key]

            if (userValue === undefined || userValue === null || userValue === '') {
              if (fieldConfig === null) {
                missing.push(`${key}`)
              }
            }
          })
        }

        if (missing.length > 0) {
          emptyFields.push({
            nodeId: node.id,
            nodeName: operator.name,
            nodeType: 'operator',
            missingFields: missing
          })
        }
      }
    })

    return emptyFields
  }

  /**
   * 获取源字段的值
   */
  const getSourceFieldValue = (sourceNodeId, sourceField) => {
    const sourceNode = nodes.value.find(n => n.id === sourceNodeId)
    if (!sourceNode) {
      return undefined
    }

    let value = undefined

    // 处理数据集节点
    if (sourceNode.type === 'dataset') {
      const datasetFields = sourceNode.data?.datasetFields || []
      let actualFieldName = sourceField
      if (sourceField.startsWith('dataset-field-')) {
        actualFieldName = sourceField.replace('dataset-field-', '')
      }

      if (datasetFields.includes(actualFieldName)) {
        if (actualFieldName === 'dataset_id') {
          value = sourceNode.data?.config?.selectedDataset || actualFieldName
        } else {
          value = actualFieldName
        }
      }
    }
    // 处理算子节点
    else if (isOperatorNode(sourceNode)) {
      if (sourceNode.data?.runConfig?.[sourceField] !== undefined) {
        value = sourceNode.data.runConfig[sourceField]
      } else if (sourceNode.data?.initConfig?.[sourceField] !== undefined) {
        value = sourceNode.data.initConfig[sourceField]
      } else {
        const operator = sourceNode.data?.operator
        if (operator?.config?.run?.[sourceField] !== undefined) {
          value = operator.config.run[sourceField]
        } else if (operator?.config?.init?.[sourceField] !== undefined) {
          value = operator.config.init[sourceField]
        }
      }
    }

    return value
  }

  /**
   * 节点数量
   */
  const nodeCount = computed(() => nodes.value.length)

  /**
   * 可以执行(有节点)
   */
  const canExecute = computed(() => nodeCount.value > 0)

  return {
    // State
    nodes,
    selectedNodeId,
    nodeIdCounter,

    // Computed
    nodeCount,
    canExecute,

    // Methods
    isOperatorNode,
    addNode,
    onNodeUpdate,
    onNodeDelete,
    onNodeClick,
    onPaneClick,
    addDatasetNode,
    addModelNode,
    clearNodes,
    validateRequiredFields,
    getSourceFieldValue,
  }
}
