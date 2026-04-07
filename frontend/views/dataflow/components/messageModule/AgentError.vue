<template>
  <div class="agent-error">
    <div class="error-header">
      <span class="error-title">执行失败</span>
    </div>
    
    <div class="error-content">
      <!-- 错误原因 -->
      <div class="error-message">
        <span class="label">原因：</span>
        <span>{{ errorMessage }}</span>
      </div>
      
      <!-- 错误详情 -->
      <div v-if="hasDetails" class="error-details">
        <div v-for="(value, key) in details" :key="key" class="detail-item">
          <span class="detail-key">{{ key }}:</span>
          <span class="detail-value">{{ formatValue(value) }}</span>
        </div>
      </div>
      
      <!-- 建议方案 -->
      <div v-if="hasSuggestions" class="error-suggestions">
        <div class="suggestions-title">
          <span class="suggestions-icon">💡</span>
          <span>建议：</span>
        </div>
        <div class="suggestions-list">
          <div 
            v-for="(suggestion, index) in suggestions" 
            :key="index"
            class="suggestion-item"
          >
            {{ suggestion.description }}
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div v-if="hasSuggestions" class="error-actions">
        <button 
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="error-action-btn"
          :class="{ 'primary': index === 0 }"
          @click="$emit('action', suggestion)"
        >
          {{ getActionText(suggestion.type) }}
        </button>
        <button 
          class="error-action-btn"
          @click="$emit('cancel')"
        >
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['action', 'cancel'])

const errorMessage = computed(() => props.content.message || '未知错误')
const details = computed(() => props.content.details || null)
const suggestions = computed(() => props.content.suggestions || [])

const hasDetails = computed(() => {
  return details.value && Object.keys(details.value).length > 0
})

const hasSuggestions = computed(() => {
  return suggestions.value && suggestions.value.length > 0
})

const formatValue = (value) => {
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

const getActionText = (type) => {
  const actionMap = {
    'retry': '重试',
    'alternative': '使用替代方案',
    'modify': '修改配置'
  }
  return actionMap[type] || '执行'
}
</script>

<style scoped>
/* ========================================
   Error Message - Diagnostic Panel Design
   改为问题诊断面板样式，突出警告和解决方案
   ======================================== */
.agent-error {
  background: linear-gradient(90deg, rgba(255, 59, 48, 0.06) 0%, rgba(255, 59, 48, 0.02) 100%);
  border-left: 4px solid #FF3B30;
  border-radius: 0 12px 12px 0;
  padding: 14px 16px 14px 20px;
  margin: 16px 0;
  box-shadow: none;
  animation: errorAppear 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
  position: relative;
  overflow: visible;
}

.agent-error::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #FF3B30 0%, #FF453A 100%);
  box-shadow: 0 0 12px rgba(255, 59, 48, 0.5);
  animation: errorPulse 1.5s ease-in-out infinite;
}

@keyframes errorAppear {
  0% { 
    opacity: 0;
    transform: translateX(-20px); 
  }
  60% { 
    transform: translateX(4px); 
  }
  100% { 
    opacity: 1;
    transform: translateX(0); 
  }
}

@keyframes errorPulse {
  0%, 100% {
    box-shadow: 0 0 12px rgba(255, 59, 48, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 59, 48, 0.7);
  }
}

.error-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 59, 48, 0.2);
  font-weight: 700;
  color: #FF3B30;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.error-icon {
  font-size: 20px;
  animation: errorShake 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
  filter: drop-shadow(0 2px 4px rgba(255, 59, 48, 0.4));
}

@keyframes errorShake {
  0%, 100% { 
    transform: rotate(0deg) scale(1); 
  }
  25% { 
    transform: rotate(-10deg) scale(1.05); 
  }
  75% { 
    transform: rotate(10deg) scale(1.05); 
  }
}

.error-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.error-message {
  font-size: 13px;
  color: #1D1D1F;
  font-weight: 500;
  line-height: 1.7;
  letter-spacing: -0.1px;
  padding: 8px 12px;
  background: rgba(255, 59, 48, 0.06);
  border-radius: 8px;
  border-left: 3px solid #FF3B30;
}

.label {
  font-weight: 700;
  margin-right: 6px;
  color: #FF3B30;
}

.error-details {
  font-size: 11px;
  background: rgba(0, 0, 0, 0.04);
  padding: 10px 12px;
  border-radius: 8px;
  font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
  color: #1D1D1F;
  border: 1px solid rgba(0, 0, 0, 0.08);
  line-height: 1.6;
}

.detail-item {
  margin: 6px 0;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.detail-key {
  color: #86868B;
  min-width: 100px;
  font-weight: 600;
  flex-shrink: 0;
}

.detail-value {
  color: #1D1D1F;
  word-break: break-all;
  flex: 1;
}

.error-suggestions {
  margin-top: 6px;
  padding: 10px 12px;
  background: rgba(0, 122, 255, 0.04);
  border-radius: 8px;
  border-left: 3px solid #007AFF;
}

.suggestions-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #007AFF;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.suggestions-icon {
  font-size: 16px;
  animation: lightBulb 2s ease-in-out infinite;
}

@keyframes lightBulb {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.7;
    transform: scale(0.95);
  }
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.suggestion-item {
  font-size: 12px;
  color: #1D1D1F;
  padding-left: 20px;
  position: relative;
  line-height: 1.7;
  font-weight: 500;
  letter-spacing: 0px;
}

.suggestion-item::before {
  content: '▸';
  position: absolute;
  left: 6px;
  color: #007AFF;
  font-weight: 700;
  font-size: 14px;
}

.error-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.error-action-btn {
  flex: 1;
  min-width: 100px;
  padding: 9px 14px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
  color: #1D1D1F;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  -webkit-tap-highlight-color: transparent;
  letter-spacing: 0px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.error-action-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.error-action-btn:hover::before {
  opacity: 1;
}

.error-action-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.error-action-btn:active {
  transform: translateY(0px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.error-action-btn.primary {
  background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
  color: white;
  border-color: transparent;
  box-shadow: 
    0 3px 10px rgba(0, 122, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.error-action-btn.primary:hover {
  background: linear-gradient(135deg, #0066CC 0%, #4AB8E8 100%);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 5px 14px rgba(0, 122, 255, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.error-action-btn.primary:active {
  transform: translateY(0px) scale(0.98);
  box-shadow: 
    0 2px 6px rgba(0, 122, 255, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
</style>

