<template>
  <div class="space-y-2">
    <button
      v-for="theme in themeOptions"
      :key="theme.id"
      type="button"
      class="group w-full rounded-2xl border px-3 py-3 text-left transition-all duration-200"
      :class="theme.id === currentThemeId ? 'border-primary/40 bg-primary/10 shadow-[0_10px_30px_hsl(var(--primary)/0.18)]' : 'border-border/70 bg-card/70 hover:border-primary/20 hover:bg-card'"
      @click="setTheme(theme.id, { withTransition: true })"
    >
      <div class="flex items-start gap-3">
        <div class="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 shadow-sm" :style="themePreviewStyle(theme.preview)">
          <component :is="theme.id === currentThemeId ? CheckIcon : ThemeIcon(theme.id)" class="h-5 w-5 text-white" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <p class="text-sm font-semibold text-foreground">{{ t(theme.labelKey) }}</p>
            <span v-if="theme.id === currentThemeId" class="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              {{ t('header.theme.current') }}
            </span>
          </div>
          <p class="mt-1 text-xs leading-5 text-muted-foreground">{{ t(theme.descriptionKey) }}</p>
          <p v-if="theme.id === 'system'" class="mt-2 text-[11px] font-medium text-muted-foreground">
            {{ t('header.theme.systemHint', { theme: resolvedThemeLabel }) }}
          </p>
        </div>
      </div>
    </button>
  </div>
</template>

<script setup>
import { computed, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'

const { t } = useI18n()
const { currentThemeId, resolvedThemeId, setTheme, themeOptions } = useTheme()

const resolvedThemeLabel = computed(() => {
  const matchedTheme = themeOptions.find((theme) => theme.id === resolvedThemeId.value)
  return matchedTheme ? t(matchedTheme.labelKey) : ''
})

function themePreviewStyle(preview) {
  return {
    background: `linear-gradient(135deg, ${preview[0]} 0%, ${preview[1]} 50%, ${preview[2]} 100%)`
  }
}

const CheckIcon = () => h('svg', { class: 'h-5 w-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 13l4 4L19 7' })
])

function ThemeIcon(themeId) {
  if (themeId === 'midnight') {
    return () => h('svg', { class: 'h-5 w-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.8', d: 'M20 15.5A8.5 8.5 0 1 1 8.5 4a6.5 6.5 0 0 0 11.5 11.5Z' })
    ])
  }

  if (themeId === 'aurora') {
    return () => h('svg', { class: 'h-5 w-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.8', d: 'M4 15c2.5-4.5 5.5-6.75 9-6.75S19.5 10.5 22 15' }),
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.8', d: 'M3 19c2.2-2.6 4.65-3.9 7.35-3.9 2.25 0 4.42.86 6.5 2.58' }),
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.8', d: 'M8 6l.01 0M16 6l.01 0' })
    ])
  }

  if (themeId === 'system') {
    return () => h('svg', { class: 'h-5 w-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('rect', { x: '3', y: '4', width: '18', height: '12', rx: '2', 'stroke-width': '1.8' }),
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.8', d: 'M8 20h8M12 16v4' })
    ])
  }

  return () => h('svg', { class: 'h-5 w-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('circle', { cx: '12', cy: '12', r: '4', 'stroke-width': '1.8' }),
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.8', d: 'M12 3v2.5M12 18.5V21M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M3 12h2.5M18.5 12H21M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77' })
  ])
}
</script>
