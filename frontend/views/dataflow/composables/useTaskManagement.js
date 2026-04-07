/**
 * useTaskManagement Composable
 * 管理任务的保存、执行和Pipeline模板管理
 */
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { saveTask as apiSaveTask, savePipeline as apiSavePipeline } from '@/api/task'
import { useAgentStore } from '@/store/modules/agent'
import { useRouter } from 'vue-router'
let agentStore = null
function getAgentStore() {
  if (!agentStore) {
    agentStore = useAgentStore()
  }
  return agentStore
}
export function useTaskManagement(buildPipelineData, nodes, edges) {
const router = useRouter()

  // State
  const saveDialogVisible = ref(false)
  const savePipelineDialogVisible = ref(false)
  const saveLoading = ref(false)
  const savePipelineLoading = ref(false)

  // 任务表单
  const taskForm = reactive({
    name: '',
    description: '',
    dataset_ids: [],
    task_id: '',
    fromExecute: false
  })

  // Pipeline表单
  const pipelineForm = reactive({
    name: '',
    description: '',
    template_type: 'customized'
  })

  // 表单验证规则
  const taskRules = {
    name: [
      { required: true, message: '请输入任务名称', trigger: 'blur' },
    ],
    description: [
      { required: true, message: '请输入任务描述', trigger: 'blur' },
    ],
    dataset_ids: [
      { required: true, message: '请选择数据集ID', trigger: 'change' },
    ]
  }

  const pipelineRules = {
    name: [
      { required: true, message: '请输入Pipeline名称', trigger: 'blur' },
    ],
    description: [
      { required: true, message: '请输入Pipeline描述', trigger: 'blur' },
    ]
  }

  /**
   * 保存任务
   */
  const saveTask = async (taskFormRef, taskAuto) => {
    // 定义执行保存的核心逻辑
    const executeSave = async () => {
      try {
        saveLoading.value = true
        // agent
        if(taskAuto){
          const hasDeepThink = 'deep_think' in getAgentStore().agentFormTask

          taskForm.name= hasDeepThink ? '优化pipeline_' + getAgentStore().agentDatasetVal : getAgentStore().agentFormTask?.task_goal
          taskForm.description = hasDeepThink ?  getAgentStore().agentFormTask?.target : getAgentStore().agentFormTask?.dataset_info
        }
        const pipelineData = buildPipelineData({
          nodes: nodes.value || [],
          edges: edges.value || [],
          name: taskForm.name || getAgentStore().agentDatasetVal,
          description: taskForm.description || getAgentStore().agentDatasetVal,
          taskId: taskForm.task_id
        })

        console.log('保存任务请求数据:', pipelineData)
        const result = await apiSaveTask(pipelineData)
        console.log('保存任务响应:', result)

        if (result.code === 0 && result.data?.id) {
          taskForm.task_id = result.data.id

          ElMessage.success('任务保存成功！')
          saveDialogVisible.value = false

          // 如果是从执行任务按钮触发的保存，返回task_id供后续使用
          router.push({path: '/task/detail', query: {taskId: taskForm.task_id}})
          getAgentStore().closePanel()
        } else {
          ElMessage.error('保存任务失败：' + (result.msg || '未知错误'))
        }
      } catch (error) {
        console.error('保存任务出错:', error)
        ElMessage.error('保存任务失败: ' + (error.message || '未知错误'))
      } finally {
        saveLoading.value = false
      }
    }

    // 如果taskAuto为true，直接执行保存，跳过表单校验
    if (taskAuto) {
      await executeSave()
    } else {
      // 否则先进行表单校验
      if (!taskFormRef) return

      await taskFormRef.validate(async (valid) => {
        if (valid) {
          await executeSave()
        }
      })
    }
  }

  /**
   * 打开保存Pipeline对话框
   */
  const openSavePipelineDialog = () => {
    pipelineForm.name = 'Pipeline_' + new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    pipelineForm.description = '自定义Pipeline配置'
    pipelineForm.template_type = "customized"
    savePipelineDialogVisible.value = true
  }

  /**
   * 保存Pipeline模板
   */
  const savePipelineTemplate = async (pipelineFormRef) => {
    if (!pipelineFormRef) return

    await pipelineFormRef.validate(async (valid) => {
      if (valid) {
        try {
          savePipelineLoading.value = true

          const pipelineData = buildPipelineData({
            nodes: nodes.value || [],
            edges: edges.value || [],
            name: pipelineForm.name,
            description: pipelineForm.description
          })

          console.log('保存Pipeline模板请求数据:', pipelineData)
          const result = await apiSavePipeline(pipelineData)
          console.log('保存Pipeline模板响应:', result)

          if (result.code === 0) {
            ElMessage.success('Pipeline模板保存成功！')
            savePipelineDialogVisible.value = false
          } else {
            ElMessage.error('保存Pipeline模板失败：' + (result.msg || '未知错误'))
          }
        } catch (error) {
          console.error('保存Pipeline模板出错:', error)
          ElMessage.error('保存Pipeline模板失败: ' + (error.message || '未知错误'))
        } finally {
          savePipelineLoading.value = false
        }
      }
    })
  }

  /**
   * 保存Pipeline入口函数
   */
  const savePipeline = () => {
    if (!nodes.value || nodes.value.length === 0) {
      ElMessage.error('当前Pipeline为空，请先配置至少一个节点')
      return
    }
    openSavePipelineDialog()
  }

  /**
   * 执行Pipeline
   */
  const handleExecutePipeline = async (validateRequiredFields) => {
    try {
      if (!nodes.value || nodes.value.length === 0 ||
          (nodes.value.length === 1 && nodes.value[0].type === "dataset")) {
        ElMessage.error('当前任务为空，请先配置至少一个算子')
        return
      }

      // 验证必填字段
      const emptyFields = validateRequiredFields()

      if (emptyFields.length > 0) {
        const formatFieldsList = (fields) => {
          return fields.map(field =>
            `• 算子 ${field.nodeName}\n : ${field.missingFields.join(', ')}`
          ).join('\n\n')
        }

        const message = `检测到以下节点存在空字段：\n\n${formatFieldsList(emptyFields)}\n\n是否继续执行任务？`

        try {
          await ElMessageBox.confirm(
            message,
            '字段为空提醒',
            {
              confirmButtonText: '继续执行',
              cancelButtonText: '取消',
              type: 'warning',
              customClass: 'apple-dialog field-validation-dialog',
              dangerouslyUseHTMLString: false,
            }
          )
        } catch (error) {
          return
        }
      }

      // 如果没有任务 ID，先弹出保存对话框
      if (!taskForm.task_id) {
        const pipelineData = buildPipelineData({
          nodes: nodes.value || [],
          edges: edges.value || [],
          name: taskForm.name,
          description: taskForm.description
        })
        taskForm.dataset_ids = pipelineData.dataset_ids || []
        taskForm.fromExecute = true
        saveDialogVisible.value = true
        return
      }
    } catch (error) {
      console.error('执行pipeline出错:', error)
      ElMessage.error('执行pipeline出错: ' + (error.message || '启动任务失败'))
    }
  }

  /**
   * 重置任务表单
   */
  const resetTaskForm = () => {
    taskForm.name = ''
    taskForm.description = ''
    taskForm.dataset_ids = []
    taskForm.task_id = ''
    taskForm.fromExecute = false
  }

  return {
    // State
    saveDialogVisible,
    savePipelineDialogVisible,
    saveLoading,
    savePipelineLoading,
    taskForm,
    pipelineForm,
    taskRules,
    pipelineRules,

    // Methods
    saveTask,
    savePipeline,
    savePipelineTemplate,
    openSavePipelineDialog,
    handleExecutePipeline,
    resetTaskForm,
  }
}
