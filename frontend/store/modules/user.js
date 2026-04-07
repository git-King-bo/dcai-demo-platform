import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi } from '@/api/auth'

const STORAGE_KEYS = {
  token: 'token',
  refreshToken: 'refreshToken',
  userInfo: 'user_info',
  user: 'user',
  rememberMe: 'rememberMe',
  idToken: 'idToken'
}

function getStorage(type) {
  if (typeof window === 'undefined') {
    return null
  }

  return type === 'local' ? window.localStorage : window.sessionStorage
}

function readStoredValue(key) {
  const localStorageRef = getStorage('local')
  const sessionStorageRef = getStorage('session')

  return localStorageRef?.getItem(key) || sessionStorageRef?.getItem(key) || ''
}

function readStoredUser() {
  const rawUser = readStoredValue(STORAGE_KEYS.userInfo) || readStoredValue(STORAGE_KEYS.user)
  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    return null
  }
}

function clearStoredAuth() {
  const storages = [getStorage('local'), getStorage('session')].filter(Boolean)

  storages.forEach((storage) => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      storage.removeItem(key)
    })
  })
}

function persistAuth({ accessToken, refreshToken, userInfo, rememberMe }) {
  clearStoredAuth()

  const storage = getStorage(rememberMe ? 'local' : 'session')
  if (!storage) {
    return
  }

  const serializedUser = JSON.stringify(userInfo)
  storage.setItem(STORAGE_KEYS.token, accessToken)
  storage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
  storage.setItem(STORAGE_KEYS.userInfo, serializedUser)
  storage.setItem(STORAGE_KEYS.user, serializedUser)
  storage.setItem(STORAGE_KEYS.rememberMe, String(rememberMe))
}

function normalizeUserName(userInfo) {
  if (!userInfo) {
    return ''
  }

  return userInfo.nickname || userInfo.name || userInfo.username || userInfo.email || ''
}

export const useUserStore = defineStore('user', {
  state: () => ({
    accessToken: readStoredValue(STORAGE_KEYS.token),
    refreshToken: readStoredValue(STORAGE_KEYS.refreshToken),
    userInfo: readStoredUser(),
    rememberMe: readStoredValue(STORAGE_KEYS.rememberMe) === 'true'
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken),
    userName: (state) => normalizeUserName(state.userInfo),
    userEmail: (state) => state.userInfo?.email || '',
    userId: (state) => state.userInfo?.id || ''
  },

  actions: {
    setAuthState({ accessToken, refreshToken, userInfo, rememberMe = false }) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
      this.userInfo = userInfo
      this.rememberMe = rememberMe

      persistAuth({ accessToken, refreshToken, userInfo, rememberMe })
    },

    clearAuthState() {
      this.accessToken = ''
      this.refreshToken = ''
      this.userInfo = null
      this.rememberMe = false

      clearStoredAuth()
    },

    async login({ username, password, rememberMe = false }) {
      try {
        const response = await loginApi(username, password)
        const { token, refresh, user } = response || {}

        this.setAuthState({
          accessToken: token,
          refreshToken: refresh,
          userInfo: user,
          rememberMe
        })

        return user
      } catch (error) {
        this.clearAuthState()
        throw error
      }
    },

    async logout({ silent = false } = {}) {
      if (!silent && this.accessToken) {
        try {
          await logoutApi()
        } catch {
          // Ignore logout API failures and still clear local auth state.
        }
      }

      this.clearAuthState()
    }
  }
})
