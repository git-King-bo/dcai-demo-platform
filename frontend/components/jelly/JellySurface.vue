<template>
  <component
    :is="as"
    class="jelly-surface"
    :class="[paddingClass, radiusClass, toneClass, elevated ? 'jelly-surface-elevated' : '', customClass]"
  >
    <div v-if="$slots.header" class="jelly-surface-header">
      <slot name="header" />
    </div>

    <div class="jelly-surface-body" :class="bodyClass">
      <slot />
    </div>

    <div v-if="$slots.footer" class="jelly-surface-footer">
      <slot name="footer" />
    </div>
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  as: { type: String, default: 'div' },
  padding: { type: String, default: 'md' },
  radius: { type: String, default: 'xl' },
  tone: { type: String, default: 'default' },
  elevated: { type: Boolean, default: false },
  bodyClass: { type: String, default: '' },
  customClass: { type: String, default: '' },
})

const paddingClass = computed(() => ({
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
  xl: 'p-8',
}[props.padding] || 'p-5'))

const radiusClass = computed(() => ({
  lg: 'rounded-[24px]',
  xl: 'rounded-[30px]',
  '2xl': 'rounded-[36px]',
  full: 'rounded-[999px]',
}[props.radius] || 'rounded-[30px]'))

const toneClass = computed(() => ({
  default: 'jelly-surface-default',
  soft: 'jelly-surface-soft',
  accent: 'jelly-surface-accent',
}[props.tone] || 'jelly-surface-default'))
</script>
