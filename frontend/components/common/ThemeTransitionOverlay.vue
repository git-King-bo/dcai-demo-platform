<template>
  <Transition
    enter-active-class="transition-opacity duration-150 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="active" :key="transitionKey" class="pointer-events-none fixed inset-0 z-[120] overflow-hidden">
      <div class="theme-transition-scrim absolute inset-0" :style="overlayVars" />
      <div class="theme-transition-orb theme-transition-orb-left" :style="overlayVars" />
      <div class="theme-transition-orb theme-transition-orb-right" :style="overlayVars" />
      <div class="theme-transition-ring" :style="overlayVars" />
      <div class="theme-transition-sheen" :style="overlayVars" />

      <div class="absolute inset-x-0 top-10 flex justify-center px-4">
        <div class="rounded-full border border-white/15 bg-slate-950/35 px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-[0_18px_40px_rgba(15,23,42,0.3)] backdrop-blur-xl">
          {{ t('header.theme.transitioningTo', { theme: t(themeMeta.labelKey) }) }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { themeOptions } from '@/config/themes'

const props = defineProps({
  active: { type: Boolean, default: false },
  themeId: { type: String, default: 'light' },
  transitionKey: { type: Number, default: 0 }
})

const { t } = useI18n()

const themeMeta = computed(() => {
  return themeOptions.find((theme) => theme.id === props.themeId) || themeOptions.find((theme) => theme.id === 'light')
})

const overlayVars = computed(() => ({
  '--theme-a': themeMeta.value.preview[0],
  '--theme-b': themeMeta.value.preview[1],
  '--theme-c': themeMeta.value.preview[2]
}))
</script>

<style scoped>
.theme-transition-scrim {
  background:
    radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--theme-b) 90%, transparent) 0%, transparent 34%),
    radial-gradient(circle at 78% 18%, color-mix(in srgb, var(--theme-c) 88%, transparent) 0%, transparent 28%),
    linear-gradient(135deg, color-mix(in srgb, var(--theme-a) 80%, rgba(15, 23, 42, 0.78)) 0%, color-mix(in srgb, var(--theme-b) 76%, rgba(15, 23, 42, 0.8)) 48%, color-mix(in srgb, var(--theme-c) 74%, rgba(15, 23, 42, 0.85)) 100%);
  animation: themeBurst 950ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.theme-transition-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(22px);
  mix-blend-mode: screen;
  opacity: 0.78;
}

.theme-transition-orb-left {
  left: -8%;
  top: 18%;
  height: 18rem;
  width: 18rem;
  background: radial-gradient(circle, color-mix(in srgb, var(--theme-b) 80%, white) 0%, transparent 68%);
  animation: driftLeft 1050ms ease-out both;
}

.theme-transition-orb-right {
  right: -10%;
  bottom: 8%;
  height: 20rem;
  width: 20rem;
  background: radial-gradient(circle, color-mix(in srgb, var(--theme-c) 78%, white) 0%, transparent 68%);
  animation: driftRight 1050ms ease-out both;
}

.theme-transition-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  height: 12rem;
  width: 12rem;
  border-radius: 9999px;
  border: 1px solid color-mix(in srgb, var(--theme-a) 55%, white);
  box-shadow:
    0 0 0 12px color-mix(in srgb, var(--theme-b) 10%, transparent),
    0 0 0 32px color-mix(in srgb, var(--theme-c) 8%, transparent);
  transform: translate(-50%, -50%) scale(0.3);
  animation: expandRing 1000ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.theme-transition-sheen {
  position: absolute;
  inset: -20%;
  background: linear-gradient(110deg, transparent 35%, rgba(255, 255, 255, 0.42) 48%, transparent 61%);
  opacity: 0;
  transform: translateX(-30%) rotate(-8deg);
  animation: themeSheen 900ms ease-out 130ms both;
}

@keyframes themeBurst {
  0% {
    opacity: 0;
    clip-path: circle(0% at 50% 50%);
  }
  15% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    clip-path: circle(115% at 50% 50%);
  }
}

@keyframes expandRing {
  0% {
    opacity: 0.9;
    transform: translate(-50%, -50%) scale(0.2);
  }
  70% {
    opacity: 0.88;
    transform: translate(-50%, -50%) scale(2.8);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(3.4);
  }
}

@keyframes driftLeft {
  0% {
    transform: translate3d(-18%, 10%, 0) scale(0.82);
    opacity: 0;
  }
  30% {
    opacity: 0.8;
  }
  100% {
    transform: translate3d(24%, -18%, 0) scale(1.18);
    opacity: 0;
  }
}

@keyframes driftRight {
  0% {
    transform: translate3d(18%, 12%, 0) scale(0.9);
    opacity: 0;
  }
  28% {
    opacity: 0.75;
  }
  100% {
    transform: translate3d(-26%, -20%, 0) scale(1.14);
    opacity: 0;
  }
}

@keyframes themeSheen {
  0% {
    opacity: 0;
    transform: translateX(-34%) rotate(-8deg);
  }
  25% {
    opacity: 0.65;
  }
  100% {
    opacity: 0;
    transform: translateX(42%) rotate(-8deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .theme-transition-scrim,
  .theme-transition-orb-left,
  .theme-transition-orb-right,
  .theme-transition-ring,
  .theme-transition-sheen {
    animation-duration: 1ms;
  }
}
</style>
