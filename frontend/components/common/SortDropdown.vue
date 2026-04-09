<template>
  <div class="relative">
    <button
      type="button"
      @click="open = !open"
      class="sort-dropdown__trigger"
    >
      <span class="truncate">Sort: {{ currentLabel }}</span>
      <svg class="h-4 w-4 shrink-0 transition-transform duration-200" :class="open ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>
    <div
      v-if="open"
      class="sort-dropdown__panel"
    >
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        @click="select(opt.value)"
        class="sort-dropdown__option"
        :class="modelValue === opt.value ? 'sort-dropdown__option--active' : ''"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, required: true },
  options: { type: Array, required: true }
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const currentLabel = computed(() => {
  const opt = props.options.find(o => o.value === props.modelValue)
  return opt ? opt.label : ''
})

function select(val) {
  emit('update:modelValue', val)
  open.value = false
}
</script>

<style scoped>
.sort-dropdown__trigger {
  display: inline-flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  border: 1px solid hsl(var(--glass-highlight) / 0.16);
  border-radius: 18px;
  padding: 0.7rem 0.9rem;
  background:
    linear-gradient(180deg, hsl(var(--glass-highlight) / 0.14), transparent 72%),
    linear-gradient(135deg, hsl(var(--card) / 0.78), hsl(var(--card) / 0.56));
  color: hsl(var(--foreground) / 0.68);
  font-size: 0.875rem;
  font-weight: 500;
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  box-shadow:
    inset 0 1px 0 hsl(var(--glass-highlight) / 0.34),
    0 12px 30px hsl(var(--glass-shadow) / 0.06);
  transition: border-color 180ms ease, background-color 180ms ease, color 180ms ease;
}

.sort-dropdown__trigger:hover {
  border-color: hsl(var(--glass-highlight) / 0.26);
  color: hsl(var(--foreground) / 0.92);
}

.sort-dropdown__panel {
  position: absolute;
  right: 0;
  z-index: 30;
  margin-top: 0.5rem;
  width: 12rem;
  border: 1px solid hsl(var(--glass-highlight) / 0.18);
  border-radius: 20px;
  padding: 0.35rem;
  background:
    linear-gradient(180deg, hsl(var(--glass-highlight) / 0.16), transparent 72%),
    linear-gradient(135deg, hsl(var(--popover) / 0.92), hsl(var(--card) / 0.7));
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  box-shadow:
    inset 0 1px 0 hsl(var(--glass-highlight) / 0.36),
    0 20px 42px hsl(var(--glass-shadow) / 0.1);
}

.sort-dropdown__option {
  display: block;
  width: 100%;
  border-radius: 14px;
  padding: 0.7rem 0.8rem;
  text-align: left;
  font-size: 0.875rem;
  color: hsl(var(--foreground) / 0.68);
  transition: background-color 160ms ease, color 160ms ease;
}

.sort-dropdown__option:hover,
.sort-dropdown__option--active {
  background: hsl(var(--glass-highlight) / 0.14);
  color: hsl(var(--foreground) / 1);
}
</style>
