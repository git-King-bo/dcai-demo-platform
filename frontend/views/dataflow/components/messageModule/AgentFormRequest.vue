<template>
  <div class="form-request-card">
    <div class="form-header">
      <div class="header-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 11H3v2h6m0-2v8m0-8l6 6m-6-6l-6 6"></path>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        </svg>
      </div>
      <div class="header-content">
        <span class="header-text">需求总结</span>
        <span v-if="content.target_workflow" class="workflow-name">{{ content.target_workflow }}</span>
      </div>
    </div>
    
    <div class="form-body">
      <div v-if="content.form_stage" class="form-stage">
        <span class="stage-label">当前阶段:</span>
        <span class="stage-value">{{ getStageLabel(content.form_stage) }}</span>
      </div>
      
      <div v-if="formFields && Object.keys(formFields).length > 0" class="form-fields">
        <div v-for="(value, key) in formFields" :key="key" class="form-field">
          <label :for="`field-${key}`" class="field-label">
            {{ getFieldLabel(key) }}
            <span v-if="isRequiredField(key)" class="required-mark">*</span>
          </label>

          <!-- 文本、数字、布尔与pointsField分流 -->
          <template v-if="isPointsField(key)">
            <div class="points-list-wrapper">
                <el-input
                v-model="formData[key]"
                maxlength="200"
                style="width: 240px"
                placeholder="Please input"
                rows="4"
                resize="none"
                show-word-limit
                type="textarea"
              />
              <!-- <div v-for="(point, idx) in formData[key]" :key="idx" class="point-row">
                <span class="point-index">{{ idx + 1 }}</span>
                <input
                  class="point-input"
                  v-model="formData[key][idx]"
                  :placeholder="`列举要点${idx+1}`"
                  @keydown.enter.prevent="addPoint(key)"
                  maxlength="120"
                />
                <button type="button" class="icon-btn minus" @click="removePoint(key, idx)" :disabled="formData[key].length <= 1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <button type="button" class="icon-btn plus" @click="addPoint(key)" v-if="idx === formData[key].length - 1 && formData[key][idx].trim()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div> -->
            </div>
          </template>
          <template 
            v-else-if="key === 'pipeline'"
          >
          <div   
            ref="pipelineDragArea"   
            @dragover="onDragOver" @drop="handleDrag" @dragend="handleDragEnd" @dragleave="handleDragLeave">
           <el-select
            class="select-input "
          
            v-model="formData[key]"
            filterable
            @change="handleSelect(formData[key])"
            :placeholder="getFieldPlaceholder(key)"
          >
            <el-option
              v-for="item in templates"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
          </div>
          <div v-if="key === 'pipeline'&& pipelineTemplate?.template" :class="[{'removeHover': isHover},'template-card']">
            <div class="template-header">
              <div class="template-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 20H16.8C15.1198 20 14.2798 20 13.638 19.673C13.0735 19.3854 12.6146 18.9265 12.327 18.362C12 17.7202 12 16.8802 12 15.2V8.8C12 7.11984 12 6.27976 12.327 5.63803C12.6146 5.07354 13.0735 4.6146 13.638 4.32698C14.2798 4 15.1198 4 16.8 4H17M17 20C17 21.1046 17.8954 22 19 22C20.1046 22 21 21.1046 21 20C21 18.8954 20.1046 18 19 18C17.8954 18 17 18.8954 17 20ZM17 4C17 5.10457 17.8954 6 19 6C20.1046 6 21 5.10457 21 4C21 2.89543 20.1046 2 19 2C17.8954 2 17 2.89543 17 4ZM7 12L17 12M7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12ZM17 12C17 13.1046 17.8954 14 19 14C20.1046 14 21 13.1046 21 12C21 10.8954 20.1046 10 19 10C17.8954 10 17 10.8954 17 12Z"/>
                  </svg>
                </div>
                <div class="template-info">
                  <div class="template-name">{{ pipelineTemplate?.template?.name }}</div>
                  <div class="template-type">{{ pipelineTemplate?.template?.template_type || 'TEMPLATE' }}</div>
                </div>
                <el-icon @click="removeTemplate" @mouseenter="isHover = true" @mouseleave="isHover = false" class="remove-icon">
                  <delete />
                </el-icon>
            </div>
              <!-- 描述部分 -->
            <div v-if="pipelineTemplate?.template?.description" class="template-section">
              <div class="section-label">功能描述</div>
              <div class="template-description">
                {{ pipelineTemplate?.template?.description }}
              </div>
            </div>
          </div>
          </template>

          <input
            v-else-if="getFieldType(key) === 'text'"
            :id="`field-${key}`"
            v-model="formData[key]"
            type="text"
            class="field-input"
            :placeholder="getFieldPlaceholder(key)"
          />
          
          <!-- 数字输入 -->
          <input
            v-else-if="getFieldType(key) === 'number'"
            :id="`field-${key}`"
            v-model.number="formData[key]"
            type="number"
            class="field-input"
            :placeholder="getFieldPlaceholder(key)"
          />
          
          <!-- 布尔值选择 -->
          <div v-else-if="getFieldType(key) === 'boolean'" class="field-toggle">
            <label class="toggle-switch">
              <input
                type="checkbox"
                v-model="formData[key]"
              />
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-label">{{ formData[key] ? '是' : '否' }}</span>
          </div>
          
          <!-- 其他类型 -->
          <textarea
            v-else
            :id="`field-${key}`"
            v-model="formData[key]"
            class="field-textarea"
            :placeholder="getFieldPlaceholder(key)"
            rows="3"
          />
        </div>
      </div>
      
      <div class="form-actions" v-if="isShowBtn">
        <!-- <button 
          class="action-button cancel"
          @click="handleCancel"
        >
          取消
        </button> -->
        <button 
          class="action-button submit"
          @click="handleSubmit"
        >
          开始编排管线
        </button>
      </div>
    </div>
    
    <div v-if="timestamp" class="timestamp">
      {{ formatTime(timestamp) }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch, reactive, watchEffect } from 'vue'
import { useAgentStore } from '@/store/modules/agent'
import { ElMessage } from 'element-plus'
import { getBestTemplateList } from '@/api/task'

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

const emit = defineEmits(['submit', 'cancel'])

let agentStore = null
function getAgentStore() {
  if (!agentStore) {
    agentStore = useAgentStore()
  }
  return agentStore
}
const formData = reactive({})

// 注入 WebSocket 方法
const sendFormUpdate = inject('sendFormUpdate', null)
const resetCanvas = inject('resetCanvas')
const addDatasetNode = inject('addDatasetNode')
const pipelineTemplate=ref({})
const templates = ref([])


// 表单字段
const formFields = computed(() => props.content.form_data?.fields || {})

// 初始化表单数据 - 使用 watch 确保响应式更新
const initFormData = () => {
  const fields = formFields.value
  Object.keys(fields).forEach(key => {
    formData[key] = fields[key]
  })
  console.log('[Form] 初始化表单数据:', formData)
}

// 监听 formFields 变化
const pointsFields = ['task_goal', 'dataset_info', 'processing_rules', 'target']
const isPointsField = (key) => pointsFields.includes(key)

const ensurePointsArray = (key, value) => {
  // 保证 pointsField 类型为数组，非数组转为数组结构
  if (isPointsField(key)) {
    if (Array.isArray(value)) return [...value]
    if (typeof value === 'string' && value.trim() !== '') return value.split(/\n+|[,;，；]/).map(i => i.trim()).filter(Boolean)
    return ['']
  }
  return value
}

watch(formFields, (newFields) => {
  if (newFields && Object.keys(newFields).length > 0) {
    Object.keys(newFields).forEach(key => {
      formData[key] = ensurePointsArray(key, newFields[key])
      if(key === 'pipeline' && formData.pipeline){
        // console.log('formData.pipeline',JSON.parse(formData.pipeline),'===>>>');
        formData[key] = JSON.parse(formData.pipeline).id
      }
    })
  }
}, { immediate: true, deep: true })


const addPoint = (key) => {
  formData[key].push('')
}
const removePoint = (key, idx) => {
  if (formData[key].length <= 1) return
  formData[key].splice(idx, 1)
}
// 表单提交时 pointsFields 拼回字符串
const processFormData = () => {
  const result = { ...formData }
  pointsFields.forEach(key => {
    if (Array.isArray(result[key])) {
      result[key] = result[key].filter(Boolean).join('\n')
    }
  })
  return result
}
  console.log('[Form] 加载模版列表','sa-f-safasfs');

const loadTemplates = async () => {
  console.log('[Form] 加载模版列表','sa-f-safasfs');
  
  try {
    const response = await getBestTemplateList()
    console.log('Template API response:', response)
    console.log('Response type:', typeof response)
    console.log('Response keys:', Object.keys(response || {}))
    
    // Handle different response structures - fix for API returning nested data
    let templateData = []
    
    // Check for nested data.list structure (from your log: data.list: Array(6))
    if (response?.data?.list && Array.isArray(response.data.list)) {
      console.log('Using response.data.list, length:', response.data.list.length)
      templateData = response.data.list
    }
    // Check for direct list property
    else if (response?.list && Array.isArray(response.list)) {
      console.log('Using response.list, length:', response.list.length)
      templateData = response.list
    }
    // Check for direct data array
    else if (response?.data && Array.isArray(response.data)) {
      console.log('Using response.data, length:', response.data.length)
      templateData = response.data
    }
    // Check if response itself is array
    else if (Array.isArray(response)) {
      console.log('Using response as array, length:', response.length)
      templateData = response
    }
    // Fallback to single object
    else if (response && typeof response === 'object') {
      console.log('Using response as single object')
      templateData = [response]
    }
    
    templates.value = templateData
    if(formData.pipeline){
      pipelineTemplate.value.template = templates.value.filter(item=>item.id===formData.pipeline)[0]
    }
    console.log('Final processed templates:', templates.value)
    console.log('Final templates count:', templates.value.length)
    console.log('First template sample:', templates.value[0])
  } catch (error) {
    console.error('Error loading templates:', error)
    ElMessage.error('加载模版失败')
    templates.value = []
  } finally {
  }
}
// 兼容性：在 mounted 时也初始化一次
onMounted(() => {
  console.log('------12122');
  // 历史消息模式下隐藏按钮
  isShowBtn.value = !props.content?.historyMsg
  loadTemplates()
  if (Object.keys(formData).length === 0) {
    initFormData()
  }
})

// 字段标签映射
const fieldLabels = {
  'task_goal': '描述任务目标',
  'dataset_info': '描述数据集特征',
  'processing_rules':'描述数据处理规则',
  'target': '处理目标',
  'pipeline':"调优管线",
  'code_file_path': '代码保存路径',
  'language': '语言',
  'chat_api_url': 'API地址',
  'api_key': 'API密钥',
  'model': '模型',
  'need_debug': '需要调试',
  'max_debug_rounds': '最大调试轮数'
}

const getFieldLabel = (key) => {
  return fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
const strToBoolean = (str) => {
  // 处理json字符串转为布尔值
  if(str === 'True') return true
  if(str === 'False') return false
  return str
}
const getFieldType = (key) => {
  console.log(formFields.value[key] ,'formFields.value[key] ');
  
  const value = formFields.value[key]
  if (typeof strToBoolean(value) === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  if (key.includes('url') || key.includes('path')) return 'text'
  return 'text'
}

const getFieldPlaceholder = (key) => {
  const placeholders = {
    'json_file': '请输入JSON文件路径',
    'target': '请输入处理目标描述',
    'code_file_path': '请输入代码保存路径',
    'api_key': '请输入API密钥',
    'model': '请选择模型'
  }
  return placeholders[key] || `请输入${getFieldLabel(key)}`
}

const isRequiredField = (key) => {
  // 标记必填字段
  const requiredFields = ['task_goal']
  return requiredFields.includes(key)
}

const getStageLabel = (stage) => {
  const stages = {
    'parameter_collection': '需求收集',
    'validation': '验证',
    'execution': '执行'
  }
  return stages[stage] || stage
}

const isFormValid = computed(() => {
  // 动态检查所有必填字段
  const fields = formFields.value
  if (!fields || Object.keys(fields).length === 0) {
    return false
  }
  
  // 检查所有标记为必填的字段
  const isValid = Object.keys(fields).every(key => {
    // 如果不是必填字段，跳过验证
    if (!isRequiredField(key)) {
      return true
    }
    
    const value = formData[key]
    
    // 如果是 pointsField（数组类型或字符串类型）
    if (isPointsField(key)) {
      // 兼容数组和字符串两种类型
      if (Array.isArray(value)) {
        // 检查数组中是否有非空元素
        return value.some(item => item && item.toString().trim() !== '')
      }
      // 如果是字符串，检查是否非空
      return value !== undefined && value !== null && value.toString().trim() !== ''
    }
    
    // 普通字段：检查是否有值且不为空
    return value !== undefined && value !== null && value.toString().trim() !== ''
  })
  
  console.log('[Form] 表单验证状态:', isValid, '当前数据:', formData)
  return isValid
})
const isShowBtn = ref(true)
const handleSubmit = () => {
  // 通过WebSocket发送表单更新消息
  if (sendFormUpdate) {
    // getAgentStore().closePanel()
    const submitData = processFormData()
    getAgentStore().setFormFields=submitData
    console.log('[Form] 提交表单数据:', submitData)
    const success = sendFormUpdate(submitData)
    if(pipelineTemplate.value.template){
      pipelineTemplate.value.template.pipeline_config.id = pipelineTemplate.value.template.id
      // pipelineTemplate.value.template.pipeline_config.pipelineT=pipelineTemplate.value.template
      console.log('pipelineTemplate.value.template.pipeline_config.id',pipelineTemplate.value.template.pipeline_config);
      
      submitData.pipeline = JSON.stringify(pipelineTemplate.value.template.pipeline_config) 
      submitData.deep_think = true
    }
    if (success) {
      resetCanvas()
      isShowBtn.value = false
      // setTimeout(()=>{
      //   addDatasetNode()
      // },1000)
      ElMessage.success('表单已提交')
      emit('submit', submitData)
    }
  } else {
    console.error('[Form] WebSocket sendFormUpdate 方法未注入')
    ElMessage.error('无法提交表单，WebSocket未连接')
  }
}
const pipelineDragArea = ref(null)
const  handleDrag=(event) =>{
    event.preventDefault()
    pipelineTemplate.value = JSON.parse(event.dataTransfer.getData('application/json'))
     if(pipelineDragArea.value){
      formData.pipeline = pipelineTemplate.value.template.id
        // pipelineDragArea.value[0].style.backgroundColor = 'transparent'
        pipelineDragArea.value[0].classList.remove('pipeline-hover-area')
      }
      
      console.log('==>>>', event,pipelineTemplate.value);
   
    }
  const handleDragLeave = (event) => {
    if(pipelineDragArea.value){
      // pipelineDragArea.value[0].style.backgroundColor = 'transparent'
      pipelineDragArea.value[0].classList.remove('pipeline-hover-area')
    }
  }
  const  handleDragEnd=(event)=> {
    }
  const onDragOver = (event) => {
  event.preventDefault()
  console.log(pipelineDragArea.value,'==');
  
  // console.log('拖动过程中，是否在区域内:', pipelineDragArea.value);
  if(pipelineDragArea.value){
    // pipelineDragArea.value[0].style.backgroundColor = 'rgba(0, 122, 255, 0.08)'
    pipelineDragArea.value[0].classList.add('pipeline-hover-area')
  }
  event.dataTransfer.dropEffect = 'copy'
}
// 卡片hover效果
const isHover = ref(false)
const handleSelect=(val)=>{
  
  pipelineTemplate.value.template = templates.value.filter(item=>item.id===val)[0]
  console.log('[Form] 选择模版:', val,pipelineTemplate.value);

}
// 移除模板
const removeTemplate=()=>{
  pipelineTemplate.value = {}
  formData.pipeline = ''
  isHover.value = false
}
const handleCancel = () => {
  emit('cancel')
}

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
.form-request-card {
  background: white;
  border: 0.5px solid rgba(0, 122, 255, 0.2);
  border-radius: 16px;
  padding: 0;
  margin: 8px 0;
  box-shadow: 
    0 4px 16px rgba(0, 122, 255, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
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

.form-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(90, 200, 250, 0.08) 100%);
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
}

.header-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
  border-radius: 10px;
  color: white;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.header-text {
  font-size: 15px;
  font-weight: 600;
  color: #1D1D1F;
  letter-spacing: -0.2px;
}

.workflow-name {
  font-size: 11px;
  font-weight: 500;
  color: #86868B;
  letter-spacing: -0.1px;
  font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
}

.form-body {
  padding: 16px;
}

.form-stage {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 12px;
}

.stage-label {
  font-weight: 500;
  color: #86868B;
}

.stage-value {
  font-weight: 600;
  color: #007AFF;
}

.form-fields {
  display: flex;
  flex-direction: row;
  gap: 6px;
  margin-bottom: 16px;
  justify-content: space-around
}

.pipeline-drag-area{
  width:100px;
  height:100px;
  border:1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;  
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.pipeline-hover-area{
    background-color: rgb(238 243 248,0.08);
    border: 1px solid pink;
    border-radius: 10px;
}
.template-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  /* cursor: pointer; */
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
}

.removeHover  {
  cursor: pointer;
  border-color: red;
}
.template-card:hover {
  background: rgba(255, 255, 255, 1);
  /* border-color: rgba(0, 122, 255, 0.2); */
  /* transform: translateY(-3px); */
  box-shadow: 0 8px 32px rgba(0, 122, 255, 0.12);
}

.template-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.template-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #007aff, #5ac8fa);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.25);
}

.template-info {
  flex: 1;
  min-width: 0;
}

.template-name {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  line-height: 1.3;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.022em;
}

.template-type {
  font-size: 11px;
  color: #8e8e93;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.template-section {
  margin-bottom: 16px;
}

.template-section:last-child {
  margin-bottom: 0;
}

.section-label {
  font-size: 13px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 6px;
  letter-spacing: -0.022em;
}

.template-description {
  font-size: 12px;
  color: #6d6d70;
  line-height: 1.4;
  font-weight: 400;
  letter-spacing: -0.022em;
  /* 强制显示完整文本，覆盖任何可能的截断样式 */
  overflow: visible !important;
  text-overflow: initial !important;
  white-space: normal !important;
  display: block !important;
  -webkit-line-clamp: unset !important;
  -webkit-box-orient: unset !important;
  max-height: none !important;
  height: auto !important;
}
.select-input ::v-deep(.el-select__wrapper){
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    font-size: 13px;
    font-weight: 400;
    color: #1D1D1F;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: none;
  }
  .select-input .el-select__wrapper::focus {
    background: white;
    border-color: #007AFF;
    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.08);
  }
.form-field {
  /* display: flex; */
  flex-direction: column;
  /* gap: 6px; */
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #1D1D1F;
  letter-spacing: -0.1px;
  display: flex;
  align-items: center;
  justify-content: center;  
  gap: 4px;
}

.required-mark {
  color: #FF3B30;
  font-size: 14px;
}

.field-input,
.field-textarea {
  width: 100%;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 400;
  color: #1D1D1F;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

.field-input:focus,
.field-textarea:focus {
  background: white;
  border-color: #007AFF;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.08);
}

.field-input::placeholder,
.field-textarea::placeholder {
  color: #86868B;
  opacity: 0.6;
}

.field-textarea {
  resize: vertical;
  min-height: 60px;
}

.field-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 10px;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 26px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 13px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 22px;
  width: 22px;
  left: 2px;
  top: 2px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-switch input:checked + .toggle-slider {
  background: linear-gradient(135deg, #34C759 0%, #30D158 100%);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(18px);
}

.toggle-label {
  font-size: 13px;
  font-weight: 500;
  color: #1D1D1F;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: center;
}

.action-button {
  /* flex: 1; */
  height: 44px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.3px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  width: 20%;
}

.action-button.cancel {
  background: rgba(0, 0, 0, 0.05);
  color: #1D1D1F;
}

.action-button.cancel:hover {
  background: rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.action-button.cancel:active {
  transform: translateY(0) scale(0.98);
}

.action-button.submit {
  background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.25);
}

.action-button.submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.35);
}

.action-button.submit:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.timestamp {
  font-size: 11px;
  font-weight: 400;
  color: #86868B;
  text-align: right;
  padding: 0 16px 12px;
  letter-spacing: -0.1px;
}

.points-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* background: #F6F7F9; */
  border-radius: 16px;
  padding: 16px 0px 10px 0px;
  margin: 0 0 12px 0;
  box-shadow: none;
  border: none;
}
.points-list-wrapper ::v-deep(.el-input__count){
  bottom: -14px;
  background: transparent;
}
.points-list-wrapper ::v-deep(.el-textarea__inner){
    color: #716f6f;
    font-size: 12px !important;
}
.point-row {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #E6E6EA;
  transition: border-color 0.18s, box-shadow 0.18s;
  padding: 0 8px 0 0;
  position: relative;
  min-height: 44px;
  margin-bottom: 0;
}
.point-row + .point-row {
  margin-top: 10px;
}
.point-row:focus-within {
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.10);
}
.point-index {
  min-width: 1.2em;
  margin: 0 2px 0 12px;
  color: #B0B3B8;
  font-size: 15px;
  font-weight: 500;
  user-select: none;
  letter-spacing: 0.01em;
}
.point-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #1D1D1F;
  outline: none;
  padding: 13px 8px 13px 0px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
}
.point-input::placeholder {
  color: #BDBFC2;
  font-weight: 400;
}
.point-input:focus {
  background: none;
}
.icon-btn {
  background: none;
  border: none;
  padding: 4px;
  border-radius: 50%;
  margin-left: 2px;
  cursor: pointer;
  transition: background 0.16s;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px; width: 32px;
}
.icon-btn.plus {
  color: #007AFF;
}
.icon-btn.minus {
  color: #C5C7CB;
}
.icon-btn:hover:not(:disabled) {
  background: rgba(0,122,255,0.08);
}
.icon-btn:disabled {
  opacity: 0.32;
  cursor: not-allowed;
}
</style>

