import { ref, onUnmounted, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { io } from 'socket.io-client'
import { useAgentStore } from '@/store/modules/agent'
// import { useUserStore } from '@/store/modules/user'
import {
  createConversation,
  getConversationList,
  getConversationDetail,
  deleteConversation
} from '@/api/dataflow'

// ========== Agent API 辅助函数 ==========
/**
 * 处理 Agent API 的特殊响应格式
 * Agent API 使用 code: 200 表示成功，但拦截器只认 code: 0
 * 这会导致成功的响应被当作错误处理
 */
const handleAgentApiResponse = (apiPromise) => {
  return apiPromise.catch(err => {
    // 如果 code 是 200 且有 data，说明实际是成功响应
    if (err.code === 200 && err.data !== undefined) {
      return err // 返回原始响应
    }
    throw err // 真正的错误继续抛出
  })
}

// ========== 全局单例消息处理器 ==========
// 注意：这是模块级变量，所有 useAgentWebSocket() 调用共享同一个处理器对象
// 这样在任何地方调用 setMessageHandlers 都会影响到所有实例
const globalMessageHandlers = {
  onThought: () => { },
  onPlan: () => { },
  onAction: () => { },
  onError: () => { },
  onComplete: () => { },
  onRunStarted: () => { },
  onPlanDecision: () => { },
  onRunFinished: () => { },
  onStateUpdate: () => { },
  onAgentEvent: () => { },
  pipelineDebugLlog: () => { },
  operatorExplanation: () => { },
  questionClosely: () => { },
  onMessageConfirm: () => { }
}

/**
 * Agent WebSocket 连接管理 Composable
 * 使用 Socket.io 实现实时双向通信
 * 支持模拟模式用于开发测试
 */
export const useAgentWebSocket = (options = {}) => {
  let agentStore = null
function getAgentStore() {
  if (!agentStore) {
    agentStore = useAgentStore()
  }
  return agentStore
}
  // const userStore = useUserStore()
  const socket = ref(null)
  const isConnected = ref(false)
  const isSessionJoined = ref(false)
  const sessionId = ref('')
  const sessionIdCopy = ref('')
  const edgeIndex = ref(1)
  const maxReconnectAttempts = 5
  const isReconnecting = ref(false)
  const localSessionMap = ref([])
  // 会话管理相关状态
  const currentConversationId = ref(null)
  const conversationTitle = ref('')
  const isSavingConversation = ref(false)

  // 配置选项
  const { autoConnect = true } = options

  // 判断前后type是否一致
  const isSameType = ref(null)
  // 判断前后返回时间是否一致
  const isSameTime = ref(null)

  // 从环境变量获取配置
  const WS_URL = import.meta.env.VITE_AGENT_WS_URL

  // 使用全局单例处理器（向后兼容）
  const messageHandlers = globalMessageHandlers

  /**
   * 生成会话ID
   * @returns {string} - 格式: userId_timestamp
   */
  const generateSessionId = () => {
    // 从 userStore 获取用户信息，如果没有则使用默认值
    const userId ='27' || userStore.info?.id
    const timestamp = Date.now()
    return `${userId}_${timestamp}`
  }

  /**
   * 加入会话
   */
  const joinSession = () => {
    if (!socket.value || !isConnected.value) {
      console.error('[Agent] 无法加入会话：Socket未连接')
      return false
    }

    // 生成新的 session_id
    sessionId.value = sessionIdCopy.value || generateSessionId()
    sessionIdCopy.value = ''
    const payload = {
      type: 'system',
      payload: {
        event: 'join_session',
        session_id: sessionId.value
      }
    }

    console.log('[Agent] 请求加入会话:', payload)
    socket.value.emit('message', payload)

    return true
  }
  /**
   * ack确认会话
   */
  const ackSession = async (id) => {
    const payload = {
      id
    }
    console.log('ack握手', id);

    socket.value.emit('ack', payload)
    return true
  }
  const cacheTime = ref(Date.now())
  const cacheIdArr = ref([])
  /**
   * 建立 Socket.io 连接
   */
  const connect = () => {
    try {
      // 如果已经有连接且已连接，直接返回
      if (socket.value && isConnected.value) {
        console.log('[Agent] 已存在活动连接，跳过重复连接')
        return
      }

      // 如果存在旧连接但未连接，先断开
      if (socket.value) {
        console.log('[Agent] 断开旧连接')
        socket.value.disconnect()
        socket.value = null
      }

      // ========== 判断是否使用模拟模式 ==========
  
        console.log('[Agent] 使用真实连接:', WS_URL)
        // 创建 Socket.io 实例
        socket.value = io(WS_URL, {
          // path:"/dataflow/socket.io",
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: maxReconnectAttempts,
          timeout: 10000
        })

      // ========== 注册事件监听器（模拟和真实共用） ==========

      // 连接成功
      socket.value.on('connect', () => {
        console.log('[Agent] 连接成功')
        isConnected.value = true
        getAgentStore().setConnected(true)
        getAgentStore().setSocket(socket.value)
        getAgentStore().resetReconnectAttempts()
        // getAgentStore().preSessionId = ''
        // 连接成功后自动加入会话
        joinSession()
      })

      // 接收系统消息（会话相关）
      socket.value.on('message', (data) => {
        console.log('[Agent] 收到系统消息:', data)
        // 缓存data.id 10秒内如果有相同的就不执行此次操作，同时清空缓存
        // cacheIdArr.value.push(data.id)
        // if(cacheIdArr.value.includes(data.id) ){
        //   return
        // }
        // if(Date.now() - cacheTime.value < 10000) {
        //   cacheIdArr.value = []
        //   cacheTime.value = Date.now()
        // }

        // 确认会话
        // ackSession(data.id)
        // 处理系统消息（会话加入）
        // if(getAgentStore().preSessionId) return
        if (data.type === 'system' && data.payload?.event === 'session_joined') {
          isSessionJoined.value = true
          console.log('[Agent] 会话已加入:', data.payload.session_id)
          return
        }
        // setTimeout(() => {
        //   localStorage.setItem('localSessionMap',JSON.stringify(localSessionMap.value))
        // }, 50000);
        // console.log(localSessionMap.value,'localSessionMap.value');
        // 处理 agent_message 消息
        if (data.type === 'agent_message') {
          // 判断是否和上一条消息时间一致
          if(isSameTime.value === data?.timestamp) return
          isSameTime.value = data?.timestamp

          // 处理表单更新确认消息
          if (data.payload?.type === 'form_update_received') {
            const content = data.payload.content
            console.log('[Agent] 表单更新已接收:', content)
            ElMessage.success(content.message || '表单更新已接收')

            // 自动发送确认执行消息
            // sendUserMessage('确认执行')
            return
          }

          // 处理表单更新消息
          if (data.payload?.type === 'form_update') {
            // 处理表单会话
            if (data.payload?.data?.form_session) {
              const formSession = data.payload.data.form_session
              console.log('[Agent] 表单会话:', formSession)
              // 判断formSession.form_data.fields对象中是否存在task_goal键
              // if('task_goal' in formSession.form_data.fields){
              //   localSessionMap.value.push(data)
              // }

              // 保存到 store
              getAgentStore().setFormSession(formSession)
              setTimeout(() => {
                messageHandlers.onStateUpdate(data.payload)
                sendSessionLog()
              }, 3000);
              // 触发表单处理器
            }
            return
          }
          localSessionMap.value.push(data)
          // 当前对话完成
          if (data.payload?.type === 'instruction') {

            const eventContent = data.payload
            if (eventContent.all_statuses) {
              messageHandlers.onMessageConfirm(eventContent)
              sendSessionLog()
            }
            return
          }
          if (data.payload?.type === 'question_closely') {
            const content = data.payload.content
            console.log('[Agent] 问题描述追问:', content)
            messageHandlers.questionClosely(content)
            return
          }
          // 处理 pipeline 更新消息
          if (data.payload?.type === 'pipeline_update') {
            console.log('[Agent] 收到 pipeline 更新:', data.payload)

            try {
              // 从 generated_codes 中提取 pipeline 结构
              const generatedCodes = data.payload?.content?.generated_codes
              if (!generatedCodes || generatedCodes.length === 0) {
                console.error('[Agent] pipeline_update 中没有 generated_codes')
                return
              }

              // 提取最后一个 generated_code 的 content（最新版本）
              const lastGeneratedCode = generatedCodes[generatedCodes.length - 1]
              console.log(lastGeneratedCode, 'lastGeneratedCode');
              const randomNum = Math.floor(Math.random() * 100000)
              const modality = data.payload?.content?.modality || randomNum // 模态名称
              const total_modalities = data.payload?.content?.total_modalities || 1 // 总模态数量
              const modality_num = data.payload?.content?.modality_num || 1 // 当前模态数量
              // 判断lastGeneratedCode.content是否为json格式，如果是则转换为json对象
              // if(typeof lastGeneratedCode.content === 'string'){
              //   lastGeneratedCode.content = JSON.parse(lastGeneratedCode.content)
              // }
              const pipelinContent = lastGeneratedCode
              const contentNodes = pipelinContent.nodes
              const contentEdges = pipelinContent.edges
              // 使用固定的画布坐标，不需要根据视口计算或缩放转换
              const baseX = 500      // 从画布坐标 500 开始（与手动添加的数据集节点一致）
              const baseY = modality_num == 1 && total_modalities > 1 ? 180 : 400  // 固定的 Y 坐标（与手动添加的节点一致）
              const horizontalSpacing = 400  // 横向间距（节点宽度约300px + 100px间隔）
              const verticalSpacing = 300    // 纵向间距
              // 处理contentEdges 如果数组长度大于0 则给id字段前面拼接modality
              if (contentEdges.length > 0) {
                // contentEdges.forEach(edge => {
                //   edge.source = modality + '_' + edge.source
                //   edge.target = modality + '_' + edge.target
                // })
              }
              // 处理contentNodes 如果数组长度大于0 则给id字段前面拼接modality
              if (contentNodes.length > 0) {
                contentNodes.forEach((node, index) => {
                  // node.id = modality + '_' + node.id,
                    node.modality_num = modality_num
                  node.position = {
                    x: baseX + (index * horizontalSpacing),
                    y: baseY * modality_num + (modality_num >= 3 ? 300 : 0)
                  }
                  console.log(node.id, baseY * modality_num, node.position, 'baseY * modality_num');

                })
                if (modality_num == 1) {
                  // 数据集节点放在左上角
                    const position = {
                      x: 50,  // 左边留出空间
                      y: 500   // 顶部留出空间
                    }

                    const newNode = {
                      id: `dataset1`,
                      type: 'dataset',
                      position,
                      data: {
                        type: 'dataset',
                        label: '数据集',
                        config: {
                          selectedDataset: getAgentStore().agentDatasetVal || '',
                          datasets: [] // Available datasets list
                        }
                      }
                    }
                  contentNodes.push(newNode)
                  // setTimeout(() => {
                  //   const newNode = {
                  //     action: 'add_datasetNode',
                  //   }
                  //   messageHandlers.onAction(newNode)
                  // })
                }
                // contentNodes[0].name==='UniParser' ? 'input_paths' :
                contentEdges.push({
                  id: `el-edge${edgeIndex.value++}`,
                  source: 'dataset1',
                  source_port: 'dataset-field-dataset_id',
                  target: contentNodes[0].id,
                  target_port: contentNodes[0].name === 'UniParser' ? 'input_paths' : `${contentNodes[0].id}-node-input`,
                  animated: true,
                })
                console.log('contentEdges = ', contentEdges)
              }
              // 处理好数据赋值给新数组
              const pipelineData = {
                pipeline_config:{
                nodes: contentNodes,
                edges: contentEdges
                }

              }
              messageHandlers.onAction(pipelineData)
              return
              console.log('[Agent] 解析得到 pipeline 数据 (共 %d 个版本，使用最后一个):', generatedCodes.length, pipelineData)

              // 转换为 agent:action 消息，直接调用处理器
              const { nodes = [], edges = [] } = pipelineData

              // 先触发所有节点的添加 - 直接调用 onAction 处理器
              nodes.forEach((node, index) => {
                // setTimeout(() => {
                const actionData = {
                  action: 'add_node',
                  data: {
                    id: node.id,
                    type: node.type || 'operator',
                    position: node.position,
                    modality_num: node.modality_num || '',
                    data: {
                      operator: {
                        id: node.name,
                        name: node.name,
                        config: node.config || {}
                      }
                    }
                  },
                  status: 'success',
                  progress: { current: index + 1, total: nodes.length }
                }
                console.log(`[Agent] 直接调用 onAction 添加节点 ${index + 1}/${nodes.length}:`, actionData)
                messageHandlers.onAction(actionData)
                // }, index * 50) // 每个节点延迟100ms，避免消息过快
              })

              // 等待所有节点添加完成后，再添加连线
              const totalNodesDelay = nodes.length * 100 + 1000
              setTimeout(() => {
                edges.forEach((edge, index) => {
                  // setTimeout(() => {
                  const actionData = {
                    action: 'add_edge',
                    data: {
                      id: edge.id || `edge_${edge.source}_${edge.target}`,
                      source: edge.source,
                      target: edge.target,
                      source_port: edge.source_port || 'output',
                      target_port: edge.target_port || 'input'
                    },
                    status: 'success',
                    progress: { current: index + 1, total: edges.length }
                  }
                  console.log(`[Agent] 直接调用 onAction 添加连线 ${index + 1}/${edges.length}:`, actionData)
                  messageHandlers.onAction(actionData)
                  // }, index * 100)
                })
              }, totalNodesDelay)
              const modalityMap = {
                text: '文本',
                image: '图片',
                audio: '音频',
                video: '视频',

              }
              ElMessage.success(`开始构建${modalityMap[modality]}Pipeline：${nodes.length} 个节点，${edges.length} 条连线`)

            } catch (error) {
              console.error('[Agent] 处理 pipeline_update 失败:', error)
              // ElMessage.error('Pipeline 数据解析失败: ' + error.message)
            }

            return
          }
          if (data.payload?.type === 'pipeline_debug_update' && data.payload?.content) {
            const eventContent = data.payload.content
            // getAgentStore().setThinking(true)
            messageHandlers.pipelineDebugLlog(eventContent)
            return
          }
          if (data.payload?.type === 'operator_explanation' && data.payload?.content) {
            const eventContent = data.payload.content
            // getAgentStore().setThinking(true)
            messageHandlers.operatorExplanation(eventContent)
            return
          }
          if (data.payload?.type === 'agent_event') {
            const eventContent = data.payload.content

            // 根据事件类型分发处理
            switch (eventContent.type) {
              case 'run_started':
                console.log('[Agent] 运行开始:', eventContent)
                // getAgentStore().closePanel() // 注释掉：让 panel 保持打开，由画布节点数量控制显示模式
                //把所有data.payload?.type === 'pipeline_update'的消息队列都从localSessionMap.value数组中移除
                localSessionMap.value = localSessionMap.value.filter(item => item.payload?.type !== 'pipeline_update')
                getAgentStore().messages = getAgentStore().messages.filter(item => item.payload?.type !== 'pipeline_update')

                getAgentStore().setThinking(true)
                // messageHandlers.onRunStarted(eventContent)
                break

              // case 'plan_decision':
              //   console.log('[Agent] 计划决策:', eventContent)
              //   messageHandlers.onPlanDecision(eventContent)
              //   break

              case 'run_finished':
                console.log('[Agent] 运行结束:', eventContent)
                getAgentStore().setThinking(false)
                getAgentStore().setExecuting(false)
                messageHandlers.questionClosely(eventContent)

                break

              default:
                console.log('[Agent] 未知agent_event类型:', eventContent.type)
                messageHandlers.onAgentEvent(eventContent)
            }
          }
          return
        }
      })
      // 接收思考消息
      socket.value.on('agent:thought', (data) => {
        console.log('[Agent] 收到思考消息:', data)
        getAgentStore().setThinking(true)
        messageHandlers.onThought(data)
      })

      // 接收计划消息
      socket.value.on('agent:plan', (data) => {
        console.log('[Agent] 收到计划消息:', data)
        getAgentStore().setThinking(false)
        messageHandlers.onPlan(data)
      })

      // 接收操作消息
      socket.value.on('agent:action', (data) => {
        console.log('[Agent] 收到操作消息:', data)
        getAgentStore().setExecuting(true)
        messageHandlers.onAction(data)
      })

      // 接收错误消息
      socket.value.on('agent:error', (data) => {
        console.log('[Agent] 收到错误消息:', data)
        getAgentStore().setThinking(false)
        getAgentStore().setExecuting(false)
        messageHandlers.onError(data)
      })

      // 接收完成消息
      socket.value.on('agent:complete', (data) => {
        console.log('[Agent] 收到完成消息:', data)
        getAgentStore().setExecuting(false)
        messageHandlers.onComplete(data)
      })

      // 连接错误（仅真实模式）
      socket.value.on('connect_error', (error) => {
        console.error('[Agent] 连接错误:', error)
        sessionIdCopy.value = sessionId.value

      })

      // 连接超时（仅真实模式）
      socket.value.on('connect_timeout', () => {
        console.error('[Agent] 连接超时')
        sessionIdCopy.value = sessionId.value

      })

      // 断开连接
      socket.value.on('disconnect', (reason) => {
        console.log('[Agent] 连接断开:', reason)
        isConnected.value = false
        isSessionJoined.value = false
        sessionIdCopy.value = sessionId.value

        // sessionId.value = ''
        getAgentStore().setConnected(false)

        if (reason === 'io server disconnect') {
          // 服务器主动断开，需要手动重连
          socket.value.connect()
        }
      })

      // 重连尝试（仅真实模式）
      socket.value.on('reconnect_attempt', (attemptNumber) => {
        console.log(`[Agent] 尝试重连 (${attemptNumber}/${maxReconnectAttempts})`)
        getAgentStore().incrementReconnectAttempts()
      })

      // 重连失败（仅真实模式）
      socket.value.on('reconnect_failed', () => {
        console.error('[Agent] 重连失败')
        ElMessage.error('DataFlow-Agent连接失败，请刷新页面重试')
      })

      // 重连成功（仅真实模式）
      socket.value.on('reconnect', (attemptNumber) => {
        console.log(`[Agent] 重连成功 (尝试次数: ${attemptNumber})`)
      })

      // 开始连接
      // 注意：Socket.io 默认 autoConnect=true 会自动连接
      getAgentStore().setSocket(socket.value)

    } catch (error) {
      console.error('[Agent] 连接失败:', error)
      ElMessage.error('无法连接到DataFlow-Agent服务')
    }
  }

  /**
   * 断开连接
   */
  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
      isSessionJoined.value = false
      sessionId.value = ''
      getAgentStore().setConnected(false)
      getAgentStore().setSocket(null)
    }
  }

  /**
   * 确保连接可用，如果未连接则尝试重连
   * @returns {Promise<boolean>} - 连接是否成功
   */
  const ensureConnection = async () => {
    // 如果已连接且会话已加入，直接返回成功
    if (isConnected.value && isSessionJoined.value) {
      return true
    }

    // 如果正在重连中，等待重连完成
    if (isReconnecting.value) {
      console.log('[Agent] 正在重连中，请稍候...')
      return false
    }

    // 如果有 socket 但未连接，尝试重连
    if (socket.value && !isConnected.value) {
      console.log('[Agent] 检测到连接断开，尝试重连...')
      isReconnecting.value = true
      try {
        socket.value.connect()
        // 等待连接成功或超时
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('连接超时'))
          }, 5000)

          const checkConnection = setInterval(() => {
            if (isConnected.value && isSessionJoined.value) {
              clearTimeout(timeout)
              clearInterval(checkConnection)
              resolve()
            }
          }, 100)
        })
        isReconnecting.value = false
        return true
      } catch (error) {
        console.error('[Agent] 重连失败:', error)
        isReconnecting.value = false
        return false
      }
    }

    // 如果没有 socket，需要初始化连接
    if (!socket.value) {
      console.log('[Agent] 未初始化，开始连接...')
      connect()
      return false
    }

    return false
  }

  /**
   * 发送用户消息
   * @param {string} text - 用户输入的文本
   * @param {object} context - 可选的上下文信息
   */
  const sendUserMessage = async (text, context = {}) => {
    // 确保连接可用
    const connected = await ensureConnection()
    if (!connected) {
      ElMessage.error('DataFlow-Agent未连接，正在尝试重连...')
      return false
    }
    const payload = {
      type: 'user_message',
      payload: {
        deep_think: getAgentStore().deepThinking, // 是否深度思考
        wf_passthrough: getAgentStore().passThrough, // 是否透传
        text,
        ...(context.operator_names && { operator_names: context.operator_names }),
        session_id: sessionId.value
      }
    }

    console.log('[Agent] 发送用户消息:', payload)
    socket.value.emit('message', payload)

    // 添加到消息历史
    const message = {
      type: 'user_message',
      payload: {
        text
      },
      timestamp: new Date().toISOString()
    }

    localSessionMap.value.push(message)
    getAgentStore().addMessage(message)

    // 如果是新会话的第一条消息，创建会话记录
    if (!currentConversationId.value && getAgentStore().messages.length === 1) {
      await sendSessionLog()
    } else if (currentConversationId.value) {
      // 否则保存消息到现有会话
      await saveMessageToConversation(message)
    }

    return true
  }

  /**
   * 发送确认消息
   * @param {string} action - 'confirm' 或 'reject'
   * @param {string} feedback - 可选的反馈文本
   * @param {string} planId - 计划ID
   */
  const sendConfirmMessage = async (action, feedback = '', planId = '') => {
    // 确保连接可用
    const connected = await ensureConnection()
    if (!connected) {
      ElMessage.error('DataFlow-Agent未连接，正在尝试重连...')
      return false
    }

    const payload = {
      type: 'user_confirm',
      payload: {
        action,
        feedback,
        planId
      }
    }

    console.log('[Agent] 发送确认消息:', payload)
    socket.value.emit('message', payload)
    getAgentStore().clearPendingConfirm()

    return true
  }

  /**
   * 发送修改消息
   * @param {string} nodeId - 节点ID
   * @param {string} text - 修改描述
   * @param {object} currentConfig - 当前配置
   */
  const sendModifyMessage = async (nodeId, text, currentConfig = {}) => {
    // 确保连接可用
    const connected = await ensureConnection()
    if (!connected) {
      ElMessage.error('DataFlow-Agent未连接，正在尝试重连...')
      return false
    }

    const payload = {
      type: 'user_modify',
      payload: {
        nodeId,
        text,
        currentConfig
      }
    }

    console.log('[Agent] 发送修改消息:', payload)
    socket.value.emit('message', payload)

    return true
  }

  /**
   * 发送表单更新消息
   * @param {object} formFields - 表单字段数据
   */
  const sendFormUpdate = async (formFields) => {
    // 确保连接可用
    const connected = await ensureConnection()
    if (!connected) {
      ElMessage.error('DataFlow-Agent未连接，正在尝试重连...')
      return false
    }

    // const payload = {
    //   type: 'form_update',
    //   payload: {
    //     form_data: {
    //       fields: formFields
    //     }
    //   }
    // }
    // 判断formFields对象中是否存在deep_think的key
    const hasDeepThink = 'deep_think' in formFields

    // 采用新表单结构
    const payload = {
      type: 'form_update',
      payload: {
        session_id: sessionId.value,
        type: 'form_update',
        form_data: {
          fields: formFields
        },
        deep_think: getAgentStore().deepThinking || hasDeepThink, // 是否深度思考
        form_complete: true
      }
    }
    getAgentStore().agentFormTask = formFields
    console.log(formFields, 'formFields==>>');

    const formInfo = {
      type: 'agent_message',
      payload: {
        session_id: sessionId.value,
        data: {
          form_session: {
            type: 'form_update',
            form_data: {
              fields: formFields
            },
            requires_user_input: true
          },
          deep_think: getAgentStore().deepThinking, // 是否深度思考
          form_complete: true
        },
        type: 'form_update',
      }
    }
    localSessionMap.value.push(formInfo)
    getAgentStore().addMessage(formInfo)

    console.log('[Agent] 发送表单更新:', payload)
    socket.value.emit('message', payload)

    return true
  }

  /**
   * 停止当前对话/任务
   * 重置状态并准备开始新对话
   */
  const stopCurrentTask = async () => {
    console.log('[Agent] 停止当前任务')
    // 重置 Agent 状态
    getAgentStore().resetState()
    getAgentStore().clearFormSession()
    // getAgentStore().isPaused.value = true
    // socket.value.disconnect()
    // sessionId.value = ''
    // sessionIdCopy.value = ''
    // currentConversationId.value = ''
    // localSessionMap.value = []
    // socket.value.connect()

    // 发送取消消息（如果连接可用）
    if (isConnected.value && socket.value) {
      try {
        const payload = {
          type: 'user_cancel',
          payload: {
            session_id: sessionId.value
          }
        }
        console.log('[Agent] 发送取消消息:', payload)
        socket.value.emit('message', payload)
      } catch (error) {
        console.error('[Agent] 发送取消消息失败:', error)
      }
    }

    // ElMessage.success('已停止当前任务，可以开始新对话')
    return true
  }

  /**
   * 生成会话标题（基于首条用户消息）
   * @param {string} firstMessage - 首条用户消息
   * @returns {string} - 会话标题
   */
  const generateConversationTitle = (firstMessage) => {
    if (!firstMessage) return '新对话'

    // 截取前30个字符作为标题
    const title = firstMessage.trim()
    return title.length > 30 ? title.substring(0, 30) + '...' : title
  }
  /**
   * 定时发送对话日志
   * @param {Array} content
   */
  const sendSessionLog = async (content) => {

    try {
      const userId ='27' || userStore.info?.id
      if (!userId) {
        console.warn('[Agent] 无法创建会话记录：用户未登录')
        return null
      }
      // 生成标题
      const firstMessage = getAgentStore().messages[0].payload.text
      const title = generateConversationTitle(firstMessage)
      // conversationTitle.value = title

      // 调用API创建会话（处理特殊的 code: 200 响应）
      const response = await handleAgentApiResponse(createConversation({
        user_id: userId,
        conversion_id: sessionId.value,
        title: title,
        dataset_id: getAgentStore().agentDatasetVal,
        content:  localSessionMap.value,
      }))

      if (response.data?.id) {
        currentConversationId.value = response.data.id
        console.log('[Agent] 会话记录已创建:', response.data.id)
        return response.data.id
      }
    } catch (err) {
      return null
    }
  }
  /**
   * 创建新会话记录
   * @param {string} firstMessage - 首条用户消息（用于生成标题）
   */
  const createConversationRecord = async (firstMessage) => {
    try {
      const userId ='27'|| userStore.info?.id
      if (!userId) {
        console.warn('[Agent] 无法创建会话记录：用户未登录')
        return null
      }

      // 生成标题
      const title = generateConversationTitle(firstMessage)
      conversationTitle.value = title

      // 调用API创建会话（处理特殊的 code: 200 响应）
      const response = await handleAgentApiResponse(createConversation({
        user_id: userId,
        conversion_id: sessionId.value,
        title: title,
        content: [
          {
            type: 'user_message',
            text: firstMessage,
            timestamp: new Date().toISOString()
          }
        ]
      }))

      if (response.data?.id) {
        currentConversationId.value = response.data.id
        console.log('[Agent] 会话记录已创建:', response.data.id)
        return response.data.id
      }
    } catch (error) {
      console.error('[Agent] 创建会话记录失败:', error)
      // 不影响正常对话流程
      return null
    }
  }

  /**
   * 保存消息到当前会话
   * @param {object} message - 消息对象
   */
  const saveMessageToConversation = async (message) => {
    // 如果没有当前会话ID，跳过保存
    if (!currentConversationId.value) {
      return
    }

    try {
      isSavingConversation.value = true

      // 获取当前会话的所有消息
      const messages = getAgentStore().messages || []

      // 更新会话内容（处理特殊的 code: 200 响应）
      await handleAgentApiResponse(createConversation({
        user_id:'27'|| userStore.info?.id,
        conversion_id: sessionId.value,
        title: conversationTitle.value,
        dataset_id: getAgentStore().agentDatasetVal,
        content: localSessionMap?.value.map(msg => ({
          type: msg.type,
          text: msg.payload?.text || msg.payload?.content?.text || '',
          payload: msg.payload,
          timestamp: msg.timestamp || new Date().toISOString()
        }))
      }))

      console.log('[Agent] 消息已保存到会话:', currentConversationId.value)
    } catch (error) {
      console.error('[Agent] 保存消息失败:', error)
      // 不影响正常对话流程
    } finally {
      isSavingConversation.value = false
    }
  }
  const messageHandling = (data = {}) => {
    localSessionMap.value.push(data)
    if (data.type === 'user_message') {
      getAgentStore().addMessage(data)
    }
    if (data.type === 'agent_message') {
      // 处理表单更新确认消息
      if (data.payload?.type === 'form_update_received') {
        const content = data.payload.content
        console.log('[Agent] 表单更新已接收:', content)
        ElMessage.success(content.message || '表单更新已接收')

        // 自动发送确认执行消息
        // sendUserMessage('确认执行')
        return
      }
      if (data.payload?.type === 'question_closely') {
        const content = data.payload.content
        console.log('[Agent] 问题描述追问:', content)
        content.historyMsg = true //历史消息不使用打字机效果

        messageHandlers.questionClosely(content)

        // 自动发送确认执行消息
        // sendUserMessage('确认执行')
        return
      }
      // 当前对话完成
      if (data.payload?.type === 'instruction') {

        const eventContent = data.payload
        if (eventContent.all_statuses) {
          messageHandlers.onMessageConfirm(eventContent)
        }
        return
      }
      // 处理表单更新消息
      if (data.payload?.type === 'form_update') {
        const formData = data.payload
        // 处理表单会话
        if (formData?.data?.form_session) {
          formData.data.form_session.historyMsg = true //历史消息不显示提交按钮
          const formSession = formData.data.form_session
          console.log('[Agent] 表单会话:', formData, formSession)
          getAgentStore().agentFormTask = formData?.data?.form_session?.form_data?.fields || {}
          // 保存到 store
          getAgentStore().setFormSession(formSession)

          // 触发表单处理器
          messageHandlers.onStateUpdate(formData)
        }
        return
      }
      // 处理 pipeline 更新消息
      if (data.payload?.type === 'pipeline_update') {
        console.log('[Agent] 收到 pipeline 更新:', data.payload)

        try {
          // 从 generated_codes 中提取 pipeline 结构
          const generatedCodes = data.payload?.content?.generated_codes
          if (!generatedCodes || generatedCodes.length === 0) {
            console.log('[Agent] pipeline_update 中没有 generated_codes')
            return
          }

          // 提取最后一个 generated_code 的 content（最新版本）
          const lastGeneratedCode = generatedCodes[generatedCodes.length - 1]
          console.log(lastGeneratedCode, 'lastGeneratedCode');

          const {nodes,edges} = lastGeneratedCode
        //   判断nodes 是否存在 type为dataset的值
        const hasDataset = nodes.some(node => node.type === 'dataset')
        if(!hasDataset){
          nodes.push(
            {id: `dataset1`,
            type: 'dataset',
            position:{
              x: 50,
              y: 500
            },
            data: {
              type: 'dataset',
              label: '数据集',
              config: {
                selectedDataset: getAgentStore().agentDatasetVal || '',
                datasets: [] // Available datasets list
              }
            }})
            edges.push({
              id: `el-edge${edgeIndex.value++}`,
              source: 'dataset1',
              source_port: 'dataset-field-dataset_id',
              target: nodes[0].id,
              target_port: `${nodes[0].id}-node-input`,
              animated: true,
            })
        }
          // 处理好数据赋值给新数组
          const pipelineData = {
            pipeline_config:{
            nodes,
            edges
            }

          }
          messageHandlers.onAction(pipelineData)
          // ElMessage.success(`开始构建 Pipeline：${nodes.length} 个节点，${edges.length} 条连线`)

        } catch (error) {
          console.error('[Agent] 处理 pipeline_update 失败:', error)
          // ElMessage.error('Pipeline 数据解析失败: ' + error.message)
        }

        return
      }
      if (data.payload?.type === 'pipeline_debug_update' && data.payload?.content) {
        const eventContent = data.payload.content
        // getAgentStore().setThinking(true)
        messageHandlers.pipelineDebugLlog(eventContent)
        return
      }
      if (data.payload?.type === 'operator_explanation' && data.payload?.content) {
        const eventContent = data.payload.content
        // getAgentStore().setThinking(true)
        messageHandlers.operatorExplanation(eventContent)
        return
      }
      // if(data.payload?.type === 'instruction'){
      //   const eventContent = data.payload
      //   messageHandlers.onMessageConfirm(eventContent)
      //   return
      // }
      if (data.payload?.type === 'agent_event') {
        const eventContent = data.payload.content

        // 根据事件类型分发处理
        switch (eventContent.type) {
          // case 'run_started':
          //   console.log('[Agent] 运行开始:', eventContent)
          //   getAgentStore().setThinking(true)
          //   messageHandlers.onRunStarted(eventContent)
          //   break

          // case 'plan_decision':
          //   console.log('[Agent] 计划决策:', eventContent)
          //   messageHandlers.onPlanDecision(eventContent)
          //   break

          case 'run_finished':
            console.log('[Agent] 运行结束:', eventContent)
            getAgentStore().setThinking(false)
            getAgentStore().setExecuting(false)
            messageHandlers.questionClosely(eventContent)
            eventContent.historyMsg = true
            break

          default:
            console.log('[Agent] 未知agent_event类型:', eventContent.type)
            messageHandlers.onAgentEvent(eventContent)
        }
      }
      return
    }
  }
  /**
   * 加载历史会话
   * @param {string} conversationId - 会话ID
   */
  const loadConversation = async (conversationId) => {
    try {
      // 处理特殊的 code: 200 响应
      const response = await handleAgentApiResponse(getConversationDetail({ id: conversationId }))

      if (response.data) {
        getAgentStore().setAgentDatasetVal(response.data?.dataset_id || '')
        // 历史消息对话标识开启
        getAgentStore().setMsssageHistory()
        const conversation = response.data
        console.log('历史会话:', conversation);

        // 清空当前消息
        getAgentStore().clearHistory()
        localSessionMap.value = []
        // 恢复会话信息
        currentConversationId.value = conversation.id
        conversationTitle.value = conversation.title
        sessionId.value = conversation.conversion_id
        //         conversation.content.splice(1, 0, {
        //     "id": "acffa99d-2351-42a1-b73a-c6c69ea3eb9c",
        //     "type": "agent_message",
        //     "payload": {
        //         "type": "agent_event",
        //         "content": {
        //             "data": {
        //               "question_closely": true,
        //                 "result": "已为您的多模态与文本类数据治理场景自动提取了主要目标和数据处理需求。如果需要并行调试或有特别的调试轮次数设置，请告知是否需要调试，以及调试相关细节。如果确认无更多补充，可以点击提交执行构建多模态处理流水线。",
        //                 "total_steps": 0
        //             },
        //             "type": "run_finished",
        //             "step_id": "step_3",
        //             "timestamp": "2025-11-28T11:04:22.973000",
        //             "session_id": "38_1764327846513"
        //         },
        //         "event_type": "run_finished",
        //         "session_id": "38_1764327846513"
        //     }
        // })
        // 恢复消息历史
        if (conversation.content && Array.isArray(conversation.content)) {
          conversation.content.forEach(msg => {
            messageHandling(msg)
            console.log('当前消息队列:',msg, getAgentStore().messages);

            // getAgentStore().addMessage({
            //   type: msg.type,
            //   payload: msg.data || { text: msg.text },
            //   timestamp: msg.timestamp
            // })
          })
        }

        console.log('[Agent] 历史会话已加载:', conversationId)
        ElMessage.success('历史会话已加载')
        return true
      }
    } catch (error) {
      console.error('[Agent] 加载历史会话失败:', error)
      ElMessage.error('加载历史会话失败')
      return false
    }
  }

  /**
   * 开始新会话
   */
  const startNewConversation = () => {
    // 清空当前会话状态
    currentConversationId.value = null
    conversationTitle.value = ''
    sessionId.value = generateSessionId()
    sessionIdCopy.value = ''
    localSessionMap.value = []
    // 清空消息历史
    getAgentStore().clearHistory()
    // 重新加入会话
    if (isConnected.value) {
      joinSession()
    }

    console.log('[Agent] 已开始新会话:', sessionId.value)
  }

  /**
   * 设置消息处理器
   * @param {object} handlers - 包含各种消息类型处理函数的对象
   * 注意：直接修改全局单例对象的属性，而不是创建新对象
   */
  const setMessageHandlers = (handlers) => {
    Object.assign(globalMessageHandlers, handlers)
    console.log('[Agent] 消息处理器已更新:', Object.keys(handlers))
  }

  /**
   * 处理页面可见性变化
   */
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      console.log('[Agent] 页面可见，检查连接状态...')
      // 页面重新可见时，检查连接状态
      if (!isConnected.value && socket.value) {
        console.log('[Agent] 页面重新可见，尝试重连...')
        ensureConnection()
      }
    }
  }

  /**
   * 组件挂载时初始化
   */
  if (autoConnect) {
    onMounted(() => {
      console.log('[Agent] 自动连接已启用，开始连接...')
      connect()

      // 监听页面可见性变化
      document.addEventListener('visibilitychange', handleVisibilityChange)
    })
  }

  /**
   * 组件卸载时断开连接
   */
  onUnmounted(() => {
    // 移除页面可见性监听
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    disconnect()
  })

  return {
    socket,
    isConnected,
    isSessionJoined,
    isReconnecting,
    sessionId,
    connect,
    disconnect,
    joinSession,
    ensureConnection,
    sendUserMessage,
    sendConfirmMessage,
    sendModifyMessage,
    sendFormUpdate,
    stopCurrentTask,
    setMessageHandlers,
    // 会话管理
    currentConversationId,
    conversationTitle,
    isSavingConversation,
    createConversationRecord,
    saveMessageToConversation,
    loadConversation,
    startNewConversation,
    sendSessionLog
  }
}

