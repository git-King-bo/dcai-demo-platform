<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="70%"
    :before-close="handleClose"
    class="prompt-editor-dialog"
    append-to-body
  >
    <div class="editor-container">
      <div class="editor-header">
        <div class="field-info">
          <span class="field-name">{{ fieldLabel }}</span>
          <span class="field-description">{{ getFieldDescription(fieldKey) }}</span>
        </div>
        <div class="editor-actions">
          <el-button 
            class="editor-action-button" 
            @click="clearContent"
          >清空</el-button>
          <el-button 
            type="primary"
            class="editor-action-button" 
            @click="insertTemplate"
          >插入模板</el-button>
        </div>
      </div>
      
      <div class="editor-body">
        <textarea
          ref="editorTextarea"
          v-model="localContent"
          class="prompt-textarea"
          :placeholder="placeholder"
          @keydown="handleKeydown"
        ></textarea>
      </div>
      
      <div class="editor-footer">
        <div class="content-stats">
          <span>字符数: {{ localContent.length }}</span>
          <span>行数: {{ lineCount }}</span>
        </div>
        <div class="footer-actions">
          <el-button 
            class="editor-action-button" 
            @click="handleCancel"
          >取消</el-button>
          <el-button 
            type="primary" 
            class="editor-action-button"
            @click="handleSave"
          >保存</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElDialog, ElButton, ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  content: {
    type: String,
    default: ''
  },
  fieldKey: {
    type: String,
    default: ''
  },
  fieldLabel: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = ref(false)
const localContent = ref('')
const editorTextarea = ref(null)

// 计算属性
const title = computed(() => {
  return `编辑 ${props.fieldLabel}`
})

const placeholder = computed(() => {
  const placeholders = {
    'system_prompt': '请输入系统提示词，用于指导AI的行为和角色...\n\n例如：\nYou are a helpful assistant. Please provide accurate and helpful responses.',
    'prompt_template': '请输入提示词模板，支持变量替换...\n\n例如：\n根据以下内容回答问题：\n内容：{content}\n问题：{question}',
    'json_schema': '请输入 JSON Schema 定义，用于LLM 的结构化输出...\n\n例如：\n{\n  "type": "object",\n  "properties": {\n    "answer": {"type": "string"},\n    "score": {"type": "number"}\n  },\n  "required": ["answer"]\n}'
  }
  return placeholders[props.fieldKey] || `请输入${props.fieldLabel}内容...`
})

const lineCount = computed(() => {
  return localContent.value.split('\n').length
})

// 监听器
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal) {
    localContent.value = props.content
    nextTick(() => {
      if (editorTextarea.value) {
        editorTextarea.value.focus()
      }
    })
  }
})

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 方法
const getFieldDescription = (key) => {
  const descriptions = {
    'system_prompt': '定义AI助手的角色、目标、行为准则、输出格式',
    'prompt_template': '定义输入输出的格式模板，支持变量替换',
    'json_schema': '定义 LLM 输出的数据结构和类型约束，确保返回结果符合预期格式'
  }
  return descriptions[key] || ''
}

const handleClose = () => {
  if (localContent.value !== props.content) {
    ElMessage({
      type: 'warning',
      message: '内容已修改但未保存，确定要关闭吗？',
      showClose: true,
      duration: 3000
    })
  }
  visible.value = false
}

const handleCancel = () => {
  localContent.value = props.content
  visible.value = false
}

const handleSave = () => {
  emit('save', localContent.value)
  visible.value = false
  ElMessage.success('保存成功')
}

const clearContent = () => {
  localContent.value = ''
  if (editorTextarea.value) {
    editorTextarea.value.focus()
  }
}

const insertTemplate = () => {
  const templates = {
    'system_prompt': 'You are a helpful assistant. Please provide accurate and helpful responses based on the given context.',
    'prompt_template': '请根据以下信息完成任务：\n\n输入：{input}\n\n要求：\n1. \n2. \n3. \n\n输出：',
    'json_schema': `{
  "type": "object",
  "properties": {
    "answer": {
      "type": "string",
      "description": "回答内容"
    },
    "score": {
      "type": "number",
      "description": "置信度分数"
    }
  },
  "required": ["answer"]
}`
  }
  
  const template = templates[props.fieldKey]
  if (template) {
    if (localContent.value) {
      localContent.value += '\n\n' + template
    } else {
      localContent.value = template
    }
    
    nextTick(() => {
      if (editorTextarea.value) {
        editorTextarea.value.focus()
        editorTextarea.value.setSelectionRange(localContent.value.length, localContent.value.length)
      }
    })
  }
}

const handleKeydown = (event) => {
  // Ctrl/Cmd + Enter 快速保存
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    handleSave()
  }
  
  // Tab 键插入制表符而不是切换焦点
  if (event.key === 'Tab') {
    event.preventDefault()
    const start = event.target.selectionStart
    const end = event.target.selectionEnd
    const value = event.target.value
    
    event.target.value = value.substring(0, start) + '  ' + value.substring(end)
    event.target.setSelectionRange(start + 2, start + 2)
    
    // 更新 v-model
    localContent.value = event.target.value
  }
}
</script>

<style scoped>
.prompt-editor-dialog {
  border-radius: 12px;
}

.prompt-editor-dialog :deep(.el-dialog) {
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.prompt-editor-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #F8F9FA 0%, #F2F2F7 100%);
  border-radius: 12px 12px 0 0;
  padding: 20px 24px;
  border-bottom: 1px solid #E5E5EA;
}

.prompt-editor-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1C1C1E;
}

.prompt-editor-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.editor-container {
  display: flex;
  flex-direction: column;
  height: 60vh;
  min-height: 400px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 24px;
  border-bottom: 1px solid #E5E5EA;
  background: #FAFAFA;
}

.field-info {
  flex: 1;
}

.field-name {
  font-size: 16px;
  font-weight: 600;
  color: #1C1C1E;
  display: block;
  margin-bottom: 4px;
}

.field-description {
  font-size: 13px;
  color: #8E8E93;
  line-height: 1.4;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.editor-body {
  flex: 1;
  padding: 0;
  display: flex;
}

.prompt-textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  padding: 20px 24px;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Mono', Consolas, monospace;
  line-height: 1.6;
  color: #1C1C1E;
  background: white;
  tab-size: 2;
}

.prompt-textarea::placeholder {
  color: #8E8E93;
  line-height: 1.6;
}

.prompt-textarea:focus {
  background: #FEFEFE;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #E5E5EA;
  background: #FAFAFA;
}

.content-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #8E8E93;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.editor-action-button {
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  min-width: 80px;

  &.el-button--primary {
    background-color: #0066CC !important;
    border: none !important;
    color: white !important;

    &:hover {
      background-color: #0055AF !important;
      color: white !important;
      border-color: transparent !important;
    }

    &:active {
      background-color: #004492 !important;
      color: white !important;
      border-color: transparent !important;
    }

    &:focus {
      background-color: #0066CC !important;
      color: white !important;
      border-color: transparent !important;
    }
  }

  &.el-button--default {
    border-color: #E5E5EA;
    color: #1D1D1F;

    &:hover {
      border-color: #D1D1D6;
      background-color: #F5F5F7;
    }

    &:active {
      border-color: #C7C7CC;
      background-color: #E5E5EA;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .prompt-editor-dialog {
    width: 95% !important;
    margin: 5vh auto !important;
  }
  
  .editor-container {
    height: 70vh;
  }
  
  .editor-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .editor-actions {
    justify-content: flex-end;
  }
  
  .editor-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .content-stats {
    justify-content: center;
  }
  
  .footer-actions {
    justify-content: center;
  }
}
</style> 