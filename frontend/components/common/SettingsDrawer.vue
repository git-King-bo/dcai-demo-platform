<template>
  <Transition
    enter-active-class="transition-opacity duration-250 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="modelValue" class="fixed inset-0 z-[110]">
      <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" @click="closeDrawer" />

      <Transition
        enter-active-class="transform transition duration-300 ease-out"
        enter-from-class="translate-x-full opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transform transition duration-200 ease-in"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-full opacity-0"
      >
        <aside
          v-if="modelValue"
          class="absolute right-0 top-0 flex h-full w-full max-w-[430px] flex-col border-l border-border/70 bg-popover/96 shadow-[-24px_0_80px_hsl(var(--shadow-color)/0.18)] backdrop-blur-xl"
        >
          <div class="border-b border-border/70 px-6 py-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.26em] text-primary">{{ t('header.settingsDrawer.eyebrow') }}</p>
                <h2 class="mt-2 text-2xl font-semibold tracking-tight text-popover-foreground">{{ t('header.settingsDrawer.title') }}</h2>
                <p class="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{{ t('header.settingsDrawer.description') }}</p>
              </div>
              <button
                type="button"
                class="rounded-xl border border-border/70 bg-card/80 p-2 text-muted-foreground transition hover:bg-card hover:text-foreground"
                @click="closeDrawer"
              >
                <CloseIcon class="h-5 w-5" />
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-6">
            <section class="rounded-[28px] border border-border/70 bg-card/80 p-5 shadow-[0_18px_40px_hsl(var(--shadow-color)/0.08)]">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-lg font-semibold text-foreground">{{ t('header.settingsDrawer.appearanceTitle') }}</p>
                  <p class="mt-1 text-sm leading-6 text-muted-foreground">{{ t('header.settingsDrawer.appearanceDescription') }}</p>
                </div>
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <PaletteIcon class="h-6 w-6" />
                </div>
              </div>

              <div class="mt-5 rounded-[24px] border border-border/60 bg-[linear-gradient(135deg,hsl(var(--hero-from))_0%,hsl(var(--hero-via))_45%,hsl(var(--hero-to))_100%)] p-4 text-white shadow-[0_18px_38px_hsl(var(--shadow-color)/0.15)]">
                <p class="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/72">{{ t('header.settingsDrawer.livePreview') }}</p>
                <div class="mt-3 flex items-center gap-3">
                  <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 backdrop-blur-sm">
                    <SwatchIcon class="h-6 w-6" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-white">{{ currentThemeLabel }}</p>
                    <p class="mt-1 text-xs text-white/72">{{ t('header.settingsDrawer.livePreviewHint') }}</p>
                  </div>
                </div>
              </div>

              <div class="mt-5">
                <ThemePresetPanel />
              </div>
            </section>
          </div>
        </aside>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { computed, h, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ThemePresetPanel from '@/components/common/ThemePresetPanel.vue'
import { useTheme } from '@/composables/useTheme'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()
const { currentThemeId, themeOptions } = useTheme()

const currentThemeLabel = computed(() => {
  const matchedTheme = themeOptions.find((theme) => theme.id === currentThemeId.value)
  return matchedTheme ? t(matchedTheme.labelKey) : ''
})

function closeDrawer() {
  emit('update:modelValue', false)
}

function handleKeydown(event) {
  if (event.key === 'Escape' && props.modelValue) {
    closeDrawer()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

const CloseIcon = () => h('svg', { class: 'h-5 w-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M6 18 18 6M6 6l12 12' })
])

const PaletteIcon = () => h('svg', { class: 'h-6 w-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.8', d: 'M12 3c4.97 0 9 3.582 9 8 0 1.535-.949 2.5-2.5 2.5h-1.2a1.8 1.8 0 0 0-1.8 1.8c0 .993.807 1.8 1.8 1.8.939 0 1.7.761 1.7 1.7C19 20.985 15.866 22 12 22c-4.97 0-9-4.03-9-9s4.03-10 9-10Z' }),
  h('circle', { cx: '7.5', cy: '10.5', r: '1' }),
  h('circle', { cx: '10.5', cy: '7.5', r: '1' }),
  h('circle', { cx: '15.5', cy: '8.5', r: '1' }),
  h('circle', { cx: '16.5', cy: '13.5', r: '1' })
])

const SwatchIcon = () => h('svg', { class: 'h-6 w-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.8', d: 'M7 16a4 4 0 1 1 8 0c0 1.2-.53 2.28-1.36 3.01-.56.49-.96 1.13-.96 1.87V22H9.32v-1.12c0-.74-.4-1.38-.96-1.87A3.99 3.99 0 0 1 7 16Zm5-13v3m6.36 1.64-2.12 2.12M21 12h-3M5.76 5.76l2.12 2.12M3 12h3' })
])
</script>
