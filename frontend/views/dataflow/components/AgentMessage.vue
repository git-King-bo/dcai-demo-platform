<template>
  <div class="agent-message-wrapper">
    <!-- 用户消息 -->
    <div v-if="message.type === 'user_message'" class="user-message-container">
      <div class="user-message">
        <div class="message-header">
          <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        </div>
        <div class="message-text">{{ getUserText }}</div>
      </div>
    </div>
    
    <!-- 系统消息 -->
    <div v-else-if="message.type === 'system_message'" class="system-message">
      <div class="system-text" v-html="formatSystemText(getSystemText)"></div>
    </div>
    
    <!-- Agent消息 -->
    <div v-else-if="message.type === 'agent_message'" class="agent-message-container">
      <component 
        :is="getAgentComponent" 
        :content="message.payload.content"
        :timestamp="message.timestamp"
        @confirm="$emit('confirm')"
        @reject="$emit('reject')"
        @modify="$emit('modify')"
        @save="$emit('save')"
        @action="$emit('action', $event)"
        @cancel="$emit('cancel')"
        @view-node="$emit('view-node', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AgentThought from './messageModule/AgentThought.vue'
import AgentPlan from './messageModule/AgentPlan.vue'
import AgentAction from './messageModule/AgentAction.vue'
import AgentError from './messageModule/AgentError.vue'
import AgentRunStarted from './messageModule/AgentRunStarted.vue'
import AgentPipelineDebugUpdate from './messageModule/AgentPipelineDebugUpdate.vue'
import AgentPlanDecision from './messageModule/AgentPlanDecision.vue'
import AgentRunFinished from './messageModule/AgentRunFinished.vue'
import AgentFormRequest from './messageModule/AgentFormRequest.vue'
import MessageConfirm from './messageModule/MessageConfirm.vue'
import AgentOperatorExplanation from './messageModule/AgentOperatorExplanation.vue'
import QuestionClosely from './messageModule/QuestionClosely.vue'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['confirm', 'reject', 'modify', 'action', 'cancel', 'view-node', 'save'])

const getUserText = computed(() => {
  return props.message.payload?.text || props.message.payload || ''
})

const getSystemText = computed(() => {
  return props.message.payload?.text || props.message.payload || ''
})

const getAgentComponent = computed(() => {
  const payloadType = props.message.payload?.type
  console.log('payloadType=>>>>>>>>>>>>>>>>>>>%',payloadType);
  
  const componentMap = {
    // 旧格式消息类型
    'thought': AgentThought,
    'plan': AgentPlan,
    'action': AgentAction,
    'error': AgentError,
    // 新格式消息类型
    'run_started': AgentRunStarted,
    'plan_decision': AgentPlanDecision,
    'run_finished': AgentRunFinished,
    'form_request': AgentFormRequest,
    'pipeline_debug_update': AgentPipelineDebugUpdate,
    'instruction': MessageConfirm,
    'operator_explanation': AgentOperatorExplanation,
    'question_closely': QuestionClosely,
  }
  
  return componentMap[payloadType] || null
})

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const formatSystemText = (text) => {
  // 将换行转换为 <br>
  return text.replace(/\n/g, '<br>')
}
</script>

<style scoped>
/* ========================================
   Message Wrapper - Apple Design
   ======================================== */
.agent-message-wrapper {
  margin: 10px 0;
}

/* User Message */
.user-message-container {
  display: flex;
  justify-content: flex-end;
  margin: 14px 0;
  animation: slideInRight 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(24px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.user-message {
  max-width: 80%;
  background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
  color: white;
  border-radius: 18px 18px 4px 18px;
  padding: 12px 16px;
  box-shadow: 
    0 4px 12px rgba(0, 122, 255, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
  opacity: 0.85;
}

.user-avatar {
  font-size: 14px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.message-time {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.75;
  letter-spacing: -0.1px;
}

.message-text {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  letter-spacing: -0.2px;
}

/* System Message */
.system-message {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: white;
  border: 0.5px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  margin: 12px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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

.system-icon {
  font-size: 20px;
  flex-shrink: 0;
  line-height: 1.6;
}

.system-text {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.7;
  color: #1D1D1F;
  letter-spacing: -0.2px;
}

.system-text :deep(br) {
  margin: 6px 0;
}

/* Agent Message Container */
.agent-message-container {
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

