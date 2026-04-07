import request from '@/utils/request';

// 获取系统配置列表
export function getSystemSettings(params) {
  return request({
    url: '/v1/system-config/search',
    method: 'post',
    params: params
  })
}

export function saveSystemConfig(data) {
  return request({
    url: '/v1/system-config',
    method: 'post',
    data
  })
}

// 添加删除配置接口
export function deleteSystemConfig(id) {
  return request({
    url: `/v1/system-config/${id}`,
    method: 'delete'
  })
}
