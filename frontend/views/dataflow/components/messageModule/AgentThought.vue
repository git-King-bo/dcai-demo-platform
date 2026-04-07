<template>
  <div class="agent-thought">
    <div class="thought-header">
      <span class="thought-stage">{{ stageText }}</span>
      <span class="thought-time">{{ formatTime(timestamp) }}</span>
    </div>
    
    <div class="thought-content">
      <div 
        v-for="(thought, index) in thoughts" 
        :key="index"
        class="thought-item"
        :style="{ animationDelay: `${index * 150}ms` }"
      >
        <div class="thought-bullet">▸</div>
        <div class="thought-text">
          <div class="thought-main">{{ thought.content }}</div>
          <div v-if="thought.reasoning" class="thought-reasoning">
            → {{ thought.reasoning }}
          </div>
        </div>
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
  },
  timestamp: {
    type: String,
    default: ''
  }
})

const stageText = computed(() => {
  const stageMap = {
    'analysis': '分析阶段',
    'planning': '规划阶段',
    'execution': '执行阶段'
  }
  return stageMap[props.content.stage] || '思考中'
})

const thoughts = computed(() => {
  return props.content.thoughts || []
})

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

<style scoped>
/* ========================================
   Thought Message - Workflow Design
   去掉对话框感觉，改为工作流展示
   ======================================== */
.agent-thought {
  background: linear-gradient(90deg, rgba(255, 149, 0, 0.04) 0%, rgba(255, 149, 0, 0.01) 100%);
  border-left: 4px solid #FF9500;
  border-radius: 0 12px 12px 0;
  padding: 14px 16px 14px 20px;
  margin: 12px 0;
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: none;
  border-top: none;
  border-right: none;
  border-bottom: none;
}

.agent-thought::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #FF9500 0%, #FFAD33 100%);
  animation: borderGlow 2s ease-in-out infinite;
}

@keyframes borderGlow {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 8px rgba(255, 149, 0, 0.3);
  }
  50% {
    opacity: 0.8;
    box-shadow: 0 0 16px rgba(255, 149, 0, 0.5);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.thought-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 149, 0, 0.15);
}

.thought-icon {
  font-size: 20px;
  animation: thinkingPulse 2s ease-in-out infinite;
  filter: drop-shadow(0 2px 4px rgba(255, 149, 0, 0.4));
}

@keyframes thinkingPulse {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1) rotate(0deg);
  }
  25% { 
    opacity: 0.8;
    transform: scale(0.95) rotate(-5deg);
  }
  50% { 
    opacity: 0.9;
    transform: scale(1.05) rotate(5deg);
  }
  75% { 
    opacity: 0.8;
    transform: scale(0.95) rotate(-5deg);
  }
}

@keyframes pulse {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.7;
    transform: scale(0.96);
  }
}

.thought-stage {
  flex: 1;
  font-size: 14px;
  font-weight: 700;
  color: #FF9500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.thought-time {
  font-size: 11px;
  font-weight: 400;
  color: #86868B;
  letter-spacing: 0px;
  font-variant-numeric: tabular-nums;
}

.thought-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.thought-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 6px 8px;
  background: transparent;
  border-radius: 0;
  animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  opacity: 0;
  transition: all 0.15s ease;
}

.thought-item:hover {
  background: rgba(255, 149, 0, 0.06);
  transform: translateX(4px);
  border-radius: 6px;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.thought-bullet {
  color: #FF9500;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
  line-height: 1.4;
}

.thought-text {
  flex: 1;
  min-width: 0;
}

.thought-main {
  color: #1D1D1F;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.7;
  letter-spacing: -0.1px;
  word-wrap: break-word;
}

.thought-reasoning {
  color: #86868B;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.6;
  margin-top: 4px;
  padding-left: 10px;
  border-left: 2px solid rgba(255, 149, 0, 0.25);
  letter-spacing: 0px;
}
</style>

