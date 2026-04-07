/**
 * Agent 操作队列管理
 * 
 * 解决问题：
 * - 并发执行导致的竞态条件
 * - add_edge 时目标节点可能还未添加完成
 * - 多个操作同时修改状态导致数据不一致
 * 
 * 核心机制：
 * 1. 所有 Agent 操作（add_node, add_edge）进入队列
 * 2. 队列按顺序执行，每个操作完成后再执行下一个
 * 3. 支持操作依赖关系（如 add_edge 依赖目标 node）
 * 4. 自动重试机制（如节点未就绪则延迟重试）
 */

import { ref, computed } from 'vue'

export function useAgentQueue() {
  // 操作队列
  const queue = ref([])
  
  // 当前正在执行的操作
  const currentOperation = ref(null)
  
  // 队列执行状态
  const isProcessing = ref(false)
  
  // 统计信息
  const stats = ref({
    total: 0,        // 总操作数
    completed: 0,    // 已完成
    failed: 0,       // 失败
    retried: 0       // 重试次数
  })

  /**
   * 将操作加入队列
   * @param {Object} operation - 操作对象
   * @param {string} operation.type - 操作类型：'add_node' | 'add_edge'
   * @param {Object} operation.data - 操作数据
   * @param {Function} operation.handler - 执行函数
   * @param {Object} operation.dependencies - 依赖条件（可选）
   * @param {number} operation.maxRetries - 最大重试次数（默认 3）
   * @returns {Promise} 返回操作完成的 Promise
   */
  function enqueue(operation) {
    return new Promise((resolve, reject) => {
      const queueItem = {
        id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: operation.type,
        data: operation.data,
        handler: operation.handler,
        dependencies: operation.dependencies || null,
        maxRetries: operation.maxRetries || 3,
        retryCount: 0,
        status: 'pending',
        createdAt: Date.now(),
        resolve,
        reject
      }
      
      queue.value.push(queueItem)
      stats.value.total++
      
      console.log(`[AgentQueue] 📥 操作入队: ${queueItem.type} (id: ${queueItem.id})`, {
        queueLength: queue.value.length,
        data: queueItem.data
      })
      
      // 如果队列未在处理，开始处理
      if (!isProcessing.value) {
        processQueue()
      }
    })
  }

  /**
   * 处理队列（主循环）
   */
  async function processQueue() {
    if (isProcessing.value) {
      console.log('[AgentQueue] 队列已在处理中，跳过')
      return
    }
    
    if (queue.value.length === 0) {
      console.log('[AgentQueue] 队列为空，处理完成')
      isProcessing.value = false
      return
    }
    
    isProcessing.value = true
    
    while (queue.value.length > 0) {
      const operation = queue.value[0]
      currentOperation.value = operation
      
      console.log(`[AgentQueue] 开始处理: ${operation.type} (${operation.id})`, {
        queueRemaining: queue.value.length - 1,
        retryCount: operation.retryCount
      })
      
      try {
        // 1. 检查依赖条件
        if (operation.dependencies) {
          const dependenciesMet = await checkDependencies(operation)
          
          if (!dependenciesMet) {
            // 依赖未满足，判断是否需要重试
            if (operation.retryCount < operation.maxRetries) {
              console.log(`[AgentQueue] 依赖未满足，延迟重试 (${operation.retryCount + 1}/${operation.maxRetries})`)
              operation.retryCount++
              stats.value.retried++
              
              // 延迟 500ms 后重试（给依赖操作更多时间）
              await delay(500)
              continue // 重新检查依赖
            } else {
              throw new Error(`依赖条件未满足，已达最大重试次数 (${operation.maxRetries})`)
            }
          }
        }
        
        // 2. 执行操作
        operation.status = 'processing'
        const result = await operation.handler(operation.data)
        
        // 3. 标记完成
        operation.status = 'completed'
        stats.value.completed++
        
        console.log(`[AgentQueue] 操作完成: ${operation.type} (${operation.id})`, {
          result
        })
        
        // 4. 从队列移除
        queue.value.shift()
        
        // 5. resolve Promise
        operation.resolve(result)
        
      } catch (error) {
        console.error(`[AgentQueue] 操作失败: ${operation.type} (${operation.id})`, error)
        
        operation.status = 'failed'
        stats.value.failed++
        
        // 从队列移除失败的操作
        queue.value.shift()
        
        // reject Promise
        operation.reject(error)
      }
      
      // 给浏览器一点时间更新 UI
      await delay(10)
    }
    
    currentOperation.value = null
    isProcessing.value = false
    
    console.log('[AgentQueue] 队列处理完成', {
      stats: stats.value
    })
  }

  /**
   * 检查操作的依赖条件
   * @param {Object} operation - 操作对象
   * @returns {Promise<boolean>} 依赖是否满足
   */
  async function checkDependencies(operation) {
    const { dependencies } = operation
    
    if (!dependencies) return true
    
    // 示例依赖检查逻辑
    // dependencies 格式: { type: 'node_exists', nodeId: 'node4' }
    if (dependencies.type === 'node_exists') {
      const nodeExists = dependencies.checkFn(dependencies.nodeId)
      console.log(`[AgentQueue] 检查依赖: 节点 ${dependencies.nodeId} 是否存在 = ${nodeExists}`)
      return nodeExists
    }
    
    // 其他依赖类型可以在这里扩展
    return true
  }

  /**
   * 清空队列（用于重置）
   */
  function clearQueue() {
    console.log(`[AgentQueue] 清空队列 (${queue.value.length} 个操作)`)
    
    // reject 所有待处理的操作
    queue.value.forEach(op => {
      if (op.status === 'pending') {
        op.reject(new Error('队列已清空'))
      }
    })
    
    queue.value = []
    currentOperation.value = null
    isProcessing.value = false
  }

  /**
   * 获取队列状态
   */
  const queueStatus = computed(() => ({
    length: queue.value.length,
    isProcessing: isProcessing.value,
    currentOperation: currentOperation.value,
    stats: stats.value
  }))

  /**
   * 延迟工具函数
   */
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  return {
    // 核心方法
    enqueue,
    clearQueue,
    
    // 状态
    queue: computed(() => queue.value),
    queueStatus,
    isProcessing: computed(() => isProcessing.value),
    currentOperation: computed(() => currentOperation.value),
    stats: computed(() => stats.value)
  }
}


