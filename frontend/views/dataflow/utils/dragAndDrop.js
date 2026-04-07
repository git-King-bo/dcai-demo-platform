/**
 * 拖放相关工具函数
 */

/**
 * 处理拖拽开始事件
 */
export const onDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
}

/**
 * 处理节点拖放到画布
 */
export const handleNodeDrop = async (event, nodes, operators, nodeIdCounter, addNode) => {
  event.preventDefault()

  try {
    const droppedData = JSON.parse(event.dataTransfer.getData('application/json'))

    if (droppedData.type === 'template') {
      return { type: 'template', data: droppedData }
    }

    const operatorData = droppedData
    const bounds = event.currentTarget.getBoundingClientRect()

    const position = {
      x: event.clientX - bounds.left - 100,
      y: event.clientY - bounds.top - 50
    }

    // 确定节点类型
    let nodeType = determineNodeType(operatorData)

    // 防止节点ID冲突
    let maxId = nodes.reduce((max, node) => {
      const idNum = parseInt(node.id.replace('node', ''))
      return idNum > max ? idNum : max
    }, 0)

    const newNode = {
      id: `node${maxId + 1}`,
      type: nodeType,
      position,
      data: {
        operator: operatorData,
        config: {}
      }
    }

    addNode(newNode)
    return { type: 'node', data: newNode }
  } catch (error) {
    console.error('添加节点失败:', error)
    return { type: 'error', error }
  }
}

/**
 * 根据算子信息确定节点类型
 */
export const determineNodeType = (operatorData) => {
  if (operatorData.id === 'parser_mineru_parser_mineruparser') {
    return 'mineruOperator'
  } else if (operatorData.id === 'parser_uniparser_uniparser') {
    return 'uniParserOperator'
  } else if (operatorData.id === 'PromptTemplatedGenerator') {
    return 'promptTemplatedGeneratorOperator'
  } else if (operatorData.type === 'train') {
    return 'trainOperator'
  } else {
    return 'operator'
  }
}

/**
 * 计算放置位置
 */
export const calculateDropPosition = (event) => {
  const bounds = event.currentTarget.getBoundingClientRect()
  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top
  }
}
