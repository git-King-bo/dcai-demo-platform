<template>
  <div :class="['uniparser-node', { selected: props.selected }]">
    <!-- Input Ports (左侧) -->
    <div v-if="inputPorts.length > 0" class="input-ports">
      <Handle
        v-for="(port, index) in inputPorts"
        :key="`input-${port.id}-${index}`"
        :id="port.id"
        :handle-id="port.id"
        type="target"
        :position="Position.Left"
        :class="['port', 'input-port', `port-${port.type}`, `port-${port.category}`]"
        :style="{ top: `${getInputPortPosition(index)}px` }"
      >
        <div class="port-label">{{ port.name }}</div>
      </Handle>
    </div>

    <!-- Output Ports (右侧)
         端口直接放在各自输出字段区域，避免 top 计算误差 -->

    <!-- Node Header -->
    <div class="node-header">
      <div class="node-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM10 19H8V16H10V19ZM10 15H8V12H10V15ZM10 11H8V8H10V11ZM16 19H12V16H16V19ZM16 15H12V12H16V15Z"/>
        </svg>
      </div>
      <div class="node-info">
        <div class="node-title">{{ props.data.operator.name }}</div>
        <div class="node-type">科学文档解析</div>
      </div>
      <div class="node-actions">
        <button class="delete-button" @click="handleDelete" title="删除节点">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Three-Column Layout -->
    <div class="node-body">
      <!-- First Column: Input & Output Configuration -->
      <div class="column-first">
        <div class="column-header">
          <div class="column-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"/>
            </svg>
          </div>
          <span>输入输出</span>
        </div>

        <div class="input-section">
          <div class="config-item">
            <label class="config-label">数据集id</label>
            <el-input
              v-model="localRunConfig.input_paths"
              type="textarea"
              :rows="3"
              placeholder="请填写数据集id"
              class="config-textarea"
              @input="updateRunConfig"
            />
          </div>
        </div>
      </div>

      <!-- Second Column: Extraction Options -->
      <div class="column-second">
        <div class="column-header">
          <div class="column-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"/>
            </svg>
          </div>
          <span>提取选项</span>
        </div>

        <div class="extraction-section">
          <div
            v-for="field in extractionFields"
            :key="field.key"
            class="config-item switch-item"
          >
            <label class="config-label">{{ field.label }}</label>
            <div class="switch-container">
              <el-switch
                v-model="localRunConfig[field.key]"
                @change="updateRunConfig"
                active-color="#007AFF"
                inactive-color="#E5E5EA"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Third Column: Advanced Settings -->
      <div class="column-third">
        <div class="column-header">
          <div class="column-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z"/>
            </svg>
          </div>
          <span>高级设置</span>
        </div>

        <div class="advanced-section">
          <!-- Ordering Method -->
          <div class="config-item">
            <label class="config-label">排序方法(ordering_method)</label>
            <input
              v-model="localRunConfig.ordering_method"
              placeholder="请输入排序方法"
              class="config-input"
              @input="updateRunConfig"
            />
          </div>

          <!-- Admin Debug -->
          <div class="config-item switch-item">
            <label class="config-label">调试模式(admin_debug)</label>
            <div class="switch-container">
              <el-switch
                v-model="localRunConfig.admin_debug"
                @change="updateRunConfig"
                active-color="#007AFF"
                inactive-color="#E5E5EA"
              />
            </div>
          </div>

          <!-- Table CLS -->
          <div class="config-item switch-item">
            <label class="config-label">表格分类(table_cls)</label>
            <div class="switch-container">
              <el-switch
                v-model="localRunConfig.table_cls"
                @change="updateRunConfig"
                active-color="#007AFF"
                inactive-color="#E5E5EA"
              />
            </div>
          </div>

          <!-- Output Key -->
            <div class="config-item output-key-item output-field-with-handle">
              <label class="config-label">输出字段(output_key)</label>
              <input
                v-model="localRunConfig.output_key"
                placeholder="请填写输出字段名"
                class="config-input"
                @input="updateRunConfig"
              />
              <Handle
                id="output_key"
                handle-id="output_key"
                type="source"
                :position="Position.Right"
                :class="['port', 'output-port', 'port-run', 'port-data', 'field-handle']"
              >
                <div class="port-label">output_key</div>
              </Handle>
            </div>
            <div class="config-item output-key-item output-field-with-handle">
              <label class="config-label">输出文件路径字段(output_filepath_key)</label>
              <input
                v-model="localRunConfig.output_filepath_key"
                placeholder="请填写输出字段名"
                class="config-input"
                @input="updateRunConfig"
              />
              <Handle
                id="output_filepath_key"
                handle-id="output_filepath_key"
                type="source"
                :position="Position.Right"
                :class="['port', 'output-port', 'port-run', 'port-data', 'field-handle']"
              >
                <div class="port-label">output_filepath_key</div>
              </Handle>
            </div>
        </div>
      </div>
    </div>

    <!-- Resize Handle -->
    <div class="resize-handle" @mousedown="startResize">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM18 18H16V16H18V18ZM14 22H12V20H14V22ZM22 14H20V12H22V14Z"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject, nextTick } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { useAgentStore } from '@/store/modules/agent'

let agentStore = null
function getAgentStore() {
  if (!agentStore) {
    agentStore = useAgentStore()
  }
  return agentStore
}
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

// Vue Flow instance
const { updateNodeInternals } = useVueFlow()

// Inject parent functions
const onNodeUpdate = inject('onNodeUpdate')
const onNodeDelete = inject('onNodeDelete')

// Emits
const emit = defineEmits(['update-node'])

// Local state
const localRunConfig = ref({})

// Extraction fields configuration
const extractionFields = computed(() => [
  { key: 'textual', label: '提取文本(textual)' },
  { key: 'table', label: '提取表格(table)' },
  { key: 'molecule', label: '提取分子(molecule)' },
  { key: 'chart', label: '提取图表(chart)' },
  { key: 'figure', label: '提取图形(figure)' },
  { key: 'expression', label: '提取表达式(expression)' },
  { key: 'equation', label: '提取方程式(equation)' },
  { key: 'rename_fields', label: '映射Miner(rename_fields)' },
])

// Split level options
// const splitLevelOptions = [
//   { value: 'paragraph', label: '段落模式 (paragraph)' },
//   { value: 'section', label: '分块模式 (section)' },
//   { value: 'fulltext', label: '全文模式 (fulltext)' }
// ]

// 输入端口（左侧）- 只有 input_paths 可以接收连线
const inputPorts = computed(() => {
  return [{
    id: 'input_paths',
    name: 'input_paths',
    type: 'data',
    category: 'run'
  }]
})

// 输出端口：直接放在输出字段区域（template 内各自一个 Handle）

// 计算输入端口位置 - input_paths 在第一列第一个字段
const getInputPortPosition = (_index) => {
  const headerHeight = 60 // node-header 高度
  const columnHeaderHeight = 40 // column-header 高度
  const itemHeight = 100 // 每个配置项的高度（包括 textarea）

  // input_paths 是第一个字段
  return headerHeight + columnHeaderHeight + itemHeight * 0 + itemHeight / 2
}

watch(() => getAgentStore().agentDatasetVal, (newInputPaths) => {
  localRunConfig.value.input_paths = newInputPaths
  console.log(newInputPaths)
})
// Methods
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

const startResize = (event) => {
  event.preventDefault()
}

const handleDelete = () => {
  if (onNodeDelete) {
    onNodeDelete(props.id)
  }
}

const initializeConfig = () => {
  const operator = props.data.operator
  const defaultRunConfig = operator.config?.run || {}

  localRunConfig.value = {
    ...defaultRunConfig,
    ...(props.data.runConfig || {})
  }
}

// Lifecycle
onMounted(() => {
  initializeConfig()
  // 通知 Vue Flow 更新端口位置
  nextTick(() => {
    if (updateNodeInternals) {
      updateNodeInternals(props.id)
    }
  })
})

watch(() => props.data, (_newData) => {
  initializeConfig()
  // 配置变化时更新端口位置
  nextTick(() => {
    if (updateNodeInternals) {
      updateNodeInternals(props.id)
    }
  })
}, { deep: true, immediate: true })

watch(() => props.data?.runConfig, (newRunConfig) => {
  if (newRunConfig) {
    Object.keys(newRunConfig).forEach(key => {
      if (Object.prototype.hasOwnProperty.call(localRunConfig.value, key)) {
        localRunConfig.value[key] = newRunConfig[key]
      }
    })
  }
}, { deep: true })
</script>

<style scoped>
.uniparser-node {
  background: white;
  border: 2px solid #E5E5EA;
  border-radius: 16px;
  min-width: 860px;
  min-height: 320px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}

.uniparser-node:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.uniparser-node.selected {
  border-color: #007AFF;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.2), 0 8px 32px rgba(0, 122, 255, 0.15);
}

/* Node Header */
.node-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #34C759 0%, #30D158 100%);
  color: white;
  border-radius: 14px 14px 0 0;
  position: relative;
}

.node-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
}

.node-info {
  flex: 1;
}

.node-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  line-height: 1.2;
  margin-bottom: 2px;
}

.node-type {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.node-actions {
  margin-left: 8px;
}

.delete-button {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.delete-button:hover {
  background: rgba(255, 59, 48, 0.8);
  transform: scale(1.1);
}

/* Three-Column Layout */
.node-body {
  display: flex;
  min-height: 280px;
}

.column-first,
.column-second,
.column-third {
  flex: 1;
  padding: 20px;
  position: relative;
}

.column-first {
  border-right: 1px solid #E5E5EA;
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%);
}

.column-second {
  border-right: 1px solid #E5E5EA;
  background: linear-gradient(135deg, #FAFBFC 0%, #F8F9FA 100%);
}

.column-third {
  background: linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%);
}

.column-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #1C1C1E;
  padding-top: 2px;
}

.column-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  color: #34C759;
}

/* Sections */
.input-section,
.extraction-section,
.advanced-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Config Items */
.config-item {
  margin-bottom: 16px;
  min-height: 44px;
  padding-top: 2px;
}

.config-item.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
}

.config-item.output-key-item {
  margin-top: 8px;
  position: relative;
}

.output-field-with-handle {
  position: relative;
}

/* 让端口圆点固定在字段区域右侧中间（复用原 port 样式） */
.output-field-with-handle :deep(.field-handle) {
  position: absolute;
  right: -28px; /* 与原 output-ports 容器一致 */
  top: 50%;
}

.config-label {
  font-size: 13px;
  font-weight: 600;
  color: #1C1C1E;
  margin-bottom: 8px;
  display: block;
  letter-spacing: -0.08px;
}

.switch-item .config-label {
  margin-bottom: 0;
  flex: 1;
}

.config-input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #D1D1D6;
  border-radius: 12px;
  font-size: 16px;
  background: #FAFAFA;
  transition: all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-weight: 400;
  letter-spacing: -0.24px;
}

.config-input:focus {
  outline: none;
  border-color: #007AFF;
  background: #FFFFFF;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15);
  transform: translateY(-1px);
}

.config-select {
  width: 100%;
}

.switch-container {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 4px 0;
}

/* Element Plus select styles */
.config-select :deep(.el-input__wrapper) {
  border: 1.5px solid #D1D1D6;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 16px;
  background: #FAFAFA;
  transition: all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-weight: 400;
  letter-spacing: -0.24px;
}

.config-select :deep(.el-input__wrapper:hover) {
  border-color: #C7C7CC;
}

.config-select :deep(.el-input__wrapper.is-focus) {
  border-color: #007AFF;
  background: #FFFFFF;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15);
  transform: translateY(-1px);
}

/* Textarea styles */
.config-textarea :deep(.el-textarea__inner) {
  border: 1.5px solid #D1D1D6;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  background: #FAFAFA;
  transition: all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-weight: 400;
  letter-spacing: -0.24px;
  resize: vertical;
}

.config-textarea :deep(.el-textarea__inner:hover) {
  border-color: #C7C7CC;
}

.config-textarea :deep(.el-textarea__inner:focus) {
  outline: none;
  border-color: #007AFF;
  background: #FFFFFF;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15);
  transform: translateY(-1px);
}

/* Resize Handle */
.resize-handle {
  position: absolute;
  bottom: 6px;
  right: 6px;
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
  background: rgba(0, 0, 0, 0.05);
  color: #8E8E93;
}

/* Dropdown styles */
:global(.uniparser-select-dropdown) {
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
  border: 1px solid #E5E5EA !important;
  overflow: hidden !important;
}

:global(.uniparser-select-dropdown .el-select-dropdown__item) {
  font-size: 13px !important;
  padding: 10px 16px !important;
  line-height: 1.4 !important;
  transition: all 0.2s ease !important;
}

:global(.uniparser-select-dropdown .el-select-dropdown__item:hover) {
  background-color: #F2F2F7 !important;
}

:global(.uniparser-select-dropdown .el-select-dropdown__item.selected) {
  background-color: #007AFF !important;
  color: white !important;
  font-weight: 500 !important;
}

/* Ports */
.input-ports,
.output-ports {
  position: absolute;
  top: 0;
  height: 100%;
  pointer-events: none;
  z-index: 10;
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
}

/* 输入端口（左侧）- 蓝色系 */
.input-port.port-run {
  background: #007AFF;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.4);
}

.input-port.port-run:hover {
  background: #0056b3;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.5), 0 2px 8px rgba(0, 122, 255, 0.3);
  transform: translateY(-50%) scale(1.3);
}

/* 输出端口（右侧）- 橙色系 */
.output-port.port-run {
  background: linear-gradient(135deg, #FF6B35, #FF8E53);
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(255, 107, 53, 0.4);
}

.output-port.port-run:hover {
  background: linear-gradient(135deg, #E55A2B, #FF7A40);
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.5), 0 2px 8px rgba(255, 107, 53, 0.3);
  transform: translateY(-50%) scale(1.3);
}

/* 为两侧端口添加发光效果 */
.port::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
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
  z-index: 100;
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

/* Vue Flow Handle Overrides */
:deep(.vue-flow__handle) {
  width: 16px !important;
  height: 16px !important;
  border: 2px solid white !important;
  border-radius: 50% !important;
  cursor: crosshair !important;
  transition: all 0.2s ease !important;
}

/* 默认输入端口样式 - 蓝色系 */
:deep(.vue-flow__handle[type="target"]) {
  background: #007AFF !important;
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.4) !important;
}

/* 默认输出端口样式 - 橙色渐变 */
:deep(.vue-flow__handle[type="source"]) {
  background: linear-gradient(135deg, #FF6B35, #FF8E53) !important;
  border: 2px solid white !important;
  box-shadow: 0 2px 6px rgba(255, 107, 53, 0.4) !important;
}

:deep(.vue-flow__handle[type="target"]:hover) {
  background: #0056b3 !important;
  transform: scale(1.3) !important;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.5), 0 2px 8px rgba(0, 122, 255, 0.3) !important;
}

:deep(.vue-flow__handle[type="source"]:hover) {
  background: linear-gradient(135deg, #E55A2B, #FF7A40) !important;
  transform: scale(1.3) !important;
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.5), 0 2px 8px rgba(255, 107, 53, 0.3) !important;
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
