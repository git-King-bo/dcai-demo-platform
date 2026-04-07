<template>
  <div :class="['mineru-node', { selected: props.selected }]">
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
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
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

    <!-- Input Ports -->
    <div v-if="inputPorts.length > 0" class="input-ports" :key="`input-${inputPorts.length}`">
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

    <!-- Node Body (Config Area) -->
    <div class="node-body">
      <!-- MinerU 专用配置 -->
      <div class="mineru-section">
        <div class="section-title">MinerU 配置</div>
        
        <!-- Input Paths -->
        <div class="config-item">
          <label class="config-label">dataset_id</label>
          <input
            v-model="localRunConfig.input_paths"
            type="text"
            placeholder="请输入数据集id"
            class="config-input"
            @input="updateRunConfig"
          />
        </div>
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
        <div class="config-item">
          <label class="config-label">input_paths_extra</label>
          <input
            v-model="localRunConfig.input_paths_extra"
            type="text"
            placeholder=""
            class="config-input"
            @input="updateRunConfig"
          />
        </div>
        <!-- Split Level -->
        <div class="config-item">
          <label class="config-label">切片模式</label>
          <el-select
            v-model="localRunConfig.split_level"
            class="config-select"
            @change="updateRunConfig"
            placeholder="选择切片模式"
            popper-class="mineru-node-select-dropdown"
          >
            <el-option value="fulltext" label="按全文切分" />
            <el-option value="paragraph" label="按段落切分" />
            <el-option value="section" label="按chunk切分" />
          </el-select>
        </div>

        <!-- Section 模式专用配置 -->
        <div v-if="localRunConfig.split_level === 'section'" class="section-config">
          <div class="config-item">
            <label class="config-label">分块大小（>=2000）</label>
            <input
              v-model="localRunConfig.chunk_size"
              type="number"
              placeholder="分块大小"
              class="config-input"
              @input="updateRunConfig"
            />
          </div>

          <div class="config-item">
            <label class="config-label">重叠字符数</label>
            <input
              v-model="localRunConfig.overlap"
              type="number"
              placeholder="重叠字符数"
              class="config-input"
              @input="updateRunConfig"
            />
          </div>
        </div>


      </div>
    </div>

    <!-- Output Ports -->
    <div v-if="outputPorts.length > 0" class="output-ports">
      <Handle
        v-for="(port, index) in outputPorts"
        :key="port.id"
        :id="port.id"
        :handle-id="port.id"
        type="source"
        :position="Position.Right"
        :class="['port', 'output-port', `port-${port.type}`, `port-${port.category}`]"
        :style="{ top: `${getOutputPortPosition(index)}px` }"
      >
        <div class="port-label">{{ port.name }}</div>
      </Handle>
    </div>
    <!-- Input Ports Extra -->
    <div v-if="inputPortExtrs.length > 0" class="input-ports-extra" :key="`input-${inputPortExtrs.length}`">
      <Handle
        v-for="(port, index) in inputPortExtrs"
        :key="`input-${port.id}-${index}`"
        :id="port.id"
        :handle-id="port.id"
        type="target"
        :position="Position.Left"
        :class="['port', 'input-port', `port-${port.type}`, `port-${port.category}`]"
        :style="{ top: `${getInputPortExtraPosition(index)}px` }"
      >
        <div class="port-label">{{ port.name }}</div>
      </Handle>
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
import { Handle, Position } from '@vue-flow/core'
import { ElSelect, ElOption } from 'element-plus'

// Props - Vue Flow会传递所有节点数据作为props
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

// Local state - MinerU 专用配置
const localRunConfig = ref({
  input_paths: null,
  input_paths_extra: null,
  output_key: 'raw_content',
  split_level: 'fulltext',
  chunk_size: 2000,
  overlap: 200
})

// 计算端口配置
const inputPorts = computed(() => {
  return [
    {
      id: 'input_paths',
      name: '输入路径',
      type: 'data',
      category: 'run'
    }
  ]
})
const inputPortExtrs = computed(()=>{
    return [
    {
      id: 'input_paths_extra',
      name: '输入文件路径',
      type: 'data',
      category: 'run'
    }
  ]
})

const outputPorts = computed(() => {
  return [
    {
      id: 'output_key',
      name: '输出内容',
      type: 'data',
      category: 'run'
    }
  ]
})

// Methods
const getInputPortPosition = (index) => {
  const headerHeight = 56
  const sectionTitleHeight = 28
  const fieldHeight = 60
  
  return headerHeight + sectionTitleHeight + (fieldHeight / 2)
}

const getInputPortExtraPosition = (index) => {
  const headerHeight = 56
  const sectionTitleHeight = 28
  const fieldHeight = 60
  
  return headerHeight * 3 + sectionTitleHeight + (fieldHeight)
}



const getOutputPortPosition = (index) => {
  const headerHeight = 56
  const sectionTitleHeight = 28
  const configItemHeight = 48 // 包括label和input的高度
  const configItems = 3 // dataset_id, 切片模式, output_key 字段
  
  // 计算到 Output Key 字段的位置 (最后一个字段)
  return headerHeight + sectionTitleHeight + (configItems * configItemHeight) - (configItemHeight / 2)
}

// 应用类型转换规则
const applyTypeConversionRules = (config) => {
  const convertedConfig = {}
  
  Object.keys(config).forEach(key => {
    let value = config[key]
    
    // 数值类型转换
    if ((key === 'chunk_size' || key === 'overlap') && value !== null && value !== undefined && value !== '') {
      const numValue = parseInt(value, 10)
      if (!isNaN(numValue)) {
        value = numValue
      }
    }
    
    convertedConfig[key] = value
  })
  
  return convertedConfig
}

const updateRunConfig = () => {
  console.log('MinerU updateRunConfig called with localRunConfig:', localRunConfig.value)
  
  // 应用类型转换规则
  const convertedConfig = applyTypeConversionRules(localRunConfig.value)
  
  if (onNodeUpdate) {
    onNodeUpdate(props.id, {
      runConfig: { ...convertedConfig }
    })
  } else {
    console.warn('onNodeUpdate function not available, using emit fallback')
    emit('update-node', props.id, {
      runConfig: { ...convertedConfig }
    })
  }
}

const startResize = (event) => {
  event.preventDefault()
  console.log('Start resize')
}

// 删除节点处理函数
const handleDelete = () => {
  if (onNodeDelete) {
    onNodeDelete(props.id)
  }
}

// Initialize local config
const initializeConfig = () => {
  const operator = props.data.operator
  const defaultRunConfig = operator.config?.run || {}
  
  // 初始化配置，使用默认值
  localRunConfig.value = { 
    input_paths: null,
    input_paths_extra: null,
    output_key: 'raw_content',
    split_level: 'fulltext',
    chunk_size: 2000,
    overlap: 200,
    ...defaultRunConfig, 
    ...(props.data.runConfig || {})
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

// 监听 runConfig 的变化并更新本地配置
watch(() => props.data?.runConfig, (newRunConfig, oldRunConfig) => {
  if (newRunConfig && oldRunConfig) {
    Object.keys(newRunConfig).forEach(key => {
      if (newRunConfig[key] !== oldRunConfig[key]) {
        if (localRunConfig.value.hasOwnProperty(key)) {
          localRunConfig.value[key] = newRunConfig[key]
        }
      }
    })
  } else if (newRunConfig) {
    Object.keys(newRunConfig).forEach(key => {
      if (localRunConfig.value.hasOwnProperty(key)) {
        localRunConfig.value[key] = newRunConfig[key]
      }
    })
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
.mineru-node {
  background: white;
  border: 2px solid #E5E5EA;
  border-radius: 12px;
  min-width: 280px;
  min-height: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

.mineru-node:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.mineru-node.selected {
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
}

/* Node Header */
.node-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #F0F8FF 0%, #E6F3FF 100%);
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
  color: #4A90E2;
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
  color: #4A90E2;
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
  font-weight: 600;
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

.mineru-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #4A90E2;
  margin-bottom: 12px;
  padding-bottom: 4px;
  border-bottom: 1px solid #E5E5EA;
}

.section-config {
  margin-top: 12px;
  padding: 12px;
  background: #F8FBFF;
  border-radius: 8px;
  border: 1px solid #E0F0FF;
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

.config-select {
  width: 100%;
}

.config-input:focus {
  outline: none;
  border-color: #4A90E2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

/* Element Plus select 样式覆盖 */
.config-select :deep(.el-input__wrapper) {
  border: 1px solid #E5E5EA;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  background: white;
  transition: all 0.2s ease;
}

.config-select :deep(.el-input__wrapper:hover) {
  border-color: #C7C7CC;
}

.config-select :deep(.el-input__wrapper.is-focus) {
  border-color: #4A90E2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.config-select :deep(.el-input__inner) {
  font-family: inherit;
  font-size: 14px;
}

/* 控制下拉面板样式 */
:global(.mineru-node-select-dropdown) {
  min-width: 120px !important;
  max-width: 220px !important;
  width: fit-content !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

:global(.mineru-node-select-dropdown .el-select-dropdown__item) {
  font-size: 13px !important;
  padding: 8px 12px !important;
  line-height: 1.3 !important;
  min-height: auto !important;
}

:global(.mineru-node-select-dropdown .el-select-dropdown__item:hover) {
  background-color: #F0F8FF !important;
}

:global(.mineru-node-select-dropdown .el-select-dropdown__item.selected) {
  background-color: #4A90E2 !important;
  color: white !important;
}

/* Ports */
.input-ports,
.output-ports,
.input-ports-extra {
  position: absolute;
  top: 0;
  height: 100%;
  pointer-events: none;
}
.input-ports-extra{
  left: -8px;
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
  background: #4A90E2;
  cursor: crosshair;
  pointer-events: all;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
  box-shadow: 0 2px 4px rgba(74, 144, 226, 0.3);
}

.port:hover {
  background: #357ABD;
  transform: translateY(-50%) scale(1.2);
  box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.4);
}

.input-port.port-run {
  background: #4A90E2;
  border-color: #4A90E2;
  box-shadow: 0 2px 6px rgba(74, 144, 226, 0.4);
}

.input-port.port-run:hover {
  background: #357ABD;
  box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.5), 0 2px 8px rgba(74, 144, 226, 0.3);
  transform: translateY(-50%) scale(1.3);
}

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

/* 节点级连接端点样式 */
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
  background: #4A90E2 !important;
  box-shadow: 0 2px 4px rgba(74, 144, 226, 0.3) !important;
}

:deep(.vue-flow__handle[type="source"]) {
  background: linear-gradient(135deg, #FFB366, #FF9500) !important;
  border: 2px solid #FF9500 !important;
  box-shadow: 0 3px 8px rgba(255, 149, 0, 0.4) !important;
}

:deep(.vue-flow__handle[type="target"]:hover) {
  background: #357ABD !important;
  transform: scale(1.2) !important;
  box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.4), 0 2px 6px rgba(74, 144, 226, 0.3) !important;
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