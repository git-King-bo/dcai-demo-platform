<template>
  <div class="flex items-center justify-center space-x-1 mt-6">
    <button
      @click="$emit('update:modelValue', modelValue - 1)"
      :disabled="modelValue <= 1"
      class="rounded-2xl border border-border/70 bg-card/72 px-3 py-1.5 text-sm text-foreground/78 shadow-[inset_0_1px_0_hsl(var(--glass-highlight)/0.24)] transition hover:border-primary/25 hover:bg-card hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
    >
      Previous
    </button>
    <button
      v-for="page in visiblePages"
      :key="page"
      @click="$emit('update:modelValue', page)"
      class="rounded-2xl border px-3 py-1.5 text-sm transition"
      :class="page === modelValue
        ? 'border-primary/35 bg-primary text-primary-foreground font-medium shadow-[0_14px_28px_hsl(var(--primary)/0.22)]'
        : 'border-border/70 bg-card/72 text-foreground/78 shadow-[inset_0_1px_0_hsl(var(--glass-highlight)/0.24)] hover:border-primary/25 hover:bg-card hover:text-foreground'"
    >
      {{ page }}
    </button>
    <span v-if="totalPages > 7 && modelValue < totalPages - 2" class="px-2 text-muted-foreground">...</span>
    <button
      @click="$emit('update:modelValue', modelValue + 1)"
      :disabled="modelValue >= totalPages"
      class="rounded-2xl border border-border/70 bg-card/72 px-3 py-1.5 text-sm text-foreground/78 shadow-[inset_0_1px_0_hsl(var(--glass-highlight)/0.24)] transition hover:border-primary/25 hover:bg-card hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
    >
      Next
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 1 },
  totalPages: { type: Number, required: true }
})
defineEmits(['update:modelValue'])

const visiblePages = computed(() => {
  const pages = []
  const total = props.totalPages
  const current = props.modelValue
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)
  start = Math.max(1, end - 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
</script>
