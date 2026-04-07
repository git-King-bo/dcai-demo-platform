import { nextTick } from 'vue'

/**
 * Agent 动画控制 Composable
 * 管理节点和连线的动画效果
 */
export const useAgentAnimation = () => {
  
  /**
   * 为节点添加高亮状态
   * @param {Array} nodes - 节点数组（ref）
   * @param {string} nodeId - 节点ID
   * @param {string} state - 状态类型: 'building' | 'completed' | 'pending' | 'error'
   * @param {number} duration - 高亮持续时间（毫秒），0表示持续显示
   */
  const highlightNode = (nodes, nodeId, state, duration = 2000) => {
    const nodeIndex = nodes.value.findIndex(n => n.id === nodeId)
    if (nodeIndex >= 0) {
      // 添加高亮状态
      if (!nodes.value[nodeIndex].data) {
        nodes.value[nodeIndex].data = {}
      }
      
      nodes.value[nodeIndex].data._highlightState = state
      nodes.value[nodeIndex].data._agentCreated = true
      
      // 添加对应的 class
      const classList = nodes.value[nodeIndex].class || ''
      const newClass = `${classList} node-${state}`.trim()
      nodes.value[nodeIndex].class = newClass
      
      // 如果设置了持续时间，定时移除高亮
      if (duration > 0 && state === 'completed') {
        setTimeout(() => {
          const idx = nodes.value.findIndex(n => n.id === nodeId)
          if (idx >= 0 && nodes.value[idx].data) {
            nodes.value[idx].data._highlightState = null
            // 移除高亮 class
            nodes.value[idx].class = (nodes.value[idx].class || '')
              .replace(/node-(building|completed|pending|error)/g, '')
              .trim()
          }
        }, duration)
      }
    }
  }
  
  /**
   * 移除节点高亮
   * @param {Array} nodes - 节点数组（ref）
   * @param {string} nodeId - 节点ID
   */
  const removeNodeHighlight = (nodes, nodeId) => {
    const nodeIndex = nodes.value.findIndex(n => n.id === nodeId)
    if (nodeIndex >= 0 && nodes.value[nodeIndex].data) {
      nodes.value[nodeIndex].data._highlightState = null
      nodes.value[nodeIndex].class = (nodes.value[nodeIndex].class || '')
        .replace(/node-(building|completed|pending|error)/g, '')
        .trim()
    }
  }
  
  /**
   * 聚焦到指定节点（平滑移动视图）
   * @param {object} vueFlowInstance - VueFlow 实例
   * @param {Array} nodes - 节点数组
   * @param {string} nodeId - 节点ID
   * @param {object} options - 配置选项
   */
  const focusOnNode = (vueFlowInstance, nodes, nodeId, options = {}) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node || !vueFlowInstance) return
    
    const {
      duration = 800,
      zoom = null,
      padding = 100
    } = options
    
    // 使用 VueFlow 的 fitView 方法
    nextTick(() => {
      vueFlowInstance.fitView({
        nodes: [nodeId],
        duration,
        padding,
        ...(zoom && { maxZoom: zoom, minZoom: zoom })
      })
    })
  }
  
  /**
   * 聚焦到多个节点（显示所有节点）
   * @param {object} vueFlowInstance - VueFlow 实例
   * @param {Array} nodeIds - 节点ID数组
   * @param {object} options - 配置选项
   */
  const focusOnMultipleNodes = (vueFlowInstance, nodeIds, options = {}) => {
    if (!vueFlowInstance || !nodeIds || nodeIds.length === 0) return
    
    const {
      duration = 800,
      padding = 100
    } = options
    
    nextTick(() => {
      vueFlowInstance.fitView({
        nodes: nodeIds,
        duration,
        padding
      })
    })
  }
  
  /**
   * 为连线添加动画效果
   * @param {Array} edges - 连线数组（ref）
   * @param {string} edgeId - 连线ID
   * @param {string} animationType - 动画类型: 'drawing' | 'completed'
   */
  const animateEdge = (edges, edgeId, animationType = 'drawing') => {
    const edgeIndex = edges.value.findIndex(e => e.id === edgeId)
    if (edgeIndex >= 0) {
      // 添加动画class
      edges.value[edgeIndex].class = `agent-${animationType}-edge`
      edges.value[edgeIndex].animated = true
      
      // 如果是绘制动画，完成后切换到完成状态
      if (animationType === 'drawing') {
        setTimeout(() => {
          const idx = edges.value.findIndex(e => e.id === edgeId)
          if (idx >= 0) {
            edges.value[idx].class = 'edge-completed'
            // 再过一段时间移除动画
            setTimeout(() => {
              const i = edges.value.findIndex(e => e.id === edgeId)
              if (i >= 0) {
                edges.value[i].class = ''
                edges.value[i].animated = false
              }
            }, 500)
          }
        }, 1500)
      }
    }
  }
  
  /**
   * 添加节点入场动画
   * @param {Array} nodes - 节点数组（ref）
   * @param {string} nodeId - 节点ID
   * @param {number} delay - 延迟时间（毫秒）
   */
  const addNodeEnterAnimation = (nodes, nodeId, delay = 0) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nodeIndex = nodes.value.findIndex(n => n.id === nodeId)
        if (nodeIndex >= 0) {
          console.log(`[Agent Animation] 🎬 开始入场动画:`, {
            nodeId,
            nodeIndex,
            positionBefore: nodes.value[nodeIndex].position,
            styleBefore: nodes.value[nodeIndex].style
          })
          
          // 设置初始状态
          if (!nodes.value[nodeIndex].style) {
            nodes.value[nodeIndex].style = {}
          }
          
          // 🔧 修复：只使用 opacity 动画，不使用 transform scale
          // transform scale 会与 Vue Flow 的内部定位机制冲突
          nodes.value[nodeIndex].style = {
            ...nodes.value[nodeIndex].style,
            opacity: 0
            // ❌ 移除: transform: 'scale(0.8)' - 这会破坏 Vue Flow 的定位
          }
          
          console.log(`[Agent Animation] 📝 设置初始样式后:`, {
            nodeId,
            position: nodes.value[nodeIndex].position,
            style: nodes.value[nodeIndex].style
          })
          
          // 触发动画
          nextTick(() => {
            const idx = nodes.value.findIndex(n => n.id === nodeId)
            if (idx >= 0) {
              console.log(`[Agent Animation] 🔄 nextTick中，准备应用最终样式:`, {
                nodeId,
                positionBeforeAnimation: nodes.value[idx].position
              })
              
              // 🔧 修复：只动画 opacity，不动画 transform
              nodes.value[idx].style = {
                ...nodes.value[idx].style,
                opacity: 1,
                // ❌ 移除: transform: 'scale(1)'
                transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }
              
              console.log(`[Agent Animation] ✨ 应用最终样式后:`, {
                nodeId,
                positionAfterAnimation: nodes.value[idx].position,
                style: nodes.value[idx].style
              })
              
              // 动画完成后移除 transition 和 opacity
              setTimeout(() => {
                const i = nodes.value.findIndex(n => n.id === nodeId)
                if (i >= 0 && nodes.value[i].style) {
                  console.log(`[Agent Animation] 🏁 清理transition和style:`, {
                    nodeId,
                    finalPosition: nodes.value[i].position
                  })
                  // 完全清除 style，让节点恢复默认状态
                  delete nodes.value[i].style.transition
                  delete nodes.value[i].style.opacity
                }
                resolve()
              }, 500)
            }
          })
        } else {
          resolve()
        }
      }, delay)
    })
  }
  
  /**
   * 批量添加节点动画
   * @param {Array} nodes - 节点数组（ref）
   * @param {Array} nodeIds - 节点ID数组
   * @param {number} interval - 每个节点之间的间隔（毫秒）
   */
  const addNodesSequentialAnimation = async (nodes, nodeIds, interval = 500) => {
    for (let i = 0; i < nodeIds.length; i++) {
      await addNodeEnterAnimation(nodes, nodeIds[i], i * interval)
    }
  }
  
  /**
   * 脉动动画（用于思考中等状态）
   * @param {Array} nodes - 节点数组（ref）
   * @param {string} nodeId - 节点ID
   * @param {boolean} enable - 是否启用
   */
  const setPulseAnimation = (nodes, nodeId, enable) => {
    const nodeIndex = nodes.value.findIndex(n => n.id === nodeId)
    if (nodeIndex >= 0) {
      const classList = nodes.value[nodeIndex].class || ''
      if (enable) {
        nodes.value[nodeIndex].class = `${classList} node-pulse`.trim()
      } else {
        nodes.value[nodeIndex].class = classList.replace('node-pulse', '').trim()
      }
    }
  }
  
  /**
   * 抖动动画（用于错误提示）
   * @param {Array} nodes - 节点数组（ref）
   * @param {string} nodeId - 节点ID
   */
  const shakeNode = (nodes, nodeId) => {
    const nodeIndex = nodes.value.findIndex(n => n.id === nodeId)
    if (nodeIndex >= 0) {
      const classList = nodes.value[nodeIndex].class || ''
      nodes.value[nodeIndex].class = `${classList} node-shake`.trim()
      
      // 动画结束后移除class
      setTimeout(() => {
        const idx = nodes.value.findIndex(n => n.id === nodeId)
        if (idx >= 0) {
          nodes.value[idx].class = (nodes.value[idx].class || '')
            .replace('node-shake', '')
            .trim()
        }
      }, 600)
    }
  }
  
  /**
   * 清除所有Agent创建的高亮状态
   * @param {Array} nodes - 节点数组（ref）
   */
  const clearAllHighlights = (nodes) => {
    nodes.value.forEach((node, index) => {
      if (node.data?._highlightState) {
        nodes.value[index].data._highlightState = null
        nodes.value[index].class = (node.class || '')
          .replace(/node-(building|completed|pending|error|pulse|shake)/g, '')
          .trim()
      }
    })
  }
  
  return {
    highlightNode,
    removeNodeHighlight,
    focusOnNode,
    focusOnMultipleNodes,
    animateEdge,
    addNodeEnterAnimation,
    addNodesSequentialAnimation,
    setPulseAnimation,
    shakeNode,
    clearAllHighlights
  }
}

