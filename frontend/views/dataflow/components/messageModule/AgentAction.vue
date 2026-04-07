<template>
  <div class="agent-action">
    <div class="action-header">
      <span class="action-title">{{ actionLabel }}</span>
      <span v-if="progress" class="action-progress-text">
        (步骤 {{ progress.current }}/{{ progress.total }})
      </span>
    </div>
    
    <!-- 算子信息 -->
    <div v-if="operatorName" class="operator-info">
      <div class="operator-name">{{ operatorName }}</div>
      <div v-if="operatorDescription" class="operator-description">{{ operatorDescription }}</div>
    </div>
    
    <div class="action-content">
      <!-- 进度条 -->
      <div v-if="progress && status === 'in_progress'" class="progress-bar-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progress.percentage}%` }"
          ></div>
        </div>
        <span class="progress-percentage">{{ progress.percentage }}%</span>
      </div>
      
      <!-- 操作消息 -->
      <div v-if="message" class="action-message">
        <span>{{ message }}</span>
      </div>
      
      <!-- 节点信息 -->
      <div v-if="nodeInfo" class="action-detail">
        <span class="detail-icon">📍</span>
        <span>{{ nodeInfo }}</span>
      </div>
      
      <!-- 查看节点链接 -->
      <div v-if="showViewLink && nodeId" class="action-link" @click="$emit('view-node', nodeId)">
        <span>查看节点</span>
        <span class="link-arrow">→</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAgentStore } from '@/store/modules/agent'

const props = defineProps({
  content: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view-node'])

let agentStore = null
function getAgentStore() {
  if (!agentStore) {
    agentStore = useAgentStore()
  }
  return agentStore
}
const action = computed(() => props.content.action || '')
const status = computed(() => props.content.status || 'in_progress')
const message = computed(() => props.content.message || '')
const progress = computed(() => props.content.progress)
const nodeId = computed(() => props.content.data?.nodeId)

const operatorName = computed(() => {
  const data = props.content.data
  // props.content.data 本身是一个节点对象，结构是 { id, type, data: { operator: {...} } }
  // 所以算子信息在 data.data.operator
  const operator = data?.data?.operator
  return operator?.name || null
})

const operatorDescription = computed(() => {
  const data = props.content.data
  const operator = data?.data?.operator
  return operator?.description || null
})

// 根据当前消息类型和动作类型返回描述
const actionLabel = computed(() => {
  const msgType = getAgentStore().currentMessageType
  const actionType = action.value
  
  // 🔍 调试日志 - 追踪动作标签
  console.log('🔍 [AgentAction actionLabel] ========')
  console.log('  currentMessageType:', msgType)
  console.log('  action.value:', actionType)
  console.log('  props.content:', props.content)
  console.log('  status:', status.value)
  
  // 根据消息类型返回描述
  if (msgType === 'plan_decision') {
    console.log('  → 返回: 正在规划方案')
    return '正在规划方案'
  }
  
  if (msgType === 'run_started') {
    console.log('  → 返回: 正在分析您的需求')
    return '正在分析您的需求'
  }
  
  if (msgType === 'run_finished') {
    console.log('  → 返回: 执行完成')
    return '执行完成'
  }
  
  // 根据动作类型返回描述
  if (actionType === 'add_node') {
    console.log('  → 返回: 正在添加节点')
    return '正在添加节点'
  }
  
  if (actionType === 'add_edge') {
    console.log('  → 返回: 正在创建连线')
    return '正在创建连线'
  }
  
  if (actionType === 'update_config') {
    console.log('  → 返回: 正在更新配置')
    return '正在更新配置'
  }
  
  if (actionType === 'complete') {
    console.log('  → 返回: 执行完成')
    return '执行完成'
  }
  
  // 默认
  console.log('  → 返回: 正在执行 (默认)')
  return '正在执行'
})


const showViewLink = computed(() => {
  return status.value === 'success' && nodeId.value && action.value === 'add_node'
})

const nodeInfo = computed(() => {
  if (!props.content.data) return null
  
  const data = props.content.data
  console.log("data = ",data)
  
  return null
})
</script>

<style scoped>
/* ========================================
   Action Message - Progress Tracker Design
   改为进度追踪样式，类似 CI/CD 流水线
   ======================================== */
.agent-action {
  background: linear-gradient(90deg, rgba(52, 199, 89, 0.04) 0%, rgba(48, 209, 88, 0.01) 100%);
  border-left: 4px solid #34C759;
  border-radius: 0 12px 12px 0;
  padding: 14px 16px 14px 20px;
  margin: 12px 0;
  box-shadow: none;
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.agent-action::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #34C759 0%, #30D158 100%);
  animation: progressGlow 2s ease-in-out infinite;
}

@keyframes progressGlow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(52, 199, 89, 0.4);
  }
  50% {
    box-shadow: 0 0 20px rgba(52, 199, 89, 0.6);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.action-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-weight: 700;
  color: #34C759;
  font-size: 14px;
  letter-spacing: 0.5px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.action-icon {
  font-size: 20px;
  animation: executing 2s ease-in-out infinite;
  filter: drop-shadow(0 2px 4px rgba(52, 199, 89, 0.4));
}

@keyframes executing {
  0%, 100% { 
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% { 
    transform: scale(1.1) rotate(180deg);
    opacity: 0.9;
  }
}

.action-title {
  flex: 1;
  text-transform: uppercase;
}

.action-progress-text {
  font-size: 11px;
  color: #86868B;
  font-weight: 500;
  letter-spacing: 0px;
  font-variant-numeric: tabular-nums;
}

/* ========================================
   算子信息区域 - Apple 层级设计
   ======================================== */
.operator-info {
  margin: 0 0 12px 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.operator-name {
  font-size: 12px;
  font-weight: 600;
  color: #1D1D1F;
  line-height: 1.4;
  letter-spacing: -0.4px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.operator-description {
  font-size: 13px;
  font-weight: 400;
  color: #86868B;
  line-height: 1.5;
  letter-spacing: -0.1px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  white-space: pre-wrap;
}

.action-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(52, 199, 89, 0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-bar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.3) 50%, 
    transparent 100%);
  animation: scanning 2s linear infinite;
}

@keyframes scanning {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #34C759 0%, #30D158 100%);
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 
    0 0 10px rgba(52, 199, 89, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.progress-percentage {
  font-size: 12px;
  color: #34C759;
  font-weight: 700;
  min-width: 40px;
  text-align: right;
  letter-spacing: 0px;
  font-variant-numeric: tabular-nums;
}

.action-message {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #1D1D1F;
  font-weight: 500;
  line-height: 1.7;
  letter-spacing: -0.1px;
  padding: 4px 0;
}

.message-icon {
  font-size: 16px;
  flex-shrink: 0;
  animation: iconPulse 1.5s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.action-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #86868B;
  margin-left: 24px;
  letter-spacing: 0px;
  padding: 2px 0;
}

.detail-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #007AFF;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: fit-content;
  padding: 6px 10px;
  margin-left: 14px;
  margin-top: 4px;
  border-radius: 6px;
  letter-spacing: 0px;
  background: rgba(0, 122, 255, 0.05);
  border: 1px solid rgba(0, 122, 255, 0.1);
}

.action-link:hover {
  color: #0066CC;
  background: rgba(0, 122, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.2);
  gap: 8px;
  transform: translateX(2px);
}

.action-link:active {
  background: rgba(0, 122, 255, 0.15);
  transform: translateX(1px) scale(0.98);
}

.link-arrow {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
}

.action-link:hover .link-arrow {
  transform: translateX(4px);
}
</style>

