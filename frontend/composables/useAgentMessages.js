import { ref, nextTick } from 'vue'
import { useAgentStore } from '@/store/modules/agent'

/**
 * Agent 消息队列管理 Composable
 * 处理各种类型的消息展示和交互
 */
export const useAgentMessages = () => {
  let agentStore = null
function getAgentStore() {
  if (!agentStore) {
    agentStore = useAgentStore()
  }
  return agentStore
}
  const conversationRef = ref(null)
  
  /**
   * 滚动到对话底部
   */
  const scrollToBottom = (smooth = true) => {
    nextTick(() => {
      if (conversationRef.value) {
        const scrollOptions = smooth 
          ? { behavior: 'smooth', block: 'end' }
          : { block: 'end' }
        
        // 使用 scrollIntoView 更可靠
        const lastMessage = conversationRef.value.lastElementChild
        if (lastMessage) {
          lastMessage.scrollIntoView(scrollOptions)
        } else {
          conversationRef.value.scrollTop = conversationRef.value.scrollHeight
        }
      }
    })
  }
  
  /**
   * 添加用户消息
   * @param {string} text - 消息文本
   */
  const addUserMessage = (text) => {
    getAgentStore().addMessage({
      type: 'user_message',
      payload: { text }
    })
    scrollToBottom()
  }
  
  /**
   * 添加Agent消息
   * @param {object} message - 消息对象
   */
  const addAgentMessage = (message) => {
    getAgentStore().addMessage(message)
    scrollToBottom()
  }
  
  /**
   * 处理思考消息
   * @param {object} payload - 思考消息数据
   */
  const handleThoughtMessage = (payload) => {
    console.log('🔍 [useAgentMessages] handleThoughtMessage 被调用')
    console.log('  payload:', payload)
    
    getAgentStore().setThinking(true)
    getAgentStore().setCurrentMessageType('thought')
    
    const thoughtMessage = {
      type: 'agent_message',
      payload: {
        type: 'thought',
        content: payload
      }
    }
    
    addAgentMessage(thoughtMessage)
    
    // 流式显示思考过程（可选，用于更好的UX）
    if (payload.thoughts && Array.isArray(payload.thoughts)) {
      payload.thoughts.forEach((thought, index) => {
        setTimeout(() => {
          // 这里可以添加逐条显示的动画效果
          scrollToBottom()
        }, index * 300)
      })
    }
  }
  
  /**
   * 处理计划消息
   * @param {object} payload - 计划消息数据
   */
  const handlePlanMessage = (payload) => {
    getAgentStore().setThinking(false)
    getAgentStore().setPendingConfirm(payload.content || payload)
    
    const planMessage = {
      type: 'agent_message',
      payload: {
        type: 'plan',
        content: payload
      }
    }
    
    addAgentMessage(planMessage)
  }
  
  /**
   * 处理操作消息
   * @param {object} payload - 操作消息数据
   */
  const handleActionMessage = (payload) => {
    console.log('🔍 [useAgentMessages] handleActionMessage 被调用')
    console.log('  payload:', payload)
    
    const content = payload.content || payload
    console.log('  content:', content)
    console.log('  content.action:', content.action)
    
    // 设置执行状态
    if (content.action !== 'complete') {
      console.log('  → 设置 isExecuting=true, messageType=action')
      getAgentStore().setExecuting(true)
      getAgentStore().setCurrentMessageType('action')
    } else {
      console.log('  → 设置 isExecuting=false, messageType=complete')
      getAgentStore().setExecuting(false)
      getAgentStore().setCurrentMessageType('complete')
    }
    
    // 设置当前步骤
    if (content.progress) {
      getAgentStore().setCurrentStep({
        current: content.progress.current,
        total: content.progress.total,
        action: content.action
      })
    }
    
    const actionMessage = {
      type: 'agent_message',
      payload: {
        type: 'action',
        content: payload
      }
    }
    
    addAgentMessage(actionMessage)
  }
  
  /**
   * 处理错误消息
   * @param {object} payload - 错误消息数据
   */
  const handleErrorMessage = (payload) => {
    getAgentStore().setThinking(false)
    getAgentStore().setExecuting(false)
    getAgentStore().resetState()
    
    const errorMessage = {
      type: 'agent_message',
      payload: {
        type: 'error',
        content: payload
      }
    }
    
    addAgentMessage(errorMessage)
  }
  
  /**
   * 处理完成消息
   * @param {object} payload - 完成消息数据
   */
  const handleCompleteMessage = (payload) => {
    getAgentStore().setExecuting(false)
    getAgentStore().setCurrentStep(null)
    
    const completeMessage = {
      type: 'agent_message',
      payload: {
        type: 'action',
        content: {
          ...payload,
          action: 'complete',
          status: 'success',
          message: payload.message || 'Pipeline构建完成！'
        }
      }
    }
    
    addAgentMessage(completeMessage)
  }
  
  /**
   * 清空对话历史
   */
  const clearMessages = () => {
    getAgentStore().clearHistory()
  }
  
  /**
   * 获取格式化的对话历史（用于发送给后端）
   */
  const getFormattedHistory = () => {
    return getAgentStore().messages.map(msg => ({
      role: msg.type === 'user_message' ? 'user' : 'assistant',
      content: typeof msg.payload === 'string' 
        ? msg.payload 
        : msg.payload.text || JSON.stringify(msg.payload),
      timestamp: msg.timestamp
    }))
  }
  
  /**
   * 导出对话历史
   */
  const exportHistory = () => {
    const history = getFormattedHistory()
    const blob = new Blob([JSON.stringify(history, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `agent-conversation-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  /**
   * 添加系统消息（欢迎消息等）
   */
  const addSystemMessage = (text) => {
    const systemMessage = {
      type: 'system_message',
      payload: { text }
    }
    
    addAgentMessage(systemMessage)
  }
  
  /**
   * 添加欢迎消息
   */
  const addWelcomeMessage = () => {
    const welcomeText = `你好！我是 DataFlow。我可以帮你：
1、自动构建数据流水线
2、优化现有Pipeline
3、解释算子和配置
`
    addSystemMessage(welcomeText)
  }
  
  /**
   * 处理运行开始消息
   * @param {object} eventContent - 运行开始事件数据
   */
  const handleRunStarted = (eventContent) => {
    console.log('🔍 [useAgentMessages] handleRunStarted 被调用')
    console.log('  eventContent:', eventContent)
    
    getAgentStore().setThinking(true)
    getAgentStore().setCurrentMessageType('run_started')
    
    const runStartedMessage = {
      type: 'agent_message',
      payload: {
        type: 'run_started',
        content: eventContent,
        timestamp: eventContent.timestamp,
        session_id: eventContent.session_id
      }
    }
    
    addAgentMessage(runStartedMessage)
  }
  
  /**
   * 处理计划决策消息
   * @param {object} eventContent - 计划决策事件数据
   */
  const handlePlanDecision = (eventContent) => {
    console.log('🔍 [useAgentMessages] handlePlanDecision 被调用')
    console.log('  eventContent:', eventContent)
    
    const decision = eventContent.data?.decision
    console.log('  decision:', decision)
    
    getAgentStore().setCurrentMessageType('plan_decision')
    
    const planDecisionMessage = {
      type: 'agent_message',
      payload: {
        type: 'plan_decision',
        content: eventContent,
        timestamp: eventContent.timestamp,
        session_id: eventContent.session_id,
        decision
      }
    }
    
    addAgentMessage(planDecisionMessage)
  }
  /**
   * 处理 pipeline 调试日志消息
   * @param {object} payload - 调试日志消息数据
   */
  const handlePipelineDebugLog = (eventContent) => {
    console.log('🔍 [useAgentMessages] handlePipelineDebugLog 被调用')
    console.log('  payloadeventContenteventContent:', eventContent)
    getAgentStore().setCurrentMessageType('pipeline_debug_update')
    const result = eventContent.execution_result
    const pipelineDebugLogMessage = {
      type: 'agent_message',
      payload: {
        type: 'pipeline_debug_update',
        content: eventContent,
        timestamp: eventContent.timestamp,
        session_id: eventContent.session_id,
        result
      }
    }
    addAgentMessage(pipelineDebugLogMessage)
  }
  /**
   * 处理 pipeline 解释算子
   * @param {object} payload - 解释算子消息数据
   */
  const handleOperatorExplanation = (eventContent) => {
    console.log('🔍 [useAgentMessages] handleOperatorExplanation 被调用')
    console.log('  payloadeventContenteventContent:', eventContent)
    getAgentStore().setCurrentMessageType('operator_explanation')
    const result = eventContent.execution_result
    const pipelineDebugLogMessage = {
      type: 'agent_message',
      payload: {
        type: 'operator_explanation',
        content: eventContent,
        timestamp: eventContent.timestamp,
        session_id: eventContent.session_id,
        result
      }
    }
    addAgentMessage(pipelineDebugLogMessage)
  }
  /**
   * 处理消息确认消息
   * @param {object} eventContent - 消息确认消息数据
   */
  const handleMessageConfirm = (eventContent) => {
    console.log('🔍 [useAgentMessages] handleMessageConfirm 被调用')
    console.log('  eventContent:', eventContent)
    getAgentStore().setCurrentMessageType('instruction')
    const instructionMessage = {
      type: 'agent_message',
      payload: {
        type: 'instruction',
        content: eventContent
      }
    }
    addAgentMessage(instructionMessage)
  }
  /**
   * 处理问题描述追问消息
   * @param {*} eventContent 
   */
   const handleQuestionClosely = (eventContent) => {
    console.log('🔍 [useAgentMessages] handleQuestionClosely 被调用')
    console.log('  eventContent:', eventContent)
    getAgentStore().setCurrentMessageType('question_closely')
    const questionCloselyMessage = {
      type: 'agent_message',
      payload: {
        type: 'question_closely',
        content: eventContent
      }
    }
    addAgentMessage(questionCloselyMessage)
  }
  /**
   * 处理运行结束消息
   * @param {object} eventContent - 运行结束事件数据
   */
  const handleRunFinished = (eventContent) => {
    console.log('🔍 [useAgentMessages] handleRunFinished 被调用')
    console.log('  eventContent:', eventContent)
    
    getAgentStore().setThinking(false)
    getAgentStore().setExecuting(false)
    getAgentStore().setCurrentMessageType('run_finished')
    
    const result = eventContent.data?.result
    console.log('  result:', result)
    
    const runFinishedMessage = {
      type: 'agent_message',
      payload: {
        type: 'run_finished',
        content: eventContent,
        timestamp: eventContent.timestamp,
        session_id: eventContent.session_id,
        result
      }
    }
    
    addAgentMessage(runFinishedMessage)
  }
  
  /**
   * 处理状态更新消息（包含表单）
   * @param {object} payload - 状态更新数据
   */
  const handleStateUpdate = (payload) => {
    const formSession = payload.data?.form_session
    
    if (formSession && formSession.requires_user_input) {
      const formMessage = {
        type: 'agent_message',
        payload: {
          type: 'form_request',
          content: formSession,
          timestamp: payload.timestamp,
          session_id: formSession.session_id
        }
      }
      
      addAgentMessage(formMessage)
    }
  }
  
  return {
    conversationRef,
    scrollToBottom,
    addUserMessage,
    addAgentMessage,
    handleThoughtMessage,
    handlePlanMessage,
    handleActionMessage,
    handleErrorMessage,
    handleCompleteMessage,
    handleRunStarted,
    handlePlanDecision,
    handleRunFinished,
    handleStateUpdate,
    clearMessages,
    getFormattedHistory,
    exportHistory,
    addSystemMessage,
    addWelcomeMessage,
    handlePipelineDebugLog,
    handleOperatorExplanation,
    handleMessageConfirm,
    handleQuestionClosely
  }
}

