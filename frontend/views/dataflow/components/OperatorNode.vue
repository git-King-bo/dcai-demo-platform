<template>
  <div :class="['operator-node', { selected: props.selected }]">
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
          <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2ZM12 4.14L20 8.22V10C20 15.55 16.8 19.37 12 20.91C7.2 19.37 4 15.55 4 10V8.22L12 4.14Z"/>
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
      <!-- Init Parameters 在上方 -->
      <div v-if="initFields.length > 0" class="init-section">
        <div class="section-title">初始化参数</div>
        <div
          v-for="field in initFields"
          :key="field.key"
          class="config-item"
        >
          <label class="config-label">{{ field.label }}</label>
          <input
            v-if="field.type === 'text' || field.type === 'number'"
            v-model="localInitConfig[field.key]"
            :type="field.type === 'number' ? 'number' : 'text'"
            :placeholder="field.placeholder"
            class="config-input"
            @input="updateInitConfig"
          />
          <el-select
            v-else-if="field.type === 'select'"
            v-model="localInitConfig[field.key]"
            class="config-select"
            @change="updateInitConfig"
            placeholder="请选择..."
            popper-class="operator-node-select-dropdown"
          >
            <el-option
              v-for="option in getSelectOptions(field.key, field.value)"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </el-select>
          <div v-else-if="field.type === 'textarea'" class="textarea-container">
            <textarea
              v-model="localInitConfig[field.key]"
              :placeholder="field.placeholder"
              class="config-textarea"
              rows="3"
              @input="updateInitConfig"
              @click="openPromptEditor(field, 'init')"
              readonly
            ></textarea>
            <div class="textarea-overlay" @click="openPromptEditor(field, 'init')">
              <svg class="expand-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Run Parameters 在下方 -->
      <div v-if="runFields.length > 0" class="run-section">
        <div class="section-title">运行参数</div>
        <div
          v-for="field in runFields"
          :key="field.key"
          class="config-item"
        >
          <label class="config-label">{{ field.label }}</label>
          <input
            v-if="field.type === 'text' || field.type === 'number'"
            v-model="localRunConfig[field.key]"
            :type="field.type === 'number' ? 'number' : 'text'"
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
            popper-class="operator-node-select-dropdown"
          >
            <el-option
              v-for="option in getSelectOptions(field.key, field.value)"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </el-select>
          <div v-else-if="field.type === 'textarea'" class="textarea-container">
            <textarea
              v-model="localRunConfig[field.key]"
              :placeholder="field.placeholder"
              class="config-textarea"
              rows="3"
              @input="updateRunConfig"
              @click="openPromptEditor(field, 'run')"
              readonly
            ></textarea>
            <div class="textarea-overlay" @click="openPromptEditor(field, 'run')">
              <svg class="expand-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </div>
          </div>
          
          <!-- 如果该字段有对应的输出端口，在右侧渲染 -->
          <Handle
            v-if="getOutputPortForField(field.key)"
            :id="field.key"
            :handle-id="field.key"
            type="source"
            :position="Position.Right"
            :class="['port', 'output-port', 'port-data', 'port-run', 'inline-output-port']"
          >
            <div class="port-label">{{ field.label }}</div>
          </Handle>
        </div>
      </div>
      
      <div v-if="runFields.length === 0 && initFields.length === 0" class="empty-config">
        <div class="empty-message">暂无配置项</div>
      </div>
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
      :field-key="currentEditingField?.key"
      :field-label="currentEditingField?.label"
      @save="handlePromptSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject, nextTick } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import PromptEditor from './PromptEditor.vue'

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

// Local state - 严格区分 run 和 init 配置
const localRunConfig = ref({})
const localInitConfig = ref({})
const nodeStatus = ref('idle') // idle, running, success, error

// Prompt Editor state
const showPromptEditor = ref(false)
const currentEditingField = ref(null)
const currentEditingCategory = ref(null)
const currentEditingContent = ref('')

// Computed properties - 包含所有 config.run 和 config.init 字段
const runFields = computed(() => {
  const operator = props.data.operator
  const configRun = operator.config?.run || {}
  
  return Object.keys(configRun).map(key => ({
    key,
    label: formatLabel(key),
    type: inferFieldType(configRun[key], key),
    placeholder: `请输入${formatLabel(key)}`,
    value: configRun[key],
    category: 'run'
  }))
})

const initFields = computed(() => {
  const operator = props.data.operator
  const configInit = operator.config?.init || {}
  
  return Object.keys(configInit).map(key => ({
    key,
    label: formatLabel(key),
    type: inferFieldType(configInit[key], key),
    placeholder: `请输入${formatLabel(key)}`,
    value: configInit[key],
    category: 'init'
  }))
})

const allFields = computed(() => {
  // 顺序要和 UI 渲染一致：init 在上方，run 在下方
  return [...initFields.value, ...runFields.value]
})

// 每个 config 字段都可以作为端口进行连线
const inputPorts = computed(() => {
  // 过滤掉以 output 开头的字段，它们不提供左侧连线
  const filtered = allFields.value.filter(field => {
    return !field.key.toLowerCase().startsWith('output')
  })
  
  return filtered.map((field, index) => ({
    id: field.key,
    name: field.label,
    type: 'data',
    fieldIndex: allFields.value.findIndex(f => f.key === field.key),
    category: field.category
  }))
})

const outputPorts = computed(() => {
  // 只有 run 字段中以output开头的字段可以作为输出端口，init 参数不提供右侧连线
  // const filtered = runFields.value.filter(field => {
  //   return field.key.toLowerCase().startsWith('output')
  // })
  return runFields.value.map((field, index) => ({
    id: field.key,
    name: field.label,
    type: 'data',
    fieldIndex: allFields.value.findIndex(f => f.key === field.key),
    category: field.category
  }))
})

const statusClass = computed(() => {
  return `status-${nodeStatus.value}`
})

// Methods - 移除输入输出字段的区分逻辑

// 根据字段类型计算实际高度
const getFieldHeight = (field) => {
  if (field.type === 'textarea') {
    return 108 // textarea 的实际高度：min-height 80px + label 18px + margin 12px - padding
  }
  return 60 // 普通字段的高度
}

const getInputPortPosition = (index) => {
  // 计算输入端口位置，与对应的配置项对齐
  const headerHeight = 56 // node-header 高度
  const sectionTitleHeight = 28 // section-title 高度
  const fieldPadding = 12 // 字段间距
  
  // 使用 inputPorts 中的 fieldIndex 来获取正确的字段
  const inputPort = inputPorts.value[index]
  if (!inputPort) {
    console.error(`No inputPort found at index ${index}`)
    return headerHeight
  }
  
  const field = allFields.value[inputPort.fieldIndex]
  if (!field) {
    console.error(`No field found at fieldIndex ${inputPort.fieldIndex}`)
    return headerHeight
  }
  
  let offset = headerHeight
  
  // 现在 init 参数在上方，run 参数在下方
  if (field.category === 'init') {
    const initIndex = initFields.value.findIndex(f => f.key === field.key)
    if (initFields.value.length > 0) {
      offset += sectionTitleHeight
      // 累加前面所有 init 字段的高度
      for (let i = 0; i < initIndex; i++) {
        offset += getFieldHeight(initFields.value[i]) + fieldPadding
      }
      // 加上当前字段高度的一半，使端口居中对齐
      offset += getFieldHeight(field) / 2
    }
  } 
  // 如果是 run 字段
  else if (field.category === 'run') {
    const runIndex = runFields.value.findIndex(f => f.key === field.key)
    // 先加上 init 区域的高度
    if (initFields.value.length > 0) {
      offset += sectionTitleHeight
      for (let i = 0; i < initFields.value.length; i++) {
        offset += getFieldHeight(initFields.value[i]) + fieldPadding
      }
    }
    // 再加上 run 区域的高度
    if (runFields.value.length > 0) {
      offset += sectionTitleHeight
      for (let i = 0; i < runIndex; i++) {
        offset += getFieldHeight(runFields.value[i]) + fieldPadding
      }
      offset += getFieldHeight(field) / 2
    }
  }
  
  return offset
}

const getOutputPortPosition = (index) => {
  // 输出端口只针对 run 字段，需要重新计算位置
  const outputPort = outputPorts.value[index]
  const field = allFields.value[outputPort.fieldIndex]
  
  if (!field) {
    console.error(`No field found for outputPort at fieldIndex ${outputPort.fieldIndex}`)
    return 56 // 默认 header 高度
  }
    
  // 直接计算位置，不依赖 getInputPortPosition，使用动态高度计算
  const headerHeight = 56
  const sectionTitleHeight = 28
  const fieldPadding = 12
  
  let offset = headerHeight
  
  if (field.category === 'init') {
    const initIndex = initFields.value.findIndex(f => f.key === field.key)
    if (initFields.value.length > 0) {
      offset += sectionTitleHeight
      for (let i = 0; i < initIndex; i++) {
        offset += getFieldHeight(initFields.value[i]) + fieldPadding
      }
      offset += getFieldHeight(field) / 2
    }
  } else if (field.category === 'run') {
    const runIndex = runFields.value.findIndex(f => f.key === field.key)
    // 先加上 init 区域的高度
    if (initFields.value.length > 0) {
      offset += sectionTitleHeight
      for (let i = 0; i < initFields.value.length; i++) {
        offset += getFieldHeight(initFields.value[i]) + fieldPadding
      }
    }
    // 再加上 run 区域的高度
    if (runFields.value.length > 0) {
      offset += sectionTitleHeight
      for (let i = 0; i < runIndex; i++) {
        offset += getFieldHeight(runFields.value[i]) + fieldPadding
      }
      offset += getFieldHeight(field) / 2
    }
  }
  
  return offset
}


const formatLabel = (key) => {
  // 特殊key的映射
  const keyMap = {
    'input_instruction_key': 'Input key',
    'input_key': 'Input key',
    'output_key': 'Output key',
    'instruction': 'Instruction',
    'json_schema': 'JSON Schema'
  }
  
  // 如果有特殊映射，直接返回
  if (keyMap[key]) {
    return keyMap[key]
  }
  
  // 默认格式化逻辑
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .replace(/^\w/, c => c.toUpperCase())
}

const inferFieldType = (value, key) => {
  if (typeof value === 'boolean') return 'select'
  if (typeof value === 'number') return 'number'
  if (Array.isArray(value)) return 'select'  // 数组类型显示为下拉选择框
  if (typeof value === 'string') {
    // 特定字段强制使用 textarea
    if (key === 'system_prompt' || key === 'prompt_template' || key === 'json_schema') return 'textarea'
    if (value.length > 50) return 'textarea'
    return 'text'
  }
  if (value === null || value === undefined) {
    // 对于空值，也要检查特定字段名
    if (key === 'system_prompt' || key === 'prompt_template' || key === 'json_schema') return 'textarea'
    return 'text'
  }
  return 'text'
}

const getSelectOptions = (key, value) => {
  if (typeof value === 'boolean') {
    return [
      { label: '是', value: true },
      { label: '否', value: false }
    ]
  }
  
  // 如果是数组类型，将数组元素作为选项
  if (Array.isArray(value)) {
    return value.map(item => ({
      label: item,
      value: item
    }))
  }
  
  return []
}

// 检查字段是否有对应的输出端口
const getOutputPortForField = (fieldKey) => {
  return outputPorts.value.find(port => port.id === fieldKey)
}

// 应用类型转换规则
const applyTypeConversionRules = (config, originalConfig) => {
  const convertedConfig = {}
  
  Object.keys(config).forEach(key => {
    let value = config[key]
    
    // 如果原始配置中该字段是数组类型，将选中的值包装成数组
    if (originalConfig && Array.isArray(originalConfig[key])) {
      if (value !== null && value !== undefined && value !== '') {
        value = [value]  // 将选中的单个值包装成数组
      } else {
        value = []  // 空值保存为空数组
      }
    }
    // 如果key以num开头，将值转换为int类型
    else if (key.startsWith('num') && value !== null && value !== undefined && value !== '') {
      const numValue = parseInt(value, 10)
      if (!isNaN(numValue)) {
        value = numValue
      }
    }
    
    convertedConfig[key] = value
  })
  
  return convertedConfig
}

// 分别更新 run 和 init 配置
const updateRunConfig = () => {
  console.log('updateRunConfig called with localRunConfig:', localRunConfig.value)
  
  // 应用类型转换规则，传入原始配置以识别数组类型
  const operator = props.data.operator
  const originalRunConfig = operator.config?.run || {}
  const convertedConfig = applyTypeConversionRules(localRunConfig.value, originalRunConfig)
  
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

const updateInitConfig = () => {
  console.log('updateInitConfig called with localInitConfig:', localInitConfig.value)
  
  // 应用类型转换规则，传入原始配置以识别数组类型
  const operator = props.data.operator
  const originalInitConfig = operator.config?.init || {}
  const convertedConfig = applyTypeConversionRules(localInitConfig.value, originalInitConfig)
  
  if (onNodeUpdate) {
    onNodeUpdate(props.id, {
      initConfig: { ...convertedConfig }
    })
  } else {
    console.warn('onNodeUpdate function not available, using emit fallback')
    emit('update-node', props.id, {
      initConfig: { ...convertedConfig }
    })
  }
}

const startResize = (event) => {
  event.preventDefault()
  // Implement resize logic if needed
  console.log('Start resize')
}

// 删除节点处理函数
const handleDelete = () => {
  if (onNodeDelete) {
    onNodeDelete(props.id)
  }
}

// Initialize local config - 严格区分 run 和 init 配置
const initializeConfig = () => {
  const operator = props.data.operator
  const defaultRunConfig = operator.config?.run || {}
  const defaultInitConfig = operator.config?.init || {}
  
  // 初始化 run 配置
  const mergedRunConfig = { 
    ...defaultRunConfig, 
    ...(props.data.runConfig || {})
  }
  
  // 将数组字段转换为单个值（用于 v-model）
  Object.keys(mergedRunConfig).forEach(key => {
    const defaultValue = defaultRunConfig[key]
    const userValue = mergedRunConfig[key]
    
    // 如果原始配置是数组类型
    if (Array.isArray(defaultValue)) {
      // 如果用户值也是数组，取第一个元素；否则使用用户值或默认数组的第一个元素
      if (Array.isArray(userValue) && userValue.length > 0) {
        mergedRunConfig[key] = userValue[0]
      } else if (!Array.isArray(userValue) && userValue !== null && userValue !== undefined) {
        mergedRunConfig[key] = userValue
      } else if (defaultValue.length > 0) {
        mergedRunConfig[key] = defaultValue[0]
      } else {
        mergedRunConfig[key] = ''
      }
    }
  })
  
  localRunConfig.value = mergedRunConfig
  
  // 初始化 init 配置
  const mergedInitConfig = { 
    ...defaultInitConfig, 
    ...(props.data.initConfig || {})
  }
  
  // 将数组字段转换为单个值（用于 v-model）
  Object.keys(mergedInitConfig).forEach(key => {
    const defaultValue = defaultInitConfig[key]
    const userValue = mergedInitConfig[key]
    
    // 如果原始配置是数组类型
    if (Array.isArray(defaultValue)) {
      // 如果用户值也是数组，取第一个元素；否则使用用户值或默认数组的第一个元素
      if (Array.isArray(userValue) && userValue.length > 0) {
        mergedInitConfig[key] = userValue[0]
      } else if (!Array.isArray(userValue) && userValue !== null && userValue !== undefined) {
        mergedInitConfig[key] = userValue
      } else if (defaultValue.length > 0) {
        mergedInitConfig[key] = defaultValue[0]
      } else {
        mergedInitConfig[key] = ''
      }
    }
  })
  
  localInitConfig.value = mergedInitConfig
}

// Lifecycle
onMounted(() => {
  initializeConfig()
})

// Watch for node data changes - 当props.data变化时重新初始化配置
watch(() => props.data, (newData, oldData) => {
  initializeConfig()
}, { deep: true, immediate: true })

// 监听 runConfig 的变化并更新本地配置
watch(() => props.data?.runConfig, (newRunConfig, oldRunConfig) => {
  if (newRunConfig && oldRunConfig) {
    // 逐字段比较并更新
    Object.keys(newRunConfig).forEach(key => {
      if (newRunConfig[key] !== oldRunConfig[key]) {
        // 直接更新 localRunConfig
        if (localRunConfig.value.hasOwnProperty(key)) {
          localRunConfig.value[key] = newRunConfig[key]
        }
      }
    })
  } else if (newRunConfig) {
    // 如果是首次设置，直接合并
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


// Prompt Editor methods
const openPromptEditor = (field, category) => {
  currentEditingField.value = field
  currentEditingCategory.value = category
  
  // 获取当前内容
  if (category === 'run') {
    currentEditingContent.value = localRunConfig.value[field.key] || ''
  } else {
    currentEditingContent.value = localInitConfig.value[field.key] || ''
  }
  
  showPromptEditor.value = true
}

const handlePromptSave = (content) => {
  if (!currentEditingField.value || !currentEditingCategory.value) return
  
  const fieldKey = currentEditingField.value.key
  
  // 更新对应的配置
  if (currentEditingCategory.value === 'run') {
    localRunConfig.value[fieldKey] = content
    updateRunConfig()
  } else {
    localInitConfig.value[fieldKey] = content
    updateInitConfig()
  }
  
  // 重置编辑状态
  currentEditingField.value = null
  currentEditingCategory.value = null
  currentEditingContent.value = ''
}

watch(() => props.data?.initConfig, (newInitConfig) => {
  if (newInitConfig) {
    Object.keys(newInitConfig).forEach(key => {
      if (localInitConfig.value[key] !== newInitConfig[key]) {
        localInitConfig.value[key] = newInitConfig[key]
      }
    })
  }
}, { deep: true })
</script>

<style scoped>
.operator-node {
  background: white;
  border: 2px solid #E5E5EA;
  border-radius: 12px;
  min-width: 240px;
  min-height: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  overflow: visible; /* 允许内联端口显示在节点外部 */
}

.operator-node:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.operator-node.selected {
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
}

/* Node Header */
.node-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #F8F9FA 0%, #F2F2F7 100%);
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
  color: #8E8E93;
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
  overflow: visible; /* 允许内联端口显示在节点外部 */
}

.input-section,
.output-section,
.run-section,
.init-section {
  margin-bottom: 16px;
  overflow: visible; /* 允许内联端口显示在节点外部 */
}

.input-section:last-child,
.output-section:last-child,
.run-section:last-child,
.init-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #1C1C1E;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #E5E5EA;
}

.run-section .section-title {
  color: #007AFF;
}

.init-section .section-title {
  color: #34C759;
}

.config-item {
  margin-bottom: 12px;
  position: relative; /* 添加相对定位以支持内联输出端口 */
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

.config-input,
.config-textarea {
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

.config-input:focus,
.config-textarea:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
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
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.config-select :deep(.el-input__inner) {
  font-family: inherit;
  font-size: 14px;
}

/* 控制算子节点下拉面板大小 */
:global(.operator-node-select-dropdown) {
  min-width: 120px !important;
  max-width: 220px !important;
  width: fit-content !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

:global(.operator-node-select-dropdown .el-select-dropdown__item) {
  font-size: 13px !important;
  padding: 8px 12px !important;
  line-height: 1.3 !important;
  min-height: auto !important;
}

:global(.operator-node-select-dropdown .el-select-dropdown__item:hover) {
  background-color: #F2F2F7 !important;
}

:global(.operator-node-select-dropdown .el-select-dropdown__item.selected) {
  background-color: #007AFF !important;
  color: white !important;
}

.textarea-container {
  position: relative;
  display: flex;
  align-items: stretch;
}

.config-textarea {
  resize: vertical;
  min-height: 80px;
  max-height: 200px;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  cursor: pointer;
  padding-right: 40px;
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
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

.expand-icon {
  width: 16px;
  height: 16px;
}

.output-info {
  font-size: 12px;
  color: #8E8E93;
  background: #F2F2F7;
  padding: 8px 12px;
  border-radius: 8px;
  font-family: 'SF Mono', Consolas, monospace;
}

.empty-config {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.empty-message {
  font-size: 13px;
  color: #8E8E93;
  font-style: italic;
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

/* 内联输出端口样式 - 定位在配置项右侧 */
.inline-output-port {
  position: absolute;
  right: -24px; /* 将端口定位到配置项外侧 */
  top: 50%;
  transform: translateY(-50%);
  pointer-events: all;
}

.inline-output-port:hover {
  transform: translateY(-50%) scale(1.3); /* 悬停时保持垂直居中 */
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
  box-shadow: 0 2px 4px rgba(0, 122, 255, 0.3);
}

.port:hover {
  background: #0056b3;
  transform: translateY(-50%) scale(1.2);
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.4);
}

.port.port-data {
  background: #007AFF;
}

.port.port-control {
  background: #FF9500;
}

.port.port-event {
  background: #34C759;
}

/* 根据配置类别和端口类型区分端口颜色 */

/* 输入端口（左侧）- 保持原颜色 */
.input-port.port-run {
  background: #007AFF;
  border-color: #007AFF;
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.4);
}

.input-port.port-init {
  background: #34C759;
  border-color: #34C759;
  box-shadow: 0 2px 6px rgba(52, 199, 89, 0.4);
}

.input-port.port-run:hover {
  background: #0056b3;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.5), 0 2px 8px rgba(0, 122, 255, 0.3);
  transform: translateY(-50%) scale(1.3);
}

.input-port.port-init:hover {
  background: #28a745;
  box-shadow: 0 0 0 4px rgba(52, 199, 89, 0.5), 0 2px 8px rgba(52, 199, 89, 0.3);
  transform: translateY(-50%) scale(1.3);
}

/* 输出端口（右侧）- 使用橙色系，更有输出感 */
.output-port.port-run {
  background: linear-gradient(135deg, #FF6B35, #FF8E53);
  border: 2px solid #FF6B35;
  box-shadow: 0 3px 8px rgba(255, 107, 53, 0.4);
}

.output-port:hover {
  background: linear-gradient(135deg, #E55A2B, #FF7A40);
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.5), 0 3px 12px rgba(255, 107, 53, 0.4);
  transform: translateY(-50%) scale(1.3);
}

/* 为输出端口添加发光效果 */
.output-port::before {
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

/* 节点级输入端点 - 灰色系 */
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

/* 节点级输出端点 - 灰色系 */
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

/* 默认输入端口样式 */
:deep(.vue-flow__handle[type="target"]) {
  background: #007AFF !important;
  box-shadow: 0 2px 4px rgba(0, 122, 255, 0.3) !important;
}

/* 默认输出端口样式 - 橙色渐变 */
:deep(.vue-flow__handle[type="source"]) {
  background: linear-gradient(135deg, #FF6B35, #FF8E53) !important;
  border: 2px solid #FF6B35 !important;
  box-shadow: 0 3px 8px rgba(255, 107, 53, 0.4) !important;
}

:deep(.vue-flow__handle[type="target"]:hover) {
  background: #0056b3 !important;
  transform: scale(1.2) !important;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.4), 0 2px 6px rgba(0, 122, 255, 0.3) !important;
}

:deep(.vue-flow__handle[type="source"]:hover) {
  background: linear-gradient(135deg, #E55A2B, #FF7A40) !important;
  transform: scale(1.2) !important;
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.5), 0 3px 12px rgba(255, 107, 53, 0.4) !important;
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
