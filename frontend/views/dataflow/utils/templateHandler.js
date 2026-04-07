/**
 * 模板处理相关工具函数
 */
import { nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchLibOperators } from '@//api/dataflow.js'

/**
 * 应用连接值传播
 */
export const applyConnectionValues = (edges, getMergedValueForTargetPort, determineFieldCategory, onNodeUpdate) => {
  console.log('开始应用连接值传播...')

  const targetPortConnections = new Map()

  edges.value.forEach(edge => {
    if (edge.target && edge.targetHandle) {
      const targetPortKey = `${edge.target}.${edge.targetHandle}`
      if (!targetPortConnections.has(targetPortKey)) {
        targetPortConnections.set(targetPortKey, [])
      }
      targetPortConnections.get(targetPortKey).push(edge)
    }
  })

  console.log(`找到 ${targetPortConnections.size} 个目标端口需要处理`)

  let updatedCount = 0
  targetPortConnections.forEach((connections, targetPortKey) => {
    const [targetNodeId, targetField] = targetPortKey.split('.')

    const mergedValue = getMergedValueForTargetPort(targetNodeId, targetField)

    if (mergedValue !== undefined) {
      const targetCategory = determineFieldCategory(targetNodeId, targetField)

      if (targetCategory === 'run') {
        onNodeUpdate(targetNodeId, {
          runConfig: { [targetField]: mergedValue },
          _fromConnection: true
        })
        updatedCount++
      } else if (targetCategory === 'init') {
        onNodeUpdate(targetNodeId, {
          initConfig: { [targetField]: mergedValue },
          _fromConnection: true
        })
        updatedCount++
      }
    }
  })

  console.log(`连接值传播完成，共更新 ${updatedCount} 个字段`)
}

/**
 * 构建模板节点映射
 */
export const buildNodeIdMapping = (templateNodes) => {
  const oldIdToNewIdMap = new Map()
  let nodeIdCounter = 1

  templateNodes.forEach((templateNode, index) => {
    const newId = templateNode.id || `node${nodeIdCounter++}`
    if (templateNode.id) {
      oldIdToNewIdMap.set(templateNode.id, newId)
    } else {
      oldIdToNewIdMap.set(`node${index + 1}`, newId)
    }
  })

  return oldIdToNewIdMap
}

/**
 * 创建模板节点
 */
export const createTemplateNode = (templateNode, position, operators, nodeIdCounter) => {
  if (templateNode.type === 'dataset') {
    return {
      id: `dataset${nodeIdCounter.value++}`,
      type: 'dataset',
      position,
      data: {
        type: 'dataset',
        label: '数据集',
        config: templateNode.config || {
          selectedDataset: '',
          datasets: []
        }
      }
    }
  }

  if (templateNode.type === 'model') {
    return {
      id: `model${nodeIdCounter.value++}`,
      type: 'model',
      position,
      data: {
        type: 'model',
        label: '模型配置',
        config: templateNode.config || {
          name: '',
          baseUrl: '',
          apiKey: ''
        }
      }
    }
  }

  // 算子节点
  const operatorName = templateNode.name || templateNode.operator?.name
  const fullOperator = operators.value.find(op => op.name.toLowerCase() === operatorName.toLowerCase())

  if (!fullOperator) {
    console.error(`算子 "${operatorName}" 在算子库中未找到`)
    return null
  }

  let nodeType = 'operator'
  if (fullOperator.id === 'parser_mineru_parser_mineruparser') {
    nodeType = 'mineruOperator'
  } else if (fullOperator.id === 'parser_uniparser_uniparser') {
    nodeType = 'uniParserOperator'
  } else if (fullOperator.type === 'train') {
    nodeType = 'trainOperator'
  }

  const savedRunConfig = templateNode.config?.run || {}
  const savedInitConfig = templateNode.config?.init || {}

  return {
    id: templateNode.id || `node${nodeIdCounter.value++}`,
    type: nodeType,
    position: templateNode?.position || position,
    data: {
      operator: fullOperator,
      runConfig: savedRunConfig,
      initConfig: savedInitConfig,
      config: {}
    }
  }
}

/**
 * 计算网格布局位置
 */
export const calculateGridPosition = (index, startPosition = null) => {
  const LAYOUT_CONFIG = {
    NODES_PER_ROW: 4,
    HORIZONTAL_SPACING: 360,
    VERTICAL_SPACING: 480,
    START_X: 320,
    START_Y: 400
  }

  const start = startPosition || {
    x: LAYOUT_CONFIG.START_X,
    y: LAYOUT_CONFIG.START_Y
  }

  const row = Math.floor(index / LAYOUT_CONFIG.NODES_PER_ROW)
  const col = index % LAYOUT_CONFIG.NODES_PER_ROW

  return {
    x: start.x + (col * LAYOUT_CONFIG.HORIZONTAL_SPACING),
    y: start.y + (row * LAYOUT_CONFIG.VERTICAL_SPACING)
  }
}

/**
 * 预加载第三方算子
 */
export const preloadLibOperators = async (operators, categorizeOperator) => {
  try {
    const response = await fetchLibOperators()
    if (response.code === 0 && response.data && response.data.list) {
      const libOperators = response.data.list

      libOperators.forEach(op => {
        const category = categorizeOperator(op.type || op.name)
        const existingIndex = operators.value.findIndex(item => item.id === op.id)

        if (existingIndex >= 0) {
          operators.value[existingIndex] = { ...op, category }
        } else {
          operators.value.push({ ...op, category })
        }
      })
    }
  } catch (error) {
    console.error('预加载第三方算子失败:', error)
  }
}
