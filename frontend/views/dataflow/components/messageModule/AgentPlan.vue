<template>
  <div class="agent-plan">
    <div class="plan-header">
      <div class="plan-title">
        <span>执行计划</span>
      </div>
      <div class="plan-estimate">
        <span>共{{ steps.length }}步</span>
        <span v-if="estimatedDuration" class="separator">·</span>
      </div>
    </div>
    
    <div class="plan-steps">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        class="plan-step"
        :style="{ animationDelay: `${index * 100}ms` }"
      >
        <div class="step-number">{{ step.stepNumber || index + 1 }}</div>
        <div class="step-content">
          <div class="step-action">{{ step.description }}</div>
          <div class="step-reason">
            <span class="reason-icon">💡</span>
            <span>{{ step.reason }}</span>
          </div>
          <div v-if="step.config" class="step-config">
            <span class="config-icon">⚙️</span>
            <span>{{ formatConfig(step.config) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="plan-actions">
      <button 
        class="plan-action-btn primary"
        @click="$emit('confirm')"
      >
        <span>确认</span>
      </button>
      <button 
        class="plan-action-btn secondary"
        @click="$emit('save')"
      >
        <span>保存</span>
      </button>
      <button 
        class="plan-action-btn secondary"
        @click="$emit('modify')"
      >
        <span>修改</span>
      </button>
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

const emit = defineEmits(['confirm', 'reject', 'modify', 'save'])

const steps = computed(() => props.content.steps || [])
const estimatedDuration = computed(() => props.content.estimatedDuration)

const formatConfig = (config) => {
  if (!config) return ''
  
  // 提取关键配置项
  const displayConfig = {}
  
  if (config.operator) {
    displayConfig.operator = config.operator
  }
  
  if (config.run) {
    // 只显示前3个配置项
    const runKeys = Object.keys(config.run).slice(0, 3)
    runKeys.forEach(key => {
      displayConfig[key] = config.run[key]
    })
  }
  
  return Object.entries(displayConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ')
}
</script>

<style scoped>
/* ========================================
   Plan Message - Task Board Design
   改为任务看板样式，突出可执行性
   ======================================== */
.agent-plan {
  background: linear-gradient(90deg, rgba(0, 122, 255, 0.04) 0%, rgba(90, 200, 250, 0.02) 100%);
  border-left: 4px solid #007AFF;
  border-radius: 0 16px 16px 0;
  padding: 16px 18px 16px 20px;
  margin: 16px 0;
  box-shadow: none;
  animation: slideIn 0.5s cubic-bezier(0.32, 0.72, 0, 1);
  position: relative;
  overflow: visible;
}

.agent-plan::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #007AFF 0%, #5AC8FA 100%);
  box-shadow: 0 0 12px rgba(0, 122, 255, 0.4);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-16px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.plan-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 122, 255, 0.15);
  position: relative;
  z-index: 1;
}

.plan-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: #007AFF;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.plan-icon {
  font-size: 22px;
  filter: drop-shadow(0 2px 4px rgba(0, 122, 255, 0.3));
  animation: iconBounce 1.5s ease-in-out infinite;
}

@keyframes iconBounce {
  0%, 100% { 
    transform: translateY(0); 
  }
  50% { 
    transform: translateY(-3px); 
  }
}

.plan-estimate {
  font-size: 12px;
  color: #86868B;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: -0.1px;
}

.separator {
  color: #D1D1D6;
  margin: 0 2px;
}

.plan-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
}

.plan-step {
  display: flex;
  gap: 12px;
  padding: 12px 10px;
  background: rgba(255, 255, 255, 0.6);
  border: none;
  border-left: 3px solid transparent;
  border-radius: 0 8px 8px 0;
  transition: all 0.25s cubic-bezier(0.32, 0.72, 0, 1);
  cursor: pointer;
  animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  opacity: 0;
  position: relative;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.plan-step::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: linear-gradient(90deg, rgba(0, 122, 255, 0.1) 0%, transparent 100%);
  transition: width 0.3s ease;
  border-radius: 0 8px 8px 0;
}

.plan-step:hover {
  background: rgba(255, 255, 255, 0.9);
  border-left-color: #007AFF;
  transform: translateX(6px);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.12);
}

.plan-step:hover::before {
  width: 100%;
}

.plan-step:active {
  transform: translateX(4px);
}

.step-number {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 
    0 2px 6px rgba(0, 122, 255, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  font-variant-numeric: tabular-nums;
  position: relative;
  z-index: 1;
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-action {
  font-size: 14px;
  font-weight: 600;
  color: #1D1D1F;
  line-height: 1.5;
  letter-spacing: -0.2px;
}

.step-reason,
.step-config {
  font-size: 12px;
  color: #86868B;
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.5;
  letter-spacing: -0.1px;
}

.reason-icon,
.config-icon {
  font-size: 13px;
  flex-shrink: 0;
}

.step-config {
  font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 11px;
  background: rgba(0, 0, 0, 0.03);
  padding: 6px 10px;
  border-radius: 6px;
  margin-top: 2px;
  border: 0.5px solid rgba(0, 0, 0, 0.04);
}

.plan-actions {
  display: flex;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid rgba(0, 122, 255, 0.15);
  position: relative;
  z-index: 1;
  margin-top: 4px;
}

.plan-action-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.32, 0.72, 0, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  letter-spacing: 0px;
  position: relative;
  overflow: hidden;
}

.plan-action-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.plan-action-btn:hover::before {
  opacity: 1;
}

.plan-action-btn.primary {
  background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
  color: white;
  box-shadow: 
    0 3px 10px rgba(0, 122, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.plan-action-btn.primary:hover {
  background: linear-gradient(135deg, #0066CC 0%, #4AB8E8 100%);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 5px 14px rgba(0, 122, 255, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.plan-action-btn.primary:active {
  transform: translateY(0px) scale(0.98);
  box-shadow: 
    0 2px 6px rgba(0, 122, 255, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.plan-action-btn.secondary {
  background: rgba(255, 255, 255, 0.7);
  color: #1D1D1F;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.plan-action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.plan-action-btn.secondary:active {
  transform: translateY(0px);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.btn-icon {
  font-size: 15px;
  line-height: 1;
}
</style>

