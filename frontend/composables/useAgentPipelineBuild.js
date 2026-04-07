import { nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useAgentAnimation } from './useAgentAnimation'

/**
 * Agent Pipeline 构建集成 Composable
 * 将Agent生成的Pipeline应用到画布
 */
export const useAgentPipelineBuild = (nodes, edges, vueFlowInstance) => {
  const {
    highlightNode,
    focusOnNode,
    animateEdge,
    addNodeEnterAnimation
  } = useAgentAnimation()
  
  /**
   * 计算最佳节点位置
   * @param {number} index - 节点索引
   * @param {number} total - 总节点数
   * @param {string} layoutType - 布局类型: 'horizontal' | 'vertical' | 'grid'
   * @returns {object} - {x, y} 坐标
   */
  const calculateOptimalPosition = (index, total = 1, layoutType = 'horizontal') => {
    // 🎯 修复：使用画布坐标系统，与手动添加节点保持一致
    // 参考 OperatorWorkflow.vue 中的 addDatasetNode 和 addModelNode
    // 数据集节点：{ x: 500, y: 500 }
    // 模型节点：{ x: 800, y: 500 }
    // 拖拽算子：基于鼠标位置的画布坐标
    
    // 使用固定的画布坐标，不需要根据视口计算或缩放转换
    const baseX = 500              // 从画布坐标 500 开始（与手动添加的数据集节点一致）
    const baseY = 500              // 固定的 Y 坐标（与手动添加的节点一致）
    const horizontalSpacing = 400  // 横向间距（节点宽度约300px + 100px间隔）
    const verticalSpacing = 300    // 纵向间距
    
    console.log(`[Agent Position] calculateOptimalPosition 调用:`, {
      index,
      total,
      layoutType,
      baseX,
      baseY,
      horizontalSpacing,
      verticalSpacing
    })
    
    switch (layoutType) {
      case 'horizontal':
        // 水平布局
        const horizontalPos = {
          x: baseX + (index * horizontalSpacing),
          y: baseY
        }
        console.log(`[Agent Position] 水平布局计算结果:`, horizontalPos)
        return horizontalPos
      
      case 'vertical':
        // 垂直布局
        return {
          x: baseX,
          y: baseY + (index * verticalSpacing)
        }
      
      case 'grid':
        // 网格布局（每行3个）
        const cols = 3
        const row = Math.floor(index / cols)
        const col = index % cols
        return {
          x: baseX + (col * horizontalSpacing),
          y: baseY + (row * verticalSpacing)
        }
      
      default:
        return { x: baseX, y: baseY }
    }
  }
  
  /**
   * 检查节点位置是否重叠
   * @param {object} position - 要检查的位置
   * @param {Array} existingNodes - 现有节点
   * @returns {boolean}
   */
  const isPositionOverlapping = (position, existingNodes) => {
    const nodeWidth = 300
    const nodeHeight = 200
    const margin = 50
    
    return existingNodes.some(node => {
      if (!node.position) return false
      
      const dx = Math.abs(position.x - node.position.x)
      const dy = Math.abs(position.y - node.position.y)
      
      return dx < (nodeWidth + margin) && dy < (nodeHeight + margin)
    })
  }
  
  /**
   * 找到不重叠的位置
   * @param {number} index - 节点索引
   * @param {Array} existingNodes - 现有节点
   * @param {number} total - 总节点数（用于计算最佳布局）
   * @returns {object} - {x, y} 坐标
   */
  const findNonOverlappingPosition = (index, existingNodes, total = 1) => {
    let position = calculateOptimalPosition(index, total)
    let attempt = 0
    const maxAttempts = 50
    
    while (isPositionOverlapping(position, existingNodes) && attempt < maxAttempts) {
      // 尝试在附近找一个新位置
      position = {
        x: position.x + (attempt % 2 === 0 ? 100 : -100),
        y: position.y + Math.floor(attempt / 2) * 50
      }
      attempt++
    }
    
    return position
  }
  
  /**
   * 添加单个节点（带动画）
   * @param {object} nodeData - 节点数据
   * @param {number} index - 节点索引
   * @param {number} total - 总节点数
   * @returns {Promise}
   */
  const addNodeWithAnimation = (nodeData, index = 0, total = 1) => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          // ⚠️ 重要：使用实时的节点数量作为布局索引
          // 因为多个节点异步添加时，传入的 index 可能不准确
          const actualIndex = nodes.value.length
          
          // 计算位置
          console.log(`[Agent Position] 开始计算节点位置:`, {
            nodeId: nodeData.id,
            passedIndex: index,
            actualIndex,
            total,
            hasPosition: !!nodeData.position,
            currentNodesCount: nodes.value.length
          })
          
          const position = nodeData.position || 
            findNonOverlappingPosition(actualIndex, nodes.value, total)
          
          console.log(`[Agent Position] 计算得到位置:`, {
            nodeId: nodeData.id,
            position,
            actualIndex,
            total
          })
          
          // 创建节点对象
          const newNode = {
            id: nodeData.id || `node_${Date.now()}_${index}`,
            type: nodeData.type || 'operator',
            position,
            draggable: true,  // 确保节点可拖拽
            selectable: true,  // 确保节点可选中
            data: {
              ...nodeData.data,
              _agentCreated: true,
              _createdAt: new Date().toISOString()
            }
          }
          
          console.log(`[Agent Position] 创建的节点对象:`, {
            id: newNode.id,
            type: newNode.type,
            position: newNode.position
          })
          
          // 添加到画布
          nodes.value.push(newNode)
          
          console.log(`[Agent Position] 节点已添加到画布:`, {
            nodeId: newNode.id,
            position: newNode.position,
            nodesCount: nodes.value.length,
            actualNodeInArray: nodes.value.find(n => n.id === newNode.id)?.position
          })
          
          // 🔧 使用 nextTick 确保 Vue Flow 已经处理了新节点
          await nextTick()
          
          console.log(`[Agent Position] nextTick后，位置检查:`, {
            nodeId: newNode.id,
            positionAfterNextTick: nodes.value.find(n => n.id === newNode.id)?.position
          })
          
          // 🔍 完全禁用入场动画进行调试
          // 如果禁用动画后位置正确，说明问题确实在动画函数中
          console.log(`[Agent Position] 跳过入场动画，直接高亮...`)
          // await addNodeEnterAnimation(nodes, newNode.id, 0)
          
          console.log(`[Agent Position] 最终位置:`, {
            nodeId: newNode.id,
            finalPosition: nodes.value.find(n => n.id === newNode.id)?.position
          })
          
          // 高亮显示（构建中）
          highlightNode(nodes, newNode.id, 'building', 0)
          
          // 短暂延迟后显示为完成状态
          setTimeout(() => {
            highlightNode(nodes, newNode.id, 'completed', 2000)
            
            // 不再单独聚焦每个节点，避免画布频繁移动
            // 最终会在 handlePipelineBuild 中聚焦到所有节点
            
            resolve(newNode)
          }, 800)
          
        } catch (error) {
          console.error('[Agent] 添加节点失败:', error)
          ElMessage.error('添加节点失败')
          resolve(null)
        }
      }, index * 500) // 每个节点延迟1秒
    })
  }
  
  /**
   * 添加连线（带动画）
   * @param {object} edgeData - 连线数据
   * @returns {Promise}
   */
  const addEdgeWithAnimation = (edgeData) => {
    return new Promise((resolve) => {
      try {
        const newEdge = {
          id: edgeData.id || `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          source: edgeData.source,
          target: edgeData.target,
          sourceHandle: edgeData.sourceHandle || 'output',
          targetHandle: edgeData.targetHandle || 'input',
          type: edgeData.type || 'default',
          animated: true,
          style: {
            strokeWidth: 2,
            stroke: '#FF6B35'
          }
        }
        
        // 添加到画布
        edges.value.push(newEdge)
        
        // 添加动画
        animateEdge(edges, newEdge.id, 'drawing')
        
        setTimeout(() => {
          resolve(newEdge)
        }, 1500)
        
      } catch (error) {
        console.error('[Agent] 添加连线失败:', error)
        ElMessage.error('添加连线失败')
        resolve(null)
      }
    })
  }
  
  /**
   * 批量添加节点
   * @param {Array} nodeDataList - 节点数据数组
   * @returns {Promise<Array>} - 创建的节点数组
   */
  const addNodesSequentially = async (nodeDataList) => {
    const createdNodes = []
    
    for (let i = 0; i < nodeDataList.length; i++) {
      const node = await addNodeWithAnimation(nodeDataList[i], i, nodeDataList.length)
      if (node) {
        createdNodes.push(node)
      }
    }
    
    return createdNodes
  }
  
  /**
   * 批量添加连线
   * @param {Array} edgeDataList - 连线数据数组
   * @returns {Promise<Array>} - 创建的连线数组
   */
  const addEdgesSequentially = async (edgeDataList) => {
    const createdEdges = []
    
    for (const edgeData of edgeDataList) {
      const edge = await addEdgeWithAnimation(edgeData)
      if (edge) {
        createdEdges.push(edge)
      }
      // 每条连线之间延迟500ms
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    return createdEdges
  }
  
  /**
   * 处理完整的Pipeline构建消息
   * @param {object} buildPayload - Pipeline构建数据
   * @returns {Promise}
   */
  const handlePipelineBuild = async (buildPayload) => {
    const { 
      nodes: buildNodes = [], 
      edges: buildEdges = [], 
      currentStep = null,
      layout = 'horizontal'
    } = buildPayload
    
    try {
      ElMessage.info(`开始构建Pipeline，共 ${buildNodes.length} 个节点`)
      
      // 1. 批量添加节点
      const createdNodes = await addNodesSequentially(buildNodes)
      
      if (createdNodes.length > 0) {
        ElMessage.success(`成功添加 ${createdNodes.length} 个节点`)
      }
      
      // 2. 如果有连线，添加连线
      if (buildEdges.length > 0) {
        const createdEdges = await addEdgesSequentially(buildEdges)
        
        if (createdEdges.length > 0) {
          ElMessage.success(`成功创建 ${createdEdges.length} 条连线`)
        }
      }
      
      // 3. 不再自动聚焦节点，避免画布移动影响用户体验
      // 节点已经按照最佳位置布局，用户可以手动缩放或点击"适应画布"查看全部
      // 如果需要聚焦，可以取消注释下面的代码
      /*
      if (vueFlowInstance && createdNodes.length > 0) {
        const lastNodeDelay = (createdNodes.length - 1) * 1000
        const animationDuration = 500 + 800
        const bufferTime = 500
        const totalDelay = lastNodeDelay + animationDuration + bufferTime
        
        setTimeout(() => {
          const nodeIds = createdNodes.map(n => n.id)
          vueFlowInstance.fitView({
            nodes: nodeIds,
            duration: 0,
            padding: 100
          })
        }, totalDelay)
      }
      */
      
      ElMessage.success('Pipeline构建完成！', {
        duration: 3000
      })
      
      return {
        nodes: createdNodes,
        edges: buildEdges
      }
      
    } catch (error) {
      console.error('[Agent] Pipeline构建失败:', error)
      ElMessage.error('Pipeline构建失败，请重试')
      return null
    }
  }
  
  /**
   * 修改节点配置
   * @param {string} nodeId - 节点ID
   * @param {object} newConfig - 新配置
   */
  const updateNodeConfig = (nodeId, newConfig) => {
    const nodeIndex = nodes.value.findIndex(n => n.id === nodeId)
    if (nodeIndex >= 0) {
      nodes.value[nodeIndex].data = {
        ...nodes.value[nodeIndex].data,
        ...newConfig,
        _updatedAt: new Date().toISOString()
      }
      
      // 短暂高亮显示修改
      highlightNode(nodes, nodeId, 'building', 500)
      setTimeout(() => {
        highlightNode(nodes, nodeId, 'completed', 1500)
      }, 500)
      
      ElMessage.success('节点配置已更新')
    }
  }
  
  /**
   * 删除Agent创建的所有节点
   */
  const clearAgentNodes = () => {
    const agentNodeIds = nodes.value
      .filter(n => n.data?._agentCreated)
      .map(n => n.id)
    
    nodes.value = nodes.value.filter(n => !n.data?._agentCreated)
    
    // 同时删除相关连线
    edges.value = edges.value.filter(e => 
      !agentNodeIds.includes(e.source) && !agentNodeIds.includes(e.target)
    )
    
    ElMessage.info(`已清除 ${agentNodeIds.length} 个Agent创建的节点`)
  }
  
  return {
    calculateOptimalPosition,
    addNodeWithAnimation,
    addEdgeWithAnimation,
    addNodesSequentially,
    addEdgesSequentially,
    handlePipelineBuild,
    updateNodeConfig,
    clearAgentNodes
  }
}

