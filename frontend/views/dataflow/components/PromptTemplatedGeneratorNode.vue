<template>
  <div :class="['prompt-generator-node', { selected: props.selected }]">
    <!-- Node Header -->
    <div class="node-header">
      <!-- 节点级输入端点 - 左侧 -->
      <Handle
        :id="`${props.id}-node-input`"
        :handle-id="`${props.id}-node-input`"
        type="target"
        :position="Position.Left"
        class="port node-port node-input-port"
        :style="{ top: '28px', left: '-8px' }"
      />
      
      <div class="node-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
        </svg>
      </div>
      <div class="node-info">
        <div class="node-title">{{ props.data.operator.name }}</div>
        <div class="node-type">{{ props.data.operator.type }}</div>
      </div>
      <div class="node-actions">
        <button class="delete-button" @click="handleDelete" title="删除节点">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      
      <!-- 节点级输出端点 - 右侧 -->
      <Handle
        :id="`${props.id}-node-output`"
        :handle-id="`${props.id}-node-output`"
        type="source"
        :position="Position.Right"
        class="port node-port node-output-port"
        :style="{ top: '28px', right: '-8px' }"
      />
    </div>

    <!-- Dynamic Input Ports -->
    <div v-if="dynamicInputPorts.length > 0" class="input-ports" :key="`input-${dynamicInputPorts.length}`">
      <Handle
        v-for="(port, index) in dynamicInputPorts"
        :key="`input-${port.id}-${index}`"
        :id="port.id"
        :handle-id="port.id"
        type="target"
        :position="Position.Left"
        :class="['port', 'input-port', 'port-dynamic']"
        :style="{ top: `${getInputPortPosition(index)}px` }"
      >
        <div class="port-label">{{ port.name }}</div>
      </Handle>
    </div>

    <!-- Node Body (Config Area) -->
    <div class="node-body">
      <!-- Init Section: Prompt Template -->
      <div class="init-section">
        <div class="section-title">初始化配置</div>
        
        <!-- Prompt Template -->
        <div class="config-item">
          <label class="config-label">Prompt Template</label>
          <div class="textarea-container">
            <textarea
              v-model="localInitConfig.prompt_template"
              placeholder="输入提示词模板，使用 {variable_name} 表示变量"
              class="config-textarea"
              rows="4"
              @input="handleTemplateChange"
              @click="openPromptEditor"
              readonly
            ></textarea>
            <div class="textarea-overlay" @click="openPromptEditor">
              <svg class="expand-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </div>
          </div>
          
        </div>
      </div>

      <!-- Run Section -->
      <div class="run-section">
        <div class="section-title">运行配置</div>
        
        <!-- Output Key -->
        <div class="config-item">
          <label class="config-label">Output Key</label>
          <input
            v-model="localRunConfig.output_key"
            type="text"
            placeholder="输出键名"
            class="config-input"
            @input="updateRunConfig"
          />
        </div>

        <!-- Dynamic Input Fields (简化版) -->
        <div v-if="extractedVariables.length > 0" class="dynamic-fields-section">
          <div
            v-for="varName in extractedVariables"
            :key="varName"
            class="config-item"
          >
            <label class="config-label">{{ varName }}</label>
            <input
              v-model="localInputKeys[varName]"
              type="text"
              :placeholder="`请输入字段名`"
              class="config-input"
              @input="updateInputKeys"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Output Port -->
    <div class="output-ports">
      <Handle
        :id="'output_key'"
        :handle-id="'output_key'"
        type="source"
        :position="Position.Right"
        class="port output-port port-run"
        :style="{ top: `${getOutputPortPosition()}px` }"
      >
        <div class="port-label">输出内容</div>
      </Handle>
    </div>

    <!-- Resize Handle -->
    <div class="resize-handle" @mousedown="startResize">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM18 18H16V16H18V18ZM14 22H12V20H14V22ZM22 14H20V12H22V14Z"/>
      </svg>
    </div>

    <!-- Prompt Editor Dialog -->
    <PromptEditor
      v-model="showPromptEditor"
      :content="currentEditingContent"
      field-key="prompt_template"
      field-label="Prompt Template"
      @save="handlePromptSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject, nextTick } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import PromptEditor from './PromptEditor.vue'

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

// Inject parent functions
const onNodeUpdate = inject('onNodeUpdate')
const onNodeDelete = inject('onNodeDelete')

// Emits
const emit = defineEmits(['update-node'])

// Local state
const localRunConfig = ref({
  output_key: 'generated_content'
})

const localInitConfig = ref({
  prompt_template: ''
})

const localInputKeys = ref({})

// Prompt Editor state
const showPromptEditor = ref(false)
const currentEditingContent = ref('')

// Extract variables from prompt template
const extractedVariables = computed(() => {
  const template = localInitConfig.value.prompt_template
  if (!template || typeof template !== 'string') return []
  
  const regex = /\{(\w+)\}/g
  const matches = [...template.matchAll(regex)]
  const variables = matches.map(m => m[1])
  
  // 去重
  return [...new Set(variables)]
})

// 🔧 监听提取的变量变化，自动初始化 input_keys
watch(extractedVariables, (newVars) => {
  const currentKeys = { ...localInputKeys.value }
  let needsUpdate = false
  
  // 为新增的变量添加空映射
  newVars.forEach(varName => {
    if (!(varName in currentKeys)) {
      currentKeys[varName] = '' // 初始化为空字符串
      needsUpdate = true
    }
  })
  
  // 清理已删除的变量
  Object.keys(currentKeys).forEach(key => {
    if (!newVars.includes(key)) {
      delete currentKeys[key]
      needsUpdate = true
    }
  })
  
  if (needsUpdate) {
    localInputKeys.value = currentKeys
    updateInputKeys()
    console.log('[PromptTemplatedGenerator] 自动更新 input_keys:', currentKeys)
  }
}, { immediate: true })

// Dynamic input ports based on extracted variables
const dynamicInputPorts = computed(() => {
  return extractedVariables.value.map((varName, index) => ({
    id: varName,
    name: varName,
    type: 'data',
    category: 'dynamic'
  }))
})

// Methods
const getInputPortPosition = (index) => {
  const headerHeight = 56
  const initSectionTitleHeight = 28
  const templateFieldHeight = 160 // textarea + label + variables display
  const runSectionTitleHeight = 28
  const outputKeyFieldHeight = 60
  const fieldHeight = 60 // 每个动态字段的高度
  
  // 计算到动态字段区域的偏移
  let offset = headerHeight + initSectionTitleHeight + templateFieldHeight
  offset += runSectionTitleHeight + outputKeyFieldHeight
  
  // 加上当前字段之前的所有字段高度，并对齐到字段中间
  offset += index * fieldHeight + (fieldHeight / 2)
  
  return offset
}

const getOutputPortPosition = () => {
  const headerHeight = 56
  const initSectionTitleHeight = 28
  const templateFieldHeight = 160
  const runSectionTitleHeight = 28
  const outputKeyFieldHeight = 60
  
  // Output port 对齐到 Output Key 字段中间
  return headerHeight + initSectionTitleHeight + templateFieldHeight + 
         runSectionTitleHeight + (outputKeyFieldHeight / 2)
}

const handleTemplateChange = () => {
  // 模板变化时只需要更新 initConfig
  // input_keys 的同步由 watch(extractedVariables) 自动处理
  updateInitConfig()
}

const updateRunConfig = () => {
  if (onNodeUpdate) {
    onNodeUpdate(props.id, {
      runConfig: { ...localRunConfig.value }
    })
  } else {
    emit('update-node', props.id, {
      runConfig: { ...localRunConfig.value }
    })
  }
}

const updateInitConfig = () => {
  if (onNodeUpdate) {
    onNodeUpdate(props.id, {
      initConfig: { ...localInitConfig.value }
    })
  } else {
    emit('update-node', props.id, {
      initConfig: { ...localInitConfig.value }
    })
  }
}

const updateInputKeys = () => {
  // 将 input_keys 保存到 runConfig 中
  const updatedRunConfig = {
    ...localRunConfig.value,
    input_keys: { ...localInputKeys.value }
  }
  
  if (onNodeUpdate) {
    onNodeUpdate(props.id, {
      runConfig: updatedRunConfig
    })
  } else {
    emit('update-node', props.id, {
      runConfig: updatedRunConfig
    })
  }
}

const startResize = (event) => {
  event.preventDefault()
  console.log('Start resize')
}

const handleDelete = () => {
  if (onNodeDelete) {
    onNodeDelete(props.id)
  }
}

// Prompt Editor methods
const openPromptEditor = () => {
  currentEditingContent.value = localInitConfig.value.prompt_template || ''
  showPromptEditor.value = true
}

const handlePromptSave = (content) => {
  localInitConfig.value.prompt_template = content
  updateInitConfig()
  handleTemplateChange()
}

// Initialize config
const initializeConfig = () => {
  const operator = props.data.operator
  const defaultRunConfig = operator.config?.run || {}
  const defaultInitConfig = operator.config?.init || {}
  
  // 初始化 init 配置
  localInitConfig.value = {
    prompt_template: '',
    ...defaultInitConfig,
    ...(props.data.initConfig || {})
  }
  
  // 初始化 run 配置
  const savedRunConfig = props.data.runConfig || {}
  localRunConfig.value = {
    output_key: 'generated_content',
    ...defaultRunConfig,
    ...savedRunConfig
  }
  
  // 提取 input_keys
  if (savedRunConfig.input_keys) {
    localInputKeys.value = { ...savedRunConfig.input_keys }
  } else {
    localInputKeys.value = {}
  }
}

// Lifecycle
onMounted(() => {
  initializeConfig()
})

// Watch for node data changes
watch(() => props.data, (newData, oldData) => {
  initializeConfig()
}, { deep: true, immediate: true })

// 监听 runConfig.input_keys 的变化（来自连线传递）
watch(() => props.data?.runConfig?.input_keys, (newInputKeys) => {
  if (newInputKeys) {
    console.log('[PromptTemplatedGenerator] 检测到 input_keys 更新:', newInputKeys)
    // 直接更新本地状态，不触发 updateInputKeys（避免循环）
    localInputKeys.value = { ...newInputKeys }
  }
}, { deep: true })

// 监听时间戳变化来强制更新
watch(() => props.data?._timestamp, (newTimestamp) => {
  if (newTimestamp) {
    nextTick(() => {
      initializeConfig()
    })
  }
})
</script>

<style scoped>
.prompt-generator-node {
  background: white;
  border: 2px solid #E5E5EA;
  border-radius: 12px;
  min-width: 320px;
  min-height: 180px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

.prompt-generator-node:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.prompt-generator-node.selected {
  border-color: #AF52DE;
  box-shadow: 0 0 0 3px rgba(175, 82, 222, 0.2);
}

/* Node Header */
.node-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #F5ECFF 0%, #EAD9FF 100%);
  border-bottom: 1px solid #E5E5EA;
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
  color: #AF52DE;
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
  color: #AF52DE;
  font-weight: 500;
}

.node-actions {
  margin-left: 8px;
}

.delete-button {
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(255, 59, 48, 0.1);
  color: #FF3B30;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0.7;
  border: 1px solid rgba(255, 59, 48, 0.3);
}

.delete-button:hover {
  opacity: 1;
  background: #FF3B30;
  color: white;
  transform: scale(1.1);
}

.delete-button:active {
  transform: scale(0.95);
}

/* Node Body */
.node-body {
  padding: 16px;
}

.init-section,
.run-section {
  margin-bottom: 16px;
}

.init-section:last-child,
.run-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #1C1C1E;
  margin-bottom: 12px;
  padding-bottom: 4px;
  border-bottom: 1px solid #E5E5EA;
}

.init-section .section-title {
  color: #34C759;
}

.run-section .section-title {
  color: #AF52DE;
}

.config-item {
  margin-bottom: 12px;
}

.config-item:last-child {
  margin-bottom: 0;
}

.config-label {
  font-size: 13px;
  font-weight: 500;
  color: #1C1C1E;
  margin-bottom: 6px;
  display: block;
}

.config-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #E5E5EA;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: all 0.2s ease;
  font-family: inherit;
}

.config-input:focus {
  outline: none;
  border-color: #AF52DE;
  box-shadow: 0 0 0 3px rgba(175, 82, 222, 0.1);
}

.textarea-container {
  position: relative;
  display: flex;
  align-items: stretch;
}

.config-textarea {
  width: 100%;
  padding: 8px 12px;
  padding-right: 40px;
  border: 1px solid #E5E5EA;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: all 0.2s ease;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  line-height: 1.4;
  cursor: pointer;
}

.config-textarea[readonly] {
  background: #FAFAFA;
  color: #1C1C1E;
}

.config-textarea[readonly]:hover {
  background: #F2F2F7;
}

.textarea-overlay {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  color: #8E8E93;
  transition: all 0.2s ease;
}

.textarea-overlay:hover {
  background: rgba(175, 82, 222, 0.1);
  color: #AF52DE;
}

.expand-icon {
  width: 16px;
  height: 16px;
}

/* Template Variables Display */
.template-variables {
  margin-top: 8px;
  padding: 10px;
  background: #F8FBFF;
  border-radius: 8px;
  border: 1px solid #E0F0FF;
}

.variables-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #AF52DE;
  margin-bottom: 8px;
}

.variables-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.variable-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: white;
  border: 1px solid #E5E5EA;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #1C1C1E;
  font-family: 'SF Mono', Consolas, monospace;
}

/* Dynamic Fields Section */
.dynamic-fields-section {
  margin-top: 12px;
}

/* Ports */
.input-ports,
.output-ports {
  position: absolute;
  top: 0;
  height: 100%;
  pointer-events: none;
}

.input-ports {
  left: -8px;
}

.output-ports {
  right: -8px;
}

.port {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  cursor: crosshair;
  pointer-events: all;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.port:hover {
  transform: translateY(-50%) scale(1.2);
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.2);
}

/* Dynamic Input Ports */
.input-port.port-dynamic {
  background: linear-gradient(135deg, #AF52DE, #C98EE8);
  border-color: #AF52DE;
  box-shadow: 0 2px 6px rgba(175, 82, 222, 0.4);
}

.input-port.port-dynamic:hover {
  background: linear-gradient(135deg, #8E42B8, #AF52DE);
  box-shadow: 0 0 0 4px rgba(175, 82, 222, 0.5), 0 2px 8px rgba(175, 82, 222, 0.3);
  transform: translateY(-50%) scale(1.3);
}

/* Output Port */
.output-port.port-run {
  background: linear-gradient(135deg, #FFB366, #FF9500);
  border: 2px solid #FF9500;
  box-shadow: 0 3px 8px rgba(255, 149, 0, 0.4);
}

.output-port:hover {
  background: linear-gradient(135deg, #E6850E, #CC7A00);
  box-shadow: 0 0 0 4px rgba(255, 149, 0, 0.5), 0 3px 12px rgba(255, 149, 0, 0.4);
  transform: translateY(-50%) scale(1.3);
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
}

.input-port .port-label {
  left: 24px;
}

.output-port .port-label {
  right: 24px;
}

.port:hover .port-label {
  opacity: 1;
}

/* Node Ports */
.node-port {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  cursor: crosshair;
  pointer-events: all;
  transition: all 0.2s ease;
  transform: translateY(-50%);
  z-index: 10;
}

.node-input-port {
  background: linear-gradient(135deg, #8E8E93, #AEAEB2);
  border-color: #8E8E93;
  box-shadow: 0 2px 6px rgba(142, 142, 147, 0.4);
}

.node-input-port:hover {
  background: linear-gradient(135deg, #6D6D70, #8E8E93);
  box-shadow: 0 0 0 4px rgba(142, 142, 147, 0.5), 0 2px 8px rgba(142, 142, 147, 0.3);
  transform: translateY(-50%) scale(1.3);
}

.node-output-port {
  background: linear-gradient(135deg, #8E8E93, #AEAEB2);
  border-color: #8E8E93;
  box-shadow: 0 2px 6px rgba(142, 142, 147, 0.4);
}

.node-output-port:hover {
  background: linear-gradient(135deg, #6D6D70, #8E8E93);
  box-shadow: 0 0 0 4px rgba(142, 142, 147, 0.5), 0 2px 8px rgba(142, 142, 147, 0.3);
  transform: translateY(-50%) scale(1.3);
}

/* Resize Handle */
.resize-handle {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  cursor: nw-resize;
  color: #C7C7CC;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.resize-handle:hover {
  background: #F2F2F7;
  color: #8E8E93;
}

/* Vue Flow Handle Overrides */
:deep(.vue-flow__handle) {
  width: 16px !important;
  height: 16px !important;
  border: 2px solid white !important;
  border-radius: 50% !important;
  cursor: crosshair !important;
  transition: all 0.2s ease !important;
}

:deep(.vue-flow__handle[type="target"]) {
  background: linear-gradient(135deg, #AF52DE, #C98EE8) !important;
  box-shadow: 0 2px 4px rgba(175, 82, 222, 0.3) !important;
}

:deep(.vue-flow__handle[type="source"]) {
  background: linear-gradient(135deg, #FFB366, #FF9500) !important;
  border: 2px solid #FF9500 !important;
  box-shadow: 0 3px 8px rgba(255, 149, 0, 0.4) !important;
}

:deep(.vue-flow__handle[type="target"]:hover) {
  background: linear-gradient(135deg, #8E42B8, #AF52DE) !important;
  transform: scale(1.2) !important;
  box-shadow: 0 0 0 4px rgba(175, 82, 222, 0.4), 0 2px 6px rgba(175, 82, 222, 0.3) !important;
}

:deep(.vue-flow__handle[type="source"]:hover) {
  background: linear-gradient(135deg, #E6850E, #CC7A00) !important;
  transform: scale(1.2) !important;
  box-shadow: 0 0 0 4px rgba(255, 149, 0, 0.5), 0 3px 12px rgba(255, 149, 0, 0.4) !important;
}

:deep(.vue-flow__handle.connecting) {
  background: #FF9500 !important;
  transform: scale(1.3) !important;
  box-shadow: 0 0 0 4px rgba(255, 149, 0, 0.4), 0 2px 8px rgba(255, 149, 0, 0.3) !important;
}

:deep(.vue-flow__handle.valid) {
  background: #34C759 !important;
  box-shadow: 0 0 0 4px rgba(52, 199, 89, 0.4), 0 2px 6px rgba(52, 199, 89, 0.3) !important;
}
</style>

