import { computed, ref } from 'vue'
import { THEME_STORAGE_KEY, resolveThemeId, supportedThemeIds, themeOptions } from '@/config/themes'

const themePreference = ref('system')
const resolvedTheme = ref('light')
const isThemeReady = ref(false)
const isThemeTransitioning = ref(false)
const transitionTheme = ref('light')
const transitionSequence = ref(0)

let mediaQuery = null
let transitionTimerId = null

function canUseWindow() {
  return typeof window !== 'undefined'
}

function getSystemPrefersDark() {
  return canUseWindow() && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyResolvedTheme(themeId) {
  if (!canUseWindow()) {
    return
  }

  document.documentElement.dataset.theme = themeId
  document.documentElement.style.colorScheme = themeId === 'midnight' ? 'dark' : 'light'
  document.documentElement.classList.add('theme-ready')
}

function persistThemePreference() {
  if (!canUseWindow()) {
    return
  }

  localStorage.setItem(THEME_STORAGE_KEY, themePreference.value)
}

function finishTransition(delay = 1100) {
  if (transitionTimerId) {
    window.clearTimeout(transitionTimerId)
  }

  transitionTimerId = window.setTimeout(() => {
    isThemeTransitioning.value = false
  }, delay)
}

function runThemeTransition(nextResolvedTheme) {
  transitionTheme.value = nextResolvedTheme
  transitionSequence.value += 1
  isThemeTransitioning.value = true

  window.requestAnimationFrame(() => {
    resolvedTheme.value = nextResolvedTheme
    applyResolvedTheme(nextResolvedTheme)
  })

  finishTransition()
}

function updateResolvedTheme({ withTransition = false } = {}) {
  const nextResolvedTheme = resolveThemeId(themePreference.value, getSystemPrefersDark())

  if (withTransition && isThemeReady.value && nextResolvedTheme !== resolvedTheme.value) {
    runThemeTransition(nextResolvedTheme)
    return
  }

  resolvedTheme.value = nextResolvedTheme
  transitionTheme.value = nextResolvedTheme
  applyResolvedTheme(nextResolvedTheme)
}

function handleSystemThemeChange() {
  if (themePreference.value !== 'system') {
    return
  }

  updateResolvedTheme({ withTransition: isThemeReady.value })
}

export function useTheme() {
  function initializeTheme() {
    if (!canUseWindow()) {
      return
    }

    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)

    if (savedTheme && supportedThemeIds.includes(savedTheme)) {
      themePreference.value = savedTheme
    }

    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', handleSystemThemeChange)

    updateResolvedTheme()
    isThemeReady.value = true
  }

  function cleanupTheme() {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
      mediaQuery = null
    }

    if (transitionTimerId) {
      window.clearTimeout(transitionTimerId)
      transitionTimerId = null
    }
  }

  function setTheme(themeId, options = {}) {
    if (!supportedThemeIds.includes(themeId)) {
      return
    }

    themePreference.value = themeId
    persistThemePreference()
    updateResolvedTheme(options)
  }

  return {
    themeOptions,
    currentThemeId: computed(() => themePreference.value),
    resolvedThemeId: computed(() => resolvedTheme.value),
    isThemeReady: computed(() => isThemeReady.value),
    isThemeTransitioning: computed(() => isThemeTransitioning.value),
    transitionThemeId: computed(() => transitionTheme.value),
    transitionSequence: computed(() => transitionSequence.value),
    initializeTheme,
    cleanupTheme,
    setTheme
  }
}
