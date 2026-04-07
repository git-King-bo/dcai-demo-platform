<template>
  <div class="run-finished-card">
    <div class="finish-header">
      <div class="header-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <span class="header-text">执行结果</span>
    </div>
    
    <div v-if="result" class="result-content">
      <div class="result-text">{{ result }}</div>
    </div>
    
    <div v-if="content.data?.total_steps !== undefined" class="steps-info">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <span>共 {{ content.data.total_steps +1}} 个步骤</span>
    </div>
     <div v-if="content.text" class="result-text">{{ content.text }}</div>
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

const result = props.content.data?.result

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
.run-finished-card {
  background: linear-gradient(135deg, rgba(52, 199, 89, 0.05) 0%, rgba(48, 209, 88, 0.05) 100%);
  border: 0.5px solid rgba(52, 199, 89, 0.2);
  border-radius: 16px;
  padding: 14px 16px;
  margin: 8px 0;
  box-shadow: 
    0 2px 8px rgba(52, 199, 89, 0.08),
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

.finish-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
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
  animation: successScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes successScale {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.header-text {
  font-size: 14px;
  font-weight: 600;
  color: #1D1D1F;
  letter-spacing: -0.2px;
}

.result-content {
  padding: 12px 14px;
  background: white;
  border-radius: 12px;
  margin-bottom: 10px;
  border: 0.5px solid rgba(0, 0, 0, 0.04);
}

.result-text {
  font-size: 13px;
  font-weight: 400;
  color: #1D1D1F;
  line-height: 1.6;
  letter-spacing: -0.1px;
  white-space: pre-wrap;
  word-break: break-word;
}

.steps-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #34C759;
  padding: 6px 10px;
  background: rgba(52, 199, 89, 0.08);
  border-radius: 8px;
  width: fit-content;
}

.steps-info svg {
  flex-shrink: 0;
}

.timestamp {
  font-size: 11px;
  font-weight: 400;
  color: #86868B;
  text-align: right;
  margin-top: 8px;
  letter-spacing: -0.1px;
}
</style>

