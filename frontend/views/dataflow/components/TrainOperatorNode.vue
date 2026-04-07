<template>
  <div :class="['train-operator-node', { selected: props.selected }]">
    <!-- Node Header -->
    <div class="node-header">
      <!-- 节点级输入端点 - 左侧 -->
      <Handle
        :id="`${props.id}-node-input`"
        :handle-id="`${props.id}-node-input`"
        type="target"
        :position="Position.Left"
        class="port node-port node-input-port"
        :style="{ top: '24px', left: '-8px' }"
      />
      
      <div class="node-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 10.1 9.9 11 11 11V22H13V11C14.1 11 15 10.1 15 9H21ZM7 12V10L3 14L7 18V16H17V14H7Z"/>
        </svg>
      </div>
      <div class="node-info">
        <div class="node-title">{{ props.data.operator.name }}</div>
        <div class="node-type">模型微调</div>
      </div>
      <div class="node-actions">
        <button class="delete-button" @click="handleDelete" title="删除节点">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Four-Column Layout -->
    <div class="node-body">
      <!-- First Column: Dataset Inputs -->
      <div class="column-first">
        <div class="column-header">
          <div class="column-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"/>
            </svg>
          </div>
          <span>数据集输入</span>
        </div>
        
        <div class="dataset-fields">
          <div
            v-for="field in datasetFields"
            :key="field.key"
            class="config-item"
          >
            <label class="config-label">{{ field.label }}</label>
            <input
              v-if="field.type === 'text'"
              v-model="localRunConfig[field.key]"
              :placeholder="field.placeholder"
              class="config-input"
              @input="updateRunConfig"
            />
          </div>
        </div>

        <!-- Dataset Input Ports -->
        <div class="input-ports">
          <Handle
            v-for="(port, index) in datasetInputPorts"
            :key="`input-${port.id}-${index}`"
            :id="port.id"
            :handle-id="port.id"
            type="target"
            :position="Position.Left"
            :class="['port', 'input-port', 'port-dataset']"
            :style="logPortRender(port, index, getDatasetPortPosition(index))"
          >
            <div class="port-label">{{ port.name }}</div>
          </Handle>
        </div>
      </div>

      <!-- Second Column: Model Configuration -->
      <div class="column-second">
        <div class="column-header">
          <div class="column-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2ZM12 4.14L20 8.22V10C20 15.55 16.8 19.37 12 20.91C7.2 19.37 4 15.55 4 10V8.22L12 4.14Z"/>
            </svg>
          </div>
          <span>模型选择</span>
        </div>

        <!-- Model Selection -->
        <div class="model-section">
          <div
            v-for="field in modelFields"
            :key="field.key"
            class="config-item"
          >
            <label class="config-label">{{ field.label }}</label>
            <el-select
              v-if="field.type === 'select'"
              v-model="localRunConfig[field.key]"
              class="config-select"
              @change="updateRunConfig"
              placeholder="请选择..."
              popper-class="train-node-select-dropdown"
            >
              <el-option
                v-for="option in getSelectOptions(field.key, field.value)"
                :key="option.value"
                :value="option.value"
                :label="option.label"
              />
            </el-select>
          </div>
        </div>

        <!-- LoRA Parameters -->
        <div class="lora-section">
          <div class="subsection-title">LoRA 参数</div>
          <div
            v-for="field in loraFields"
            :key="field.key"
            class="config-item"
          >
            <label class="config-label">{{ field.label }}</label>
            <input
              v-if="field.type === 'number'"
              v-model="localRunConfig[field.key]"
              type="number"
              :placeholder="field.placeholder"
              class="config-input"
              @input="updateRunConfig"
            />
          </div>
        </div>

        <!-- Data Parameters -->
        <div class="data-section">
          <div class="subsection-title">数据参数</div>
          <div
            v-for="field in dataFields"
            :key="field.key"
            class="config-item"
          >
            <label class="config-label">{{ field.label }}</label>
            <input
              v-if="field.type === 'number'"
              v-model="localRunConfig[field.key]"
              type="number"
              :placeholder="field.placeholder"
              class="config-input"
              @input="updateRunConfig"
            />
          </div>
        </div>
      </div>

      <!-- Third Column: Training Parameters -->
      <div class="column-third">
        <div class="column-header">
          <div class="column-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"/>
            </svg>
          </div>
          <span>训练参数</span>
        </div>

        <!-- Batch & Steps Parameters -->
        <div class="batch-section">
          <div class="subsection-title">批次 & 步数</div>
          <div
            v-for="field in batchFields"
            :key="field.key"
            class="config-item"
          >
            <label class="config-label">{{ field.label }}</label>
            <input
              v-if="field.type === 'number'"
              v-model="localRunConfig[field.key]"
              type="number"
              :placeholder="field.placeholder"
              class="config-input"
              @input="updateRunConfig"
            />
          </div>
        </div>

        <!-- Learning Parameters -->
        <div class="learning-section">
          <div class="subsection-title">学习参数</div>
          <div
            v-for="field in learningFields"
            :key="field.key"
            class="config-item"
          >
            <label class="config-label">{{ field.label }}</label>
            <input
              v-if="field.type === 'number'"
              v-model="localRunConfig[field.key]"
              type="number"
              :step="field.key === 'learning_rate' ? '0.0001' : '1'"
              :placeholder="field.placeholder"
              class="config-input"
              @input="updateRunConfig"
            />
            <el-select
              v-else-if="field.type === 'select'"
              v-model="localRunConfig[field.key]"
              class="config-select"
              @change="updateRunConfig"
              placeholder="请选择..."
              popper-class="train-node-select-dropdown"
            >
              <el-option
                v-for="option in getSelectOptions(field.key, field.value)"
                :key="option.value"
                :value="option.value"
                :label="option.label"
              />
            </el-select>
          </div>
        </div>
      </div>

      <!-- Fourth Column: Advanced Options -->
      <div class="column-fourth">
        <div class="column-header">
          <div class="column-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z"/>
            </svg>
          </div>
          <span>高级选项</span>
        </div>

        <!-- Advanced Options -->
        <div class="advanced-section">
          <div
            v-for="field in advancedFields"
            :key="field.key"
            class="config-item"
          >
            <label class="config-label">{{ field.label }}</label>
            <div
              v-if="field.type === 'boolean'"
              class="switch-container"
            >
              <el-switch
                v-model="localRunConfig[field.key]"
                @change="updateRunConfig"
                active-color="#007AFF"
                inactive-color="#E5E5EA"
              />
            </div>
            <input
              v-else-if="field.type === 'number'"
              v-model="localRunConfig[field.key]"
              type="number"
              :placeholder="field.placeholder"
              class="config-input"
              @input="updateRunConfig"
            />
            <input
              v-else-if="field.type === 'text'"
              v-model="localRunConfig[field.key]"
              :placeholder="field.placeholder"
              class="config-input"
              @input="updateRunConfig"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Bar (Training Status) -->
    <div v-if="nodeStatus === 'running'" class="training-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${trainingProgress}%` }"></div>
      </div>
      <div class="progress-text">训练中... {{ trainingProgress }}%</div>
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
import { ElSelect, ElOption, ElSwitch } from 'element-plus'

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
const localRunConfig = ref({})
const localInitConfig = ref({})
const nodeStatus = ref('idle') // idle, running, success, error
const trainingProgress = ref(0)

// Dataset fields (左列) - 只包含指定的5个字段
const datasetFields = computed(() => {
  const datasetKeys = ['instruction', 'input_sft', 'output', 'system', 'history']
  return datasetKeys.map(key => ({
    key,
    label: formatLabel(key),
    type: 'text',
    placeholder: `请输入${formatLabel(key)}`,
    category: 'dataset'
  }))
})

// Model fields (右列上部)
const modelFields = computed(() => {
  const modelKeys = ['model_name', 'finetuning_type_list']
  const operator = props.data.operator
  const configRun = operator.config?.run || {}
  
  return modelKeys.filter(key => configRun[key]).map(key => ({
    key,
    label: formatLabel(key),
    type: 'select',
    value: configRun[key],
    category: 'model'
  }))
})

// LoRA parameter fields (中列)
const loraFields = computed(() => {
  const loraKeys = ['lora_rank', 'lora_alpha']
  const operator = props.data.operator
  const configRun = operator.config?.run || {}
  
  return loraKeys.filter(key => configRun.hasOwnProperty(key)).map(key => ({
    key,
    label: formatLabel(key),
    type: inferFieldType(configRun[key]),
    placeholder: `请输入${formatLabel(key)}`,
    value: configRun[key],
    category: 'lora'
  }))
})

// Data parameter fields (中列)
const dataFields = computed(() => {
  const dataKeys = ['cutoff_len', 'max_samples']
  const operator = props.data.operator
  const configRun = operator.config?.run || {}
  
  return dataKeys.filter(key => configRun.hasOwnProperty(key)).map(key => ({
    key,
    label: formatLabel(key),
    type: inferFieldType(configRun[key]),
    placeholder: `请输入${formatLabel(key)}`,
    value: configRun[key],
    category: 'data'
  }))
})

// Batch parameter fields (右列)
const batchFields = computed(() => {
  const batchKeys = ['per_device_train_batch_size', 'gradient_accumulation_steps']
  const operator = props.data.operator
  const configRun = operator.config?.run || {}
  
  return batchKeys.filter(key => configRun.hasOwnProperty(key)).map(key => ({
    key,
    label: formatLabel(key),
    type: inferFieldType(configRun[key]),
    placeholder: `请输入${formatLabel(key)}`,
    value: configRun[key],
    category: 'batch'
  }))
})

// Learning parameter fields (右列)
const learningFields = computed(() => {
  const learningKeys = ['learning_rate', 'num_train_epochs', 'max_grad_norm', 'lr_scheduler_type_list', 'warmup_ratio']
  const operator = props.data.operator
  const configRun = operator.config?.run || {}
  
  return learningKeys.filter(key => configRun.hasOwnProperty(key)).map(key => ({
    key,
    label: formatLabel(key),
    type: inferFieldType(configRun[key]),
    placeholder: `请输入${formatLabel(key)}`,
    value: configRun[key],
    category: 'learning'
  }))
})

// Advanced parameter fields (右列)
const advancedFields = computed(() => {
  const advancedKeys = ['bf16', 'resume_training', 'save_steps', 'extra_params']
  const operator = props.data.operator
  const configRun = operator.config?.run || {}
  
  return advancedKeys.filter(key => configRun.hasOwnProperty(key)).map(key => ({
    key,
    label: formatLabel(key),
    type: inferFieldType(configRun[key]),
    placeholder: `请输入${formatLabel(key)}`,
    value: configRun[key],
    category: 'advanced'
  }))
})

// Input ports for dataset (左列) - 只为数据集字段创建端点
const datasetInputPorts = computed(() => {
  const ports = datasetFields.value.map((field, index) => {
    const port = {
      id: field.key,
      name: field.label,
      type: 'data',
      category: 'dataset'
    }
    return port
  })
  return ports
})

// Port position calculations
const getDatasetPortPosition = (index) => {
  const headerHeight = 60 // node-header 高度调整
  const columnHeaderHeight = 36 // column-header 高度调整
  const fieldHeight = 92 // 字段高度调整
  const fieldVerticalCenter = 28 // 字段内容区域的中点
  const topOffset = -24 // 整体向上偏移量
  
  const basePosition = headerHeight + columnHeaderHeight + (index * fieldHeight) + fieldVerticalCenter
  const finalPosition = basePosition + topOffset

  return finalPosition
}

const logPortRender = (port, index, position) => {
  return { top: `${position}px` }
}

// Methods
const formatLabel = (key) => {
  const keyMap = {
    'instruction': '指令模板(instruction)',
    'input_sft': '输入字段(input_sft)',
    'output': '输出字段(output)',
    'system': '系统字段(system)',
    'history': '历史字段(history)',
    'model_name': '模型名(model_name)',
    'finetuning_type_list': '微调类型(finetuning_type_list)',
    'lora_rank': 'LoRA秩(lora_rank)',
    'lora_alpha': 'LoRA Alpha(lora_alpha)',
    'cutoff_len': '序列长度(cutoff_len)',
    'max_samples': '最大样本数(max_samples)',
    'per_device_train_batch_size': '批次大小(per_device_train_batch_size)',
    'gradient_accumulation_steps': '梯度累积步数(gradient_accumulation_steps)',
    'learning_rate': '学习率(learning_rate)',
    'num_train_epochs': '训练轮数(num_train_epochs)',
    'max_grad_norm': '梯度裁剪最大阈值(max_grad_norm)',
    'lr_scheduler_type_list': '学习率调度(lr_scheduler_type_list)',
    'warmup_ratio': '预热比例(warmup_ratio)',
    'bf16': 'BF16精度(bf16)',
    'resume_training': '恢复训练(resume_training)',
    'save_steps': '保存步数(save_steps)',
    'extra_params': '额外参数'
  }
  
  return keyMap[key] || key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^\w/, c => c.toUpperCase())
}

const inferFieldType = (value) => {
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  if (Array.isArray(value)) return 'select'
  if (typeof value === 'string') {
    if (value.length > 50) return 'textarea'
    return 'text'
  }
  return 'text'
}

const getSelectOptions = (key, value) => {
  if (Array.isArray(value)) {
    return value.map(item => ({
      label: item,
      value: item
    }))
  }
  
  if (typeof value === 'boolean') {
    return [
      { label: '启用', value: true },
      { label: '禁用', value: false }
    ]
  }
  
  return []
}

const updateRunConfig = () => {
  const convertedConfig = applyTypeConversionRules(localRunConfig.value)
  
  if (onNodeUpdate) {
    onNodeUpdate(props.id, {
      runConfig: { ...convertedConfig }
    })
  } else {
    emit('update-node', props.id, {
      runConfig: { ...convertedConfig }
    })
  }
}

const updateInitConfig = () => {
  const convertedConfig = applyTypeConversionRules(localInitConfig.value)
  
  if (onNodeUpdate) {
    onNodeUpdate(props.id, {
      initConfig: { ...convertedConfig }
    })
  } else {
    emit('update-node', props.id, {
      initConfig: { ...convertedConfig }
    })
  }
}

const applyTypeConversionRules = (config) => {
  const convertedConfig = {}
  
  Object.keys(config).forEach(key => {
    let value = config[key]
    
    if (key.startsWith('num') && value !== null && value !== undefined && value !== '') {
      const numValue = parseInt(value, 10)
      if (!isNaN(numValue)) {
        value = numValue
      }
    }
    
    convertedConfig[key] = value
  })
  
  return convertedConfig
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
  const defaultInitConfig = operator.config?.init || {}
  
  localRunConfig.value = { 
    ...defaultRunConfig, 
    ...(props.data.runConfig || {})
  }
  
  localInitConfig.value = { 
    ...defaultInitConfig, 
    ...(props.data.initConfig || {})
  }
}

// Lifecycle
watch(datasetInputPorts, (newPorts) => {
  nextTick(() => {
    const portElements = document.querySelectorAll('.port-dataset')
  })
}, { deep: true })

onMounted(() => {
  initializeConfig()
})

watch(() => props.data, (newData) => {
  initializeConfig()
}, { deep: true, immediate: true })

watch(() => props.data?.runConfig, (newRunConfig) => {
  if (newRunConfig) {
    Object.keys(newRunConfig).forEach(key => {
      if (localRunConfig.value.hasOwnProperty(key)) {
        localRunConfig.value[key] = newRunConfig[key]
      }
    })
  }
}, { deep: true })

watch(() => props.data?._timestamp, (newTimestamp) => {
  if (newTimestamp) {
    nextTick(() => {
      initializeConfig()
    })
  }
})
</script>

<style scoped>
.train-operator-node {
  background: white;
  border: 2px solid #E5E5EA;
  border-radius: 16px;
  min-width: 960px;
  min-height: 360px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}

.train-operator-node:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.train-operator-node.selected {
  border-color: #007AFF;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.2), 0 8px 32px rgba(0, 122, 255, 0.15);
}

/* Node Header */
.node-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
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

/* Four-Column Layout */
.node-body {
  display: flex;
  min-height: 320px;
}

.column-first,
.column-second,
.column-third,
.column-fourth {
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
  border-right: 1px solid #E5E5EA;
  background: linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%);
}

.column-fourth {
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%);
}

.column-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1C1C1E;
  padding-top: 2px;
}

.column-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  color: #007AFF;
}

.subsection-title {
  font-size: 13px;
  font-weight: 600;
  color: #6D6D70;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 16px;
  padding-bottom: 6px;
  border-bottom: 1px solid #E5E5EA;
}

/* Dataset Fields */
.dataset-fields {
  space-y: 12px;
}

/* Model Section */
.model-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E5E5EA;
}

/* LoRA Section */
.lora-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E5E5EA;
}

/* Data Section */
.data-section {
  margin-bottom: 16px;
}

/* Batch Section */
.batch-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E5E5EA;
}

/* Learning Section */
.learning-section {
  margin-bottom: 16px;
}

/* Advanced Section */
.advanced-section {
  margin-bottom: 16px;
}

/* Config Items */
.config-item {
  margin-bottom: 16px;
  min-height: 44px;
  padding-top: 2px;
}

.config-label {
  font-size: 13px;
  font-weight: 600;
  color: #1C1C1E;
  margin-bottom: 8px;
  display: block;
  letter-spacing: -0.08px;
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
  height: 40px;
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

/* Training Progress */
.training-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 20px;
  background: rgba(0, 122, 255, 0.05);
  border-top: 1px solid #E5E5EA;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #F2F2F7;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007AFF, #5AC8FA);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 11px;
  color: #007AFF;
  font-weight: 500;
  text-align: center;
}

/* Ports */
.input-ports {
  position: absolute;
  top: 0;
  left: -8px;
  height: 100%;
  width: 0;
  pointer-events: none;
  z-index: 10;
}

.port {
  position: absolute;
  width: 16px !important;
  height: 16px !important;
  border-radius: 50% !important;
  border: 2px solid white !important;
  background: #007AFF !important;
  cursor: crosshair !important;
  pointer-events: all;
  transition: all 0.2s ease !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
  box-shadow: 0 2px 4px rgba(0, 122, 255, 0.3) !important;
  z-index: 10;
}

.port:hover {
  background: #0056b3;
  transform: translateY(-50%) scale(1.2);
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.4);
}

.port-dataset {
  background: #34C759;
  border-color: #34C759;
  box-shadow: 0 2px 6px rgba(52, 199, 89, 0.4);
}

.port-dataset:hover {
  background: #28a745;
  box-shadow: 0 0 0 4px rgba(52, 199, 89, 0.5), 0 2px 8px rgba(52, 199, 89, 0.3);
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

.port:hover .port-label {
  opacity: 1;
}

/* Node-level ports */
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
  box-shadow: 0 2px 8px rgba(142, 142, 147, 0.4);
}

.node-input-port:hover {
  background: linear-gradient(135deg, #6D6D70, #8E8E93);
  box-shadow: 0 0 0 4px rgba(142, 142, 147, 0.5), 0 2px 8px rgba(142, 142, 147, 0.3);
  transform: translateY(-50%) scale(1.3);
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
:global(.train-node-select-dropdown) {
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
  border: 1px solid #E5E5EA !important;
  overflow: hidden !important;
}

:global(.train-node-select-dropdown .el-select-dropdown__item) {
  font-size: 13px !important;
  padding: 10px 16px !important;
  line-height: 1.4 !important;
  transition: all 0.2s ease !important;
}

:global(.train-node-select-dropdown .el-select-dropdown__item:hover) {
  background-color: #F2F2F7 !important;
}

:global(.train-node-select-dropdown .el-select-dropdown__item.selected) {
  background-color: #007AFF !important;
  color: white !important;
  font-weight: 500 !important;
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

/* 默认输入端口样式 */
:deep(.vue-flow__handle[type="target"]) {
  background: #007AFF !important;
  box-shadow: 0 2px 4px rgba(0, 122, 255, 0.3) !important;
}

:deep(.vue-flow__handle[type="target"]:hover) {
  background: #0056b3 !important;
  transform: scale(1.2) !important;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.4), 0 2px 6px rgba(0, 122, 255, 0.3) !important;
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
