import request from '@/utils/request';

// 获取算子
export function fetchLibOperators() {
    return request({
        url: '/v2/operators/',
        method: 'get',
        params: {
          page: 1,
          page_size: 1000
        }
    });
}

/**
 * 创建 Agent 会话
 * @param {Object} params - 会话参数
 * @param {string} params.user_id - 用户ID
 * @param {string} params.conversion_id - 会话ID
 * @param {string} params.title - 会话标题
 * @param {Array} params.content - 会话内容数组
 * @returns {Promise}
 */
export function createConversation(params) {
	return request({
		url: '/v1/df-conversation/create',
		method: 'post',
		data: params
	});
}

/**
 * 获取 Agent 会话列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 * @returns {Promise}
 */
export function getConversationList(params) {
	return request({
		url: '/v1/df-conversation/list',
		method: 'get',
		params
	});
}

/**
 * 获取 Agent 会话详情
 * @param {Object} params - 查询参数
 * @param {string} params.id - 会话ID
 * @returns {Promise}
 */
export function getConversationDetail(params) {
	return request({
		url: `/v1/df-conversation/${params.id}`,
		method: 'get'
	});
}

/**
 * 删除 Agent 会话
 * @param {Object} params - 删除参数
 * @param {string} params.id - 会话ID
 * @returns {Promise}
 */
export function deleteConversation(params) {
	return request({
		url: `/v1/df-conversation/${params.id}`,
		method: 'delete'
	});
}

export function queryDataset(params) {

  return request({
    url: '/v1/third-party/kps/query-dataset',
    method: 'post',
    data: params
  })
}
export function getList(params) {

  return request({
    url: '/v2/dataset',
    method: 'get',
    params
  })
}

export function getDetail(params) {
  return request({
    url: `/v1/dataset/${params.id}`,
    method: 'get'
  })
}

export function create(params) {
  return request({
    url: '/v1/dataset',
    method: 'post',
    data: params
  })
}

export function update(params) {
  const { name, description } = params
  return request({
    url: `/v1/dataset/${params.id}`,
    method: 'put',
    data: { name, description }
  })
}

export function del(params) {
  return request({
    url: `/v1/dataset/${params.id}`,
    method: 'delete'
  })
}

export function getPresignedUrl(params) {
  return request({
    url: '/v1/presigned-url',
    method: 'post',
    data: params
  })
}


export function getDatasetData(params) {
  const { id, page, size } = params
  return request({
    url: `/v1/dataset/${id}/files`,
    method: 'get',
    params: {
      page_size: size,
      page_num: page,
      list_type: 'all'
    }
  })
}

export function deleteDatasetData(params) {
  const { id, file_id } = params
  return request({
    url: `/v1/dataset/${id}/files/${file_id}`,
    method: 'delete'
  })
}

export function addDatasetFile(params) {
  const { id, files } = params
  return request({
    url: `/v1/dataset/${id}/files`,
    method: 'post',
    data: {
      files: files.map(file => ({
        name: file.file_name,
        description: '数据集文件',
        path: file.object_path,
        mime_type: file.mime_type,
        size: file.size,
        file_metadata: {
          file_type: file.file_metadata?.file_type || file.file_name.split('.').pop().toLowerCase(),
          page_count: file.file_metadata?.page_count || null,
          upload_time: file.file_metadata?.upload_time || new Date().toISOString().replace('T', ' ').split('.')[0]
        }
      }))
    }
  })
}

export function getFileDownloadUrl(params) {
  const { object_path } = params
  return request({
    url: '/v1/dataset/file/url',
    method: 'get',
    params: {
      object_path
    }
  })
}

// 获取数据集统计信息
export function getStatistics() {
  // Mock 数据
  const mockData = {
    code: 0,
    data: {
      totalDatasets: 12,
      totalSize: '12457',
      avgScore: 91,
      activeDatasets: 3
    }
  }
  
  // 使用 Promise 模拟异步请求
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData)
    }, 300)
  })
}