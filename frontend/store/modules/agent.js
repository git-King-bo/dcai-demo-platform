import { defineStore } from 'pinia'

export const useAgentStore = defineStore('agent', {
  state: () => ({
    // 面板状态
    isOpen: false,
    isPanelMinimized: false,
    
    // 连接状态
    socket: null,
    isConnected: false,
    reconnectAttempts: 0,
    
    // Agent状态
    isThinking: false,
    isExecuting: false,
    currentStep: null,
    currentMessageType: null, // 当前消息类型：run_started, plan_decision, action 等
    
    // 消息历史
    messages: [],
    pendingConfirm: null,
    
    // 表单会话
    formSession: null,
    
    // 用户偏好
    quickActions: [
      { id: 'build', text: '构建Pipeline', icon: '🏗️' },
      // { id: 'optimize', text: '优化Pipeline', icon: '✨' },
      { id: 'explain', text: '算子解释', icon: '📖' },
      // { id: 'add', text: '添加算子', icon: '➕' }
    ],
    conversationContext: {},
    
    // 画布上下文
    canvasState: null,
    agentDatasetVal: '', // 数据集id,全局交互
    datasetArr:[], // 全局共用一份数据
    formFields:{}, // 保存agent表单数据，用于填充执行任务输入框内容
    hasMsssageHistory:false, //是否为历史消息，用来做消息过滤标识
    datasetTotalCount:0, // 数据集总数，用来判断是否还有更多数据
    deepThinking:false, // 是否开启深思考模式
    passThrough:false, // 是否开启透传模式
    agentFormTask:{}, // 记录表单信息，用于执行任务填充名称、描述
    debugMode:false, // 是否开启调试模式(忽略Agent页面报错)
  }),
  
  getters: {
    lastMessage: (state) => state.messages[state.messages.length - 1],
    hasError: (state) => state.messages.some(m => m.payload?.type === 'error'),
    conversationHistory: (state) => state.messages.slice(-10), // 最近10条
    messageCount: (state) => state.messages.length,
    hasUnconfirmedPlan: (state) => state.pendingConfirm !== null
  },
  
  actions: {
    setDebugMode(){
      this.debugMode = !this.debugMode
    },
    setMsssageHistory (){
      this.hasMsssageHistory = !this.hasMsssageHistory
    },
    setDeepThinking(){
      this.deepThinking = !this.deepThinking
    },
    setPassThrough(){
      this.passThrough = !this.passThrough
    },
    setAgentDatasetVal(val) {
      this.agentDatasetVal = val
    },
    setDatasetArr(arr){
      this.datasetArr = arr
    },
    setFormFields(obj){
      this.formFields = obj
    },
    // 打开/关闭面板
    togglePanel() {
      this.isOpen = !this.isOpen
    },

    openPanel() {
      this.isOpen = true
    },
    
    closePanel() {
      this.isOpen = false
    },
    
    // 最小化/恢复面板
    toggleMinimize() {
      this.isPanelMinimized = !this.isPanelMinimized
    },
    
    // 设置连接状态
    setConnected(status) {
      this.isConnected = status
      if (status) {
        this.reconnectAttempts = 0
      }
    },
    
    // 设置Socket实例
    setSocket(socket) {
      this.socket = socket
    },
    
    // 增加重连次数
    incrementReconnectAttempts() {
      this.reconnectAttempts++
    },
    
    // 重置重连次数
    resetReconnectAttempts() {
      this.reconnectAttempts = 0
    },
    
    // 设置思考状态
    setThinking(status) {
      this.isThinking = status
    },
    
    // 设置执行状态
    setExecuting(status) {
      this.isExecuting = status
    },
    
    // 设置当前步骤
    setCurrentStep(step) {
      this.currentStep = step
    },
    
    // 设置当前消息类型
    setCurrentMessageType(type) {
      this.currentMessageType = type
    },
    
    // 添加消息
    addMessage(message) {
      let timeStr = message.payload?.content?.timestamp || ''
      
      // 处理时间，在基础上+8小时（服务端返回的是无时区 ISO 字符串，需转为本地时间）
      if (timeStr) {
        const date = new Date(timeStr)
        date.setHours(date.getHours() + 8)
        timeStr = date.toISOString()
      }
      this.messages.push({
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: timeStr || new Date().toISOString(),
        ...message,
      })
    },
    
    // 更新最后一条消息
    updateLastMessage(updates) {
      if (this.messages.length > 0) {
        const lastIndex = this.messages.length - 1
        this.messages[lastIndex] = {
          ...this.messages[lastIndex],
          ...updates
        }
      }
    },
    
    // 设置待确认计划
    setPendingConfirm(plan) {
      this.pendingConfirm = plan
    },
    
    // 清空待确认计划
    clearPendingConfirm() {
      this.pendingConfirm = null
    },
    
    // 设置表单会话
    setFormSession(formSession) {
      this.formSession = formSession
    },
    
    // 清空表单会话
    clearFormSession() {
      this.formSession = null
    },
    
    // 清空消息历史
    clearHistory() {
      this.messages = []
      this.pendingConfirm = null
      this.currentStep = null
      this.formSession = null
    },
    
    // 更新画布上下文
    updateCanvasState(state) {
      this.canvasState = state
    },
    
    // 更新对话上下文
    updateConversationContext(context) {
      this.conversationContext = {
        ...this.conversationContext,
        ...context
      }
    },
    
    // 重置状态
    resetState() {
      this.isThinking = false
      this.isExecuting = false
      this.currentStep = null
      this.pendingConfirm = null
      this.currentMessageType = null
    }
  }
})

