import request from '@/utils/request'

const AUTH_BASE_URL = import.meta.env.VITE_APP_BASE_API || '/api'

function resolveAuthError(error) {
  if (error instanceof Error) {
    return error
  }

  const message =
    error?.error ||
    error?.msg ||
    error?.message ||
    error?.data?.error ||
    error?.data?.msg ||
    error?.data?.message ||
    error?.data?.detail ||
    '登录失败'

  return new Error(message)
}

export async function login(username, password) {
  try {
    const response = await request({
      baseURL: AUTH_BASE_URL,
      url: '/v1/login',
      method: 'post',
      skipRedirectOnBusinessError: true,
      data: {
        username,
        password
      }
    })

    if (response?.code !== 0) {
      throw new Error(response?.error || response?.msg || response?.message || '登录失败')
    }

    return response
  } catch (error) {
    throw resolveAuthError(error)
  }
}

export function logout() {
  return request({
    baseURL: AUTH_BASE_URL,
    url: '/v1/logout',
    method: 'post'
  })
}

export function refreshToken(refresh) {
  return request({
    baseURL: AUTH_BASE_URL,
    url: '/v1/refresh',
    method: 'post',
    data: {
      refresh
    }
  })
}

export function getCurrentUser() {
  return request({
    baseURL: AUTH_BASE_URL,
    url: '/v1/users/info',
    method: 'get'
  })
}
