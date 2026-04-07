import axios from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import router from '@/router'
import i18n from '@/i18n'
import jsonBig from 'json-bigint'
import requestManager from './requestManager'

// 后端接口基础地址。
const BASE_API = import.meta.env.VITE_APP_BASE_API
// 单个请求的超时时间，单位毫秒。
const REQUEST_TIMEOUT = 120000
// 这些业务码由上层或后端文案自行处理，这里不走通用错误提示。
const CUSTOM_MESSAGE_CODES = new Set([
  200,
  110005,
  130001,
  130003,
  140002,
  140003,
  110007,
  130006,
  130007,
  140001,
  510888
])
// 命中这些业务码时，统一跳回首页。
const REDIRECT_TO_INDEX_CODES = new Set([100002, 100003, 120003])
// 这些 HTTP 状态码代表登录态失效。
const AUTH_EXPIRED_STATUS = new Set([401, 403])
// 某些请求需要静默失败，不弹全局错误提示。
const IGNORE_ERROR_REQUEST_IDS = new Set(['taskNewly'])

// 下载过程中的全局 loading 实例。
let downloadLoadingInstance = null

// 统一处理响应体，优先使用 json-bigint 保留大整数精度。
function transformResponse(data) {
  try {
    return jsonBig.parse(data)
  } catch {
    return { data }
  }
}

// 获取全局国际化翻译函数。
function getTranslator() {
  return i18n?.global?.t?.bind(i18n.global)
}

// 将错误码翻译为可展示的文案，翻译缺失时使用兜底文案。
function translateError(code, fallback = 'Request failed') {
  const key = `${code}`
  const t = getTranslator()

  if (!t) {
    return fallback
  }

  // 如果翻译结果仍然是 key 本身，说明词条不存在，此时回退到默认文案。
  const translated = t(key)
  return translated && translated !== key ? translated : fallback
}

// 为请求分配分组，便于按页面或路由统一取消。
function getRouteGroupId() {
  return router.currentRoute.value?.name || requestManager.DEFAULT_GROUP
}

// 从当前地址栏读取邀请码参数。
function getInviteCode() {
  if (typeof window === 'undefined') {
    return ''
  }

  return new URLSearchParams(window.location.search).get('i') || ''
}

// 清理本地登录态缓存。
function resetAuthState() {
  ;[localStorage, sessionStorage].forEach((storage) => {
    storage.removeItem('token')
    storage.removeItem('idToken')
    storage.removeItem('refreshToken')
    storage.removeItem('user')
    storage.removeItem('user_info')
    storage.removeItem('rememberMe')
  })
}

// 登录态失效后统一跳回登录入口。
function redirectToLogin() {
  resetAuthState()
  router.push('/login')
}

// 保证 axios 配置里始终存在 headers 对象。
function ensureHeaders(config) {
  config.headers = config.headers || {}
  return config.headers
}

// 优先从 localStorage 读取，没有时回退到 sessionStorage。
function getStoredAuthValue(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key)
}

// 将对象参数序列化为查询字符串片段，支持数组和嵌套对象。
function serializeParams(params, prefix = '') {
  return Object.entries(params).reduce((segments, [key, value]) => {
    if (value === undefined || value === null || value === '') {
      return segments
    }

    const paramKey = prefix ? `${prefix}[${key}]` : key

    if (Array.isArray(value)) {
      value.forEach((item) => {
        segments.push(`${encodeURIComponent(paramKey)}=${encodeURIComponent(item)}`)
      })
      return segments
    }

    if (Object.prototype.toString.call(value) === '[object Object]') {
      return segments.concat(serializeParams(value, paramKey))
    }

    segments.push(`${encodeURIComponent(paramKey)}=${encodeURIComponent(value)}`)
    return segments
  }, [])
}

// 将 GET 请求的 params 展开到 URL 上，保持与现有后端兼容。
function appendGetParams(config) {
  if (config.method !== 'get' || !config.params) {
    return config
  }

  const queryString = serializeParams(config.params).join('&')
  if (!queryString) {
    return config
  }

  const separator = config.url.includes('?') ? '&' : '?'
  config.url = `${config.url}${separator}${queryString}`
  config.params = {}
  return config
}

// 为请求补充 requestId、groupId，并注册取消方法。
function registerRequest(config) {
  if (!config.requestId) {
    config.requestId = requestManager.generateRequestId(config.url, {
      method: config.method,
      params: config.params,
      data: config.data
    })
  }

  if (!config.groupId) {
    config.groupId = getRouteGroupId()
  }

  config.cancelToken = new axios.CancelToken((cancel) => {
    requestManager.addRequest(config.requestId, cancel, config.groupId)
  })
}

// 根据当前登录态为请求附加鉴权头和邀请码头。
function applyAuthHeaders(config) {
  const headers = ensureHeaders(config)
  const token = getStoredAuthValue('token')
  const idToken = getStoredAuthValue('idToken')

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (config.baseURL === BASE_API && idToken) {
    headers.Authorization = idToken

    const inviteCode = getInviteCode()
    if (inviteCode) {
      headers['X-INVITE-CODE'] = inviteCode
    }
  }
}

// 请求完成或失败后，从请求管理器里移除当前请求。
function cleanupRequest(config) {
  if (config?.requestId) {
    requestManager.removeRequest(config.requestId)
  }
}

// 判断当前响应是否为二进制数据。
function isBinaryResponse(response) {
  return ['blob', 'arraybuffer'].includes(response?.request?.responseType)
}

// 统一处理 code !== 0 的业务异常。
function handleBusinessError(code, message, config = {}) {
  if (!CUSTOM_MESSAGE_CODES.has(code)) {
    ElMessage({
      message: translateError(code, message || 'Request failed'),
      type: 'error',
      grouping: true
    })
  }

  if (code === 510888 && message) {
    ElMessage({
      message,
      type: 'error',
      grouping: true
    })
  }

  // if (REDIRECT_TO_INDEX_CODES.has(code) && !config.skipRedirectOnBusinessError) {
  //   router.replace('/login')
  // }
}

// 处理登录态过期场景，返回值表示是否已接管错误处理。
function handleAuthError(status) {
  if (!AUTH_EXPIRED_STATUS.has(status)) {
    return false
  }

  redirectToLogin()
  return true
}

// 生成 HTTP 层的错误提示文案。
function resolveHttpErrorMessage(error, response) {
  if (error.code === 'ERR_NETWORK') {
    return translateError('ERR_NETWORK', 'Network error')
  }

  return translateError(response?.status || 500, response?.statusText || 'Request failed')
}

// 判断下载返回值是否为有效文件流而不是错误 JSON。
function isValidBlob(data) {
  return data instanceof Blob && data.type !== 'application/json'
}

// 统一的 axios 实例，负责基础配置与拦截器逻辑。
const service = axios.create({
  baseURL: BASE_API,
  timeout: REQUEST_TIMEOUT,
  transformResponse: [transformResponse]
})

// 请求拦截器：注册请求、补鉴权头、展开 GET 参数。
service.interceptors.request.use(
  (config) => {
    registerRequest(config)
    applyAuthHeaders(config)
    return appendGetParams(config)
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：处理业务成功、业务失败和 HTTP 异常。
service.interceptors.response.use(
  (response) => {
    cleanupRequest(response.config)

    if (isBinaryResponse(response)) {
      return response.data
    }

    const { code, message, msg } = response.data || {}
    const errorMessage = message || msg

    if (code !== 0) {
      handleBusinessError(code, errorMessage, response.config)
      return Promise.reject(response.data)
    }

    return response.data
  },
  (error) => {
    cleanupRequest(error.config)

    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    const { response } = error

    if (response) {
      if (handleAuthError(response.status)) {
        return Promise.reject(new Error('认证失败，请重新登录'))
      }

      if (IGNORE_ERROR_REQUEST_IDS.has(error.config?.requestId)) {
        return Promise.reject(response.data)
      }

      ElMessage({
        message: resolveHttpErrorMessage(error, response),
        type: 'error',
        duration: 2000,
        grouping: true
      })
    }

    return Promise.reject(response ? response.data : error)
  }
)

// 通用下载方法，返回 Blob 或在失败时抛出异常。
export async function download(url, params, filename, config = {}, showBackground = true) {
  if (showBackground) {
    downloadLoadingInstance = ElLoading.service({
      text: '正在下载数据，请稍候',
      background: 'rgba(0, 0, 0, 0.7)'
    })
  }

  try {
    const data = await service.post(url, params, {
      headers: {
        Authorization: getStoredAuthValue('idToken')
      },
      responseType: 'blob',
      ...config
    })

    if (isValidBlob(data)) {
      return data
    }

    const responseText = await data.text()
    const responseJson = JSON.parse(responseText)

    if (responseJson.message === '无效的token') {
      redirectToLogin()
      return null
    }

    ElMessage.error(responseJson.msg || responseJson.message || `${filename || '文件'}下载失败`)
    return null
  } catch (error) {
    return Promise.reject(error)
  } finally {
    downloadLoadingInstance?.close()
    downloadLoadingInstance = null
  }
}

// 取消单个请求。
export const cancelRequest = requestManager.cancelRequest.bind(requestManager)
// 取消某个分组下的所有请求。
export const cancelGroupRequests = requestManager.cancelGroupRequests.bind(requestManager)
// 取消当前应用内登记的全部请求。
export const cancelAllRequests = requestManager.cancelAllRequests.bind(requestManager)
// 获取当前仍在进行中的请求数量。
export const getRequestCount = requestManager.getRequestCount.bind(requestManager)

// 默认导出 axios 实例，供业务 API 模块直接复用。
export default service
