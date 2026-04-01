export const THEME_STORAGE_KEY = 'theme-preference'

export const themeOptions = [
  {
    id: 'system',
    type: 'system',
    labelKey: 'header.theme.options.system.label',
    descriptionKey: 'header.theme.options.system.description',
    preview: ['#dbeafe', '#38bdf8', '#0f172a']
  },
  {
    id: 'light',
    type: 'theme',
    labelKey: 'header.theme.options.light.label',
    descriptionKey: 'header.theme.options.light.description',
    preview: ['#f8fbff', '#dbeafe', '#2563eb']
  },
  {
    id: 'midnight',
    type: 'theme',
    labelKey: 'header.theme.options.midnight.label',
    descriptionKey: 'header.theme.options.midnight.description',
    preview: ['#0f172a', '#164e63', '#8b5cf6']
  },
  {
    id: 'aurora',
    type: 'theme',
    labelKey: 'header.theme.options.aurora.label',
    descriptionKey: 'header.theme.options.aurora.description',
    preview: ['#ecfeff', '#14b8a6', '#fb923c']
  }
]

export const supportedThemeIds = themeOptions.map((theme) => theme.id)

export function resolveThemeId(themeId, prefersDark = false) {
  if (themeId === 'system') {
    return prefersDark ? 'midnight' : 'light'
  }

  return supportedThemeIds.includes(themeId) ? themeId : 'light'
}
