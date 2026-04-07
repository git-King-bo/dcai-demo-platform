<template>
  <div class="run-started-card">
    <div class="status-indicator">
      <div class="status-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>
      <span class="status-text">开始分析</span>
    </div>
    <div v-if="content.data?.user_input" class="user-input">
      <div class="input-label">任务:</div>
      <div class="input-text">{{ content.data.user_input }}</div>
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
.run-started-card {
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

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.status-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
  border-radius: 50%;
  color: white;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(0.95);
  }
}

.status-text {
  font-size: 14px;
  font-weight: 600;
  color: #1D1D1F;
  letter-spacing: -0.2px;
}

.user-input {
  padding: 10px 12px;
  background: rgba(0, 122, 255, 0.04);
  border-radius: 10px;
  margin-bottom: 8px;
  border-left: 3px solid #007AFF;
}

.input-label {
  font-size: 11px;
  font-weight: 600;
  color: #86868B;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.input-text {
  font-size: 13px;
  font-weight: 500;
  color: #1D1D1F;
  line-height: 1.5;
  letter-spacing: -0.1px;
  white-space: pre-wrap;
  word-break: break-word;
}

.timestamp {
  font-size: 11px;
  font-weight: 400;
  color: #86868B;
  text-align: right;
  letter-spacing: -0.1px;
}
</style>

