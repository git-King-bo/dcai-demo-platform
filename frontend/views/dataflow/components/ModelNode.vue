<template>
  <div :class="['model-node', { selected: props.selected }]">
    <!-- Node Header -->
    <div class="node-header">
      <div class="node-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 10.1 9.9 11 11 11V16L7.5 17.5C7.09 17.66 6.84 18.08 6.84 18.5S7.09 19.34 7.5 19.5L11 21V22H13V21L16.5 19.5C16.91 19.34 17.16 18.92 17.16 18.5S16.91 17.66 16.5 17.5L13 16V11C14.1 11 15 10.1 15 9ZM12 8C12.55 8 13 7.55 13 7S12.55 6 12 6 11 6.45 11 7 11.45 8 12 8Z"/>
        </svg>
      </div>
      <div class="node-info">
        <div class="node-title">算力配置</div>
        <div class="node-type">MODEL</div>
      </div>
      <div class="node-status">
        <div :class="['status-indicator', statusClass]"></div>
      </div>
    </div>

    <!-- Node Body -->
    <div class="node-body">
      <!-- Model Configuration Section -->
      <div class="model-section">
        
        <div class="config-item">
          <label class="config-label">模型名称</label>
          <input 
            v-model="localConfig.name"
            type="text"
            class="config-input readonly"
            placeholder="请输入模型名称"
            readonly
          />
        </div>

        <div class="config-item">
          <label class="config-label">Base URL</label>
          <input 
            v-model="localConfig.baseUrl"
            type="text"
            class="config-input readonly"
            placeholder="请输入模型API的base URL"
            readonly
          />
        </div>

        <div class="config-item">
          <label class="config-label">API Key</label>
          <input 
            v-model="localConfig.apiKey"
            type="password"
            class="config-input readonly"
            placeholder="请输入API密钥"
            readonly
          />
        </div>

        <!-- Save Button -->
        <div class="config-item">
          <button class="save-model-btn" @click="saveModelConfig" :disabled="saving">
            <svg class="button-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3ZM19 19H5V5H16.17L19 7.83V19ZM12 12C10.34 12 9 13.34 9 15S10.34 18 12 18 15 16.66 15 15 13.66 12 12 12ZM6 6V10H15V6H6Z"/>
            </svg>
            {{ saving ? '保存中...' : (hasConfigChanged ? '保存更改' : '确认配置') }}
          </button>
        </div>
      </div>

    </div>

    <!-- Output Port -->
    <div class="output-ports">
      <Handle
        id="model-output"
        type="source"
        :position="Position.Right"
        class="port output-port port-model"
        :style="{ top: '50%' }"
      >
        <div class="port-label">模型输出</div>
      </Handle>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { ElMessage } from 'element-plus'
import { saveSystemConfig } from '@/api/settings.js'

// Props
const props = defineProps({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  },
  position: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update-node'])

// Inject the update function from parent
const onNodeUpdate = inject('onNodeUpdate', null)
const onNodeDelete = inject('onNodeDelete', null)

// Local state
const localConfig = ref({
  name: '',
  baseUrl: '',
  apiKey: ''
})
const nodeStatus = ref('idle')
const saving = ref(false)
const originalConfig = ref({}) // 保存初始配置用于比较

// Computed
const statusClass = computed(() => {
  return `status-${nodeStatus.value}`
})

const hasConfigChanged = computed(() => {
  // 只比较关键的配置字段
  const current = {
    name: localConfig.value.name,
    baseUrl: localConfig.value.baseUrl,
    apiKey: localConfig.value.apiKey
  }
  
  const original = {
    name: originalConfig.value.name || '',
    baseUrl: originalConfig.value.baseUrl || '',
    apiKey: originalConfig.value.apiKey || ''
  }
  
  return JSON.stringify(current) !== JSON.stringify(original)
})

// Methods
const updateConfig = () => {
  if (onNodeUpdate) {
    onNodeUpdate(props.id, {
      config: { ...localConfig.value }
    })
  } else {
    // Fallback to emit if inject is not available
    emit('update-node', props.id, {
      config: { ...localConfig.value }
    })
  }
}

// Save model configuration to system config
const saveModelConfig = async () => {
  if (!localConfig.value.name || !localConfig.value.baseUrl || !localConfig.value.apiKey) {
    ElMessage.warning('请填写完整的算力配置信息')
    return
  }

  // 检查配置是否有变更
  if (!hasConfigChanged.value) {
    ElMessage.success('算力配置已确认')
    // 直接移除节点，不调用API
    if (onNodeDelete) {
      onNodeDelete(props.id)
    }
    return
  }

  try {
    saving.value = true
    
    // 构建系统配置数据
    const systemConfigData = {
      type: 'llm',
      name: localConfig.value.name,
      content: {
        openai_api_key: localConfig.value.apiKey,
        openai_base_url: localConfig.value.baseUrl,
      },
      introduction: localConfig.value.name,
      openai_compatible: true
    }
    
    console.log('保存系统配置数据:', systemConfigData)
    console.log('配置已变更，调用saveSystemConfig API')
    const result = await saveSystemConfig(systemConfigData)
    console.log('保存系统配置响应:', result)
    
    if (result.code === 0) {
      ElMessage.success('算力配置已保存到系统配置')
      nodeStatus.value = 'success'
      
      // 移除节点
      if (onNodeDelete) {
        onNodeDelete(props.id)
      }
    } else {
      ElMessage.error('保存算力配置失败：' + (result.msg || '未知错误'))
    }
  } catch (error) {
    console.error('保存算力配置失败:', error)
    ElMessage.error('保存算力配置失败: ' + (error.message || '网络错误'))
  } finally {
    saving.value = false
  }
}

// Initialize config
const initializeConfig = () => {
  const defaultConfig = props.data.config || {}
  localConfig.value = { 
    name: '',
    baseUrl: '',
    apiKey: '',
    ...defaultConfig 
  }
  
  // 保存原始配置用于变更检测
  originalConfig.value = {
    name: localConfig.value.name,
    baseUrl: localConfig.value.baseUrl,
    apiKey: localConfig.value.apiKey
  }
  
  console.log('ModelNode 初始化配置:', localConfig.value)
  console.log('ModelNode 原始配置:', originalConfig.value)
}

// Lifecycle
onMounted(() => {
  console.log('ModelNode mounted with props:', props)
  initializeConfig()
})

// Watch for data changes
watch(() => props.data, () => {
  initializeConfig()
}, { deep: true })
</script>

<style scoped>
.model-node {
  background: white;
  border: 2px solid #007AFF;
  border-radius: 12px;
  min-width: 280px;
  min-height: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  touch-action: auto;
}

.model-node:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.model-node.selected {
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
}

/* Node Header */
.node-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #F0F8FF 0%, #E6F3FF 100%);
  border-bottom: 1px solid #B3D9FF;
  border-radius: 10px 10px 0 0;
}

.node-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #007AFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.node-info {
  flex: 1;
}

.node-title {
  font-size: 15px;
  font-weight: 600;
  color: #1C1C1E;
  line-height: 1.2;
  margin-bottom: 2px;
}

.node-type {
  font-size: 12px;
  color: #007AFF;
  font-weight: 500;
}

.node-status {
  margin-left: 8px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #C7C7CC;
}

.status-indicator.status-success {
  background: #34C759;
}

/* Node Body */
.node-body {
  padding: 16px;
}

.model-section {
  margin-bottom: 16px;
}

.model-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #007AFF;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #E5E5EA;
}

.config-item {
  margin-bottom: 12px;
}

.config-item:last-child {
  margin-bottom: 0;
}

.config-label {
  font-size: 13px;
  font-weight: 600;
  color: #1C1C1E;
  margin-bottom: 6px;
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.config-input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #E5E5EA;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

.config-input:focus:not(.readonly) {
  border-color: #007AFF;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}

.config-input:hover:not(:focus):not(.readonly) {
  border-color: #C7C7CC;
}

.config-input.readonly {
  background: #F2F2F7;
  color: #8E8E93;
  cursor: not-allowed;
  border-color: #E5E5EA;
}

.config-input.readonly:hover {
  border-color: #E5E5EA;
}

.config-input::placeholder {
  color: #8E8E93;
  font-weight: 400;
}

/* Checkbox Styling */
.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-checkbox {
  width: 18px;
  height: 18px;
  border: 1.5px solid #E5E5EA;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.config-checkbox:checked {
  background: #007AFF;
  border-color: #007AFF;
}

.config-checkbox:checked::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.config-checkbox:hover:not(:checked) {
  border-color: #C7C7CC;
}

.checkbox-label {
  font-size: 14px;
  font-weight: 500;
  color: #1C1C1E;
  cursor: pointer;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

/* Save Button Styling */
.save-model-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #007AFF;
  border-radius: 10px;
  background: #007AFF;
  color: white;
  font-size: 14px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.save-model-btn:hover:not(:disabled) {
  background: #0056CC;
  border-color: #0056CC;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.25);
}

.save-model-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.2);
}

.save-model-btn:disabled {
  background: #C7C7CC;
  border-color: #C7C7CC;
  color: #8E8E93;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.save-model-btn .button-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* Output Ports */
.output-ports {
  position: absolute;
  top: 0;
  right: -8px;
  height: 100%;
  pointer-events: none;
}

.port {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  background: #007AFF;
  cursor: crosshair;
  pointer-events: all;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
}

.port:hover {
  background: #0056CC;
  transform: translateY(-50%) scale(1.2);
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.2);
}

.port-label {
  position: absolute;
  font-size: 11px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  transform: translateY(-50%);
  right: 24px;
}

.port:hover .port-label {
  opacity: 1;
}

/* Vue Flow Handle Overrides */
:deep(.vue-flow__handle) {
  width: 16px !important;
  height: 16px !important;
  border: 2px solid white !important;
  border-radius: 50% !important;
  background: #007AFF !important;
  cursor: crosshair !important;
  transition: all 0.2s ease !important;
}

:deep(.vue-flow__handle:hover) {
  background: #0056CC !important;
  transform: scale(1.2) !important;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.2) !important;
}
</style>