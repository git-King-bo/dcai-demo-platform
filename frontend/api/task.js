import request from '@/utils/request'
// 文件执行加塞
export function playTaskRecord(recordId) {
  return request({
    url: `v2/task/record/${recordId}/play`,
    method: 'get',
  });
}
// 文件重试
export function retryTaskRecord(recordId) {
  return request({
    url: `v2/task/record/${recordId}/retry`,
    method: 'get',
  });
}
//任务进度明细
export function fetchTaskRecordDetailsSimple(recordObj) {
  return request({
    url: `/v2/task/record_detail_simple?task_id=${recordObj.taskId}&page_num=${recordObj.pageNum}&page_size=${recordObj.pageSize}&status=${recordObj.status}`,
    method: 'get',
  });
}
// ai ready相关接口
export function evaluatePipeline( pipelineData) {
  return request({
    url: `/v1/pipelines/evaluate`,
    method: 'post',
    data: pipelineData
  });
}
// 任务相关接口
export function restartPipeline(taskId) {
  return request({
    url: `/v1/task/${taskId}/restart`,
    method: 'post'
  });
}
// 实时更新
export function getTaskNewly(taskObj,options={}) {
  return request({
    url: `/v1/task/${taskObj.taskId}/newly?t=${taskObj.time}`,
    method: 'get',
    ...options
  });
}
// 开始/启动任务
export function executePipeline(taskId, pipelineData) {

  return request({
    url: `/v1/task/${taskId}/start`,
    method: 'post',
    data: pipelineData
  });
}

// 停止任务
export function stopPipeline(taskId) {
  return request({
    url: `/v1/task/${taskId}/stop`,
    method: 'post'
  });
}

// 继续任务
export function continueResume(taskId, pipelineData) {
  return request({
    url: `/v1/task/${taskId}/resume`,
    method: 'post',
    data: pipelineData
  });
}

// 获取真实任务详情
export function getTaskDetail(id) {
  return request({
    url: `/v1/task/${id}`,
    method: 'get'
  });
}

// 创建任务
export function createTask(data) {
  // 如果 template_id 是字符串且以 "simple" 开头，设置为 -1
  let templateId = data.template_id;
  if (typeof templateId === 'string' && templateId.startsWith('simple')) {
    templateId = -1;
  }

  return request({
    url: '/v1/task',
    method: 'post',
    data: {
      name: data.name,
      description: data.description,
      task_type: data.task_type,
      dataset_ids: data.dataset_ids,
      template_id: templateId,
      pipeline_config: data.pipeline_config,
      schedule_config: data.execution,
      notification: data.notification,
      extend_rules: data.cleanRules
    }
  })
}

// 删除任务
// export function deleteTask(id) {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       const index = mockTasks.findIndex(t => t.id === id)
//       if (index > -1) {
//         mockTasks.splice(index, 1)
//       }
//       resolve({
//         code: 200,
//         data: { success: true }
//       })
//     }, 300)
//   })
// }


// 保存任务
export function saveTask(params) {
  return request({
    url: '/v2/task/create_and_play',
    method: 'post',
    data: params
  });
}
// 删除任务
export function deleteTask(task_id) {
  return request({
    url: `/v1/task/${task_id}`,
    method: 'delete'
  });
}

// 获取真实任务列表
export async function fetchTaskList({ pageNum = 1, pageSize = 30, keyword = '', status = '', datasetId = '' } = {}) {
  return request({
    url: '/v1/task',
    method: 'get',
    params: {
      page_size: pageSize,
      page_num: pageNum,
      keyword: keyword,
      status: status,
      dataset_id: datasetId
    }
  });
}


export function getBestTemplateList({ pageNum = 1, pageSize = 100 } = {}) {
  return request({
    url: '/v1/templates',
    method: 'get',
    params: {
      page_size: pageSize,
      page_num: pageNum
    }
  });
}
// 删除模板
export function deleteTemplate(id) {
  return request({
    url: `/v1/templates/${id}`,
    method: 'delete'
  });
}

// 获取模板详情
export function getTemplateDetail(id) {
  return request({
    url: `/v1/templates/${id}`,
    method: 'get'
  });
}


// 获取任务结果下载URL
export function getTaskResultDownloadUrl(parentPipelineId, pipelineId, params) {
  return request({
    url: `/v1/pipelines/${parentPipelineId}/subtasks/${pipelineId}/result/download`,
    method: 'post',
    data: params
  });
}

export function updatePipelinePriority(taskId, newPriority) {
  return request({
    url: `/v1/task/${taskId}/priority`,
    method: 'post',
    data: {
      priority: newPriority
    }
  });
}

// 查询特定算子的数据集结果
export function queryPipelineResults(params) {
  const requestData = {
    pipeline_id: params.pipeline_id,
    stage: params.stage,
    page: params.page || 1,
    page_size: params.page_size || 100
  };

  // 如果提供了 parent_pipeline_id，则添加到请求中
  if (params.parent_pipeline_id) {
    requestData.parent_pipeline_id = params.parent_pipeline_id;
  }

  return request({
    url: '/v2/pipelines/results/query',
    method: 'post',
    data: requestData
  });
}

// 获取子任务详情
export function getSubTaskDetail(parentPipelineId, pipelineId, params = {}) {
  return request({
    url: `/v1/pipelines/${parentPipelineId}/subtasks/${pipelineId}`,
    method: 'get',
    params: params
  });
}

// 下载流水线结果
export function downloadPipelineResult(pipelineId, params) {
  return request({
    url: `/v1/pipelines/${pipelineId}/result/download`,
    method: 'post',
    data: {
      stage: params.stage
    }
  });
}

// 获取模型训练日志
export function getTrainingLogs(pipelineId, params = {}) {
  return request({
    url: `/v1/train/${pipelineId}/logs/steps`,
    method: 'get',
    params: {
      start_step: params.start_step,
      end_step: params.end_step
    }
  });
}

// 保存pipeline模板
export function savePipeline(data) {
  return request({
    url: '/v1/templates',
    method: 'post',
    data: data
  });
}


