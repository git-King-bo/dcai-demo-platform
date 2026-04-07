<template>
  <div class="plan-decision-card">
    <div class="decision-header">
      <div class="header-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 11l3 3L22 4"></path>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
      </div>
      <span class="header-text">计划决策</span>
    </div>
    
    <div v-if="decision" class="decision-content">            
      <div v-if="decision.reason" class="decision-reason">
        <div class="reason-label">原因:</div>
        <div class="reason-text">{{ decision.reason }}</div>
      </div>
      <div v-if="decision.tool_name" class="decision-item">
        <span class="item-label">使用工具:</span>
        <span class="item-value tool-name">{{ decision.tool_name }}</span>
      </div>
      <div class="decision-item">
        <span class="item-label">当前决策:</span>
        <span class="item-value" :class="getDecisionTypeClass(decision.decision_type)">
          {{ getDecisionTypeLabel(decision.decision_type) }}
        </span>
      </div>

    </div>
    
    <div v-if="timestamp" class="timestamp">
      {{ formatTime(timestamp) }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  content: {
    type: Object,
    default: () => ({})
  },
  timestamp: {
    type: String,
    default: ''
  }
})

const decision = props.content.data?.decision

const getDecisionTypeLabel = (type) => {
  const labels = {
    'continue': '继续执行',
    'complete': '完成',
    'wait': '等待',
    'error': '错误'
  }
  return labels[type] || type
}

const getDecisionTypeClass = (type) => {
  return `decision-type-${type}`
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped>
.plan-decision-card {
  background: white;
  border: 0.5px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  padding: 14px 16px;
  margin: 8px 0;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.decision-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
}

.header-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #34C759 0%, #30D158 100%);
  border-radius: 50%;
  color: white;
}

.header-text {
  font-size: 14px;
  font-weight: 600;
  color: #1D1D1F;
  letter-spacing: -0.2px;
}

.decision-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.decision-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.item-label {
  font-weight: 500;
  color: #86868B;
  letter-spacing: -0.1px;
}

.item-value {
  font-weight: 600;
  letter-spacing: -0.1px;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
}

.decision-type-continue {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

.decision-type-complete {
  background: rgba(52, 199, 89, 0.1);
  color: #34C759;
}

.decision-type-wait {
  background: rgba(255, 149, 0, 0.1);
  color: #FF9500;
}

.decision-type-error {
  background: rgba(255, 59, 48, 0.1);
  color: #FF3B30;
}

.tool-name {
  background: rgba(88, 86, 214, 0.1);
  color: #5856D6;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
}

.decision-reason {
  margin-top: 4px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 10px;
  border-left: 3px solid #007AFF;
}

.reason-label {
  font-size: 11px;
  font-weight: 600;
  color: #86868B;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.reason-text {
  font-size: 13px;
  font-weight: 400;
  color: #1D1D1F;
  line-height: 1.6;
  letter-spacing: -0.1px;
}

.timestamp {
  font-size: 11px;
  font-weight: 400;
  color: #86868B;
  text-align: right;
  margin-top: 10px;
  letter-spacing: -0.1px;
}
</style>

