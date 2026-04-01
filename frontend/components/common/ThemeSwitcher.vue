<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      class="flex items-center gap-2 rounded-xl border border-border/70 bg-card/80 px-3 py-2 text-sm text-muted-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:text-foreground hover:shadow-[0_14px_28px_hsl(var(--shadow-color)/0.08)]"
      :class="{ 'border-primary/30 bg-card text-foreground shadow-[0_14px_28px_hsl(var(--shadow-color)/0.08)]': isOpen }"
      @click="isOpen = !isOpen"
    >
      <PaletteIcon class="h-4 w-4" />
      <span class="hidden lg:inline">{{ t('header.theme.title') }}</span>
      <span class="hidden xl:inline text-xs text-muted-foreground">{{ currentThemeLabel }}</span>
      <ChevronDownIcon class="h-4 w-4 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
    </button>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-2"
    >
      <div v-if="isOpen" class="absolute right-0 z-50 mt-2 w-[320px] overflow-hidden rounded-[28px] border border-border/70 bg-popover/95 p-3 text-popover-foreground shadow-[0_24px_70px_hsl(var(--shadow-color)/0.18)] backdrop-blur-xl">
        <div class="mb-3 px-2">
          <p class="text-sm font-semibold text-foreground">{{ t('header.theme.menuTitle') }}</p>
          <p class="mt-1 text-xs leading-5 text-muted-foreground">{{ t('header.theme.menuDescription') }}</p>
        </div>

        <ThemePresetPanel />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, h, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ThemePresetPanel from '@/components/common/ThemePresetPanel.vue'
import { useTheme } from '@/composables/useTheme'

const rootRef = ref(null)
const isOpen = ref(false)

const { t } = useI18n()
const { currentThemeId, themeOptions } = useTheme()

const currentThemeLabel = computed(() => {
  const matchedTheme = themeOptions.find((theme) => theme.id === currentThemeId.value)
  return matchedTheme ? t(matchedTheme.labelKey) : ''
})

function handleClickOutside(event) {
  if (!rootRef.value?.contains(event.target)) {
    isOpen.value = false
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})

const PaletteIcon = () => h('svg', { class: 'h-4 w-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.8', d: 'M12 3c4.97 0 9 3.582 9 8 0 1.535-.949 2.5-2.5 2.5h-1.2a1.8 1.8 0 0 0-1.8 1.8c0 .993.807 1.8 1.8 1.8.939 0 1.7.761 1.7 1.7C19 20.985 15.866 22 12 22c-4.97 0-9-4.03-9-9s4.03-10 9-10Z' }),
  h('circle', { cx: '7.5', cy: '10.5', r: '1' }),
  h('circle', { cx: '10.5', cy: '7.5', r: '1' }),
  h('circle', { cx: '15.5', cy: '8.5', r: '1' }),
  h('circle', { cx: '16.5', cy: '13.5', r: '1' })
])

const ChevronDownIcon = () => h('svg', { class: 'h-4 w-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 9l-7 7-7-7' })
])
</script>
