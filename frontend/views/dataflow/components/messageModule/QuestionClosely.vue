<template>
  <div class="run-started-card" v-if="true">
    <div class="status-indicator">
      <!-- <img class="w-10 h-8 bot-rotate" src="https://img.js.design/assets/img/69008a8640d5d2a02e09ae45.png" alt=""> -->
      <img class="w-10 h-8 bot-rotate" src="@/assets/images/agentBot.jpg" alt="">

      <span v-if="props.content?.historyMsg" class="status-text" >{{props.content?.data?.result}}</span>
      <span v-else class="status-text">
        <span v-for="(char, idx) in displayText" :key="idx">
          <span v-if="char === '\n'" class="break-line"></span>
          <span v-else>{{ char }}</span>
        </span>
      </span>
    </div>

    <div v-if="timestamp && textStop" class="timestamp">
      {{ formatTime(timestamp) }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, inject } from 'vue'
import { useAgentMessages } from '@/composables/useAgentMessages'

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
const agentScrollToBottom = inject('agentScrollToBottom')
const displayText = ref(false)
const textStop= ref(false)
let typeTimer = null
const {
  scrollToBottom,
  
} = useAgentMessages()
const startTyping = (text) => {
    if(props.content?.historyMsg) {
        textStop.value= true
        return
    }
    if (typeTimer) clearInterval(typeTimer)
    displayText.value = ''
    let index = 0
    typeTimer = setInterval(() => {
        if (index < text.length) {
        displayText.value += text[index]
        index++
        // agentScrollToBottom()
        } else {
        agentScrollToBottom()
        textStop.value= true
        clearInterval(typeTimer)
        }
    }, 30) // 调整打字速度
}



watch(
  () => props.content?.data?.result,
  (newVal) => {
    if (newVal) startTyping(newVal)
  },
  { immediate: true }
)
watch(
  () => props.content?.text,
  (newVal) => {
    if (newVal) startTyping(newVal)
  },
  { immediate: true }
)

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
  display: inline-block;
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
  /* align-items: center; */
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
  white-space: pre-wrap;
  word-break: break-word;
}

.break-line {
  display: block;
  height: 0;
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
.bot-rotate{
    transform: rotate3d(1, 30, 1, 180deg);
}
</style>
