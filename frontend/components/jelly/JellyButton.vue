<template>
  <component
    :is="tag"
    class="jelly-button"
    :class="[variantClass, sizeClass, block ? 'w-full justify-center' : '', disabled ? 'opacity-60 pointer-events-none' : '', customClass]"
    :type="tag === 'button' ? type : undefined"
  >
    <span v-if="$slots.leading" class="jelly-button-icon">
      <slot name="leading" />
    </span>

    <span class="relative z-[1]">
      <slot />
    </span>

    <span v-if="$slots.trailing" class="jelly-button-icon">
      <slot name="trailing" />
    </span>
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tag: { type: String, default: 'button' },
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'default' },
  size: { type: String, default: 'md' },
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  customClass: { type: String, default: '' },
})

const variantClass = computed(() => ({
  default: 'jelly-button-default',
  primary: 'jelly-button-primary',
  ghost: 'jelly-button-ghost',
}[props.variant] || 'jelly-button-default'))

const sizeClass = computed(() => ({
  sm: 'px-3.5 py-2 text-sm rounded-[18px]',
  md: 'px-[18px] py-2.5 text-sm rounded-[20px]',
  lg: 'px-5 py-3 text-base rounded-[22px]',
}[props.size] || 'px-[18px] py-2.5 text-sm rounded-[20px]'))
</script>
