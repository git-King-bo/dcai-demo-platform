<template>
  <div class="space-y-3">
    <div v-for="group in groups" :key="group.label">
      <button
        @click="group.open = !group.open"
        class="flex w-full items-center justify-between rounded-2xl px-2 py-1.5 text-sm font-semibold text-foreground/78 transition-colors duration-200 hover:bg-white/8 hover:text-foreground"
      >
        {{ group.label }}
        <svg
          class="h-4 w-4 text-foreground/52 transition-transform duration-300"
          :class="{ 'rotate-180': group.open }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      <div v-show="group.open" class="scrollable mt-1 max-h-48 space-y-1 overflow-y-auto pr-1">
        <label
          v-for="option in group.options"
          :key="option.value"
          :class="[
            'flex cursor-pointer items-center gap-2 rounded-2xl border px-2.5 py-2 text-sm transition-all duration-200',
            isSelected(group.key, option.value)
              ? 'border-primary/25 bg-primary/12 text-foreground'
              : 'border-transparent text-foreground/68 hover:border-white/10 hover:bg-white/8 hover:text-foreground',
          ]"
        >
          <input
            type="checkbox"
            :checked="isSelected(group.key, option.value)"
            @change="toggle(group.key, option.value)"
            class="h-4 w-4 rounded border-border bg-card/70 text-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-0"
          />
          <span class="truncate">{{ option.label }}</span>
          <span
            v-if="option.count !== undefined"
            :class="[
              'ml-auto text-xs tabular-nums',
              isSelected(group.key, option.value) ? 'text-primary' : 'text-muted-foreground',
            ]"
          >
            {{ option.count }}
          </span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  filterGroups: { type: Array, required: true },
  selected: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:selected'])

const groups = reactive(
  props.filterGroups.map(g => ({ ...g, open: g.open !== false }))
)

function isSelected(key, value) {
  return (props.selected[key] || []).includes(value)
}

function toggle(key, value) {
  const current = [...(props.selected[key] || [])]
  const idx = current.indexOf(value)
  if (idx >= 0) current.splice(idx, 1)
  else current.push(value)
  emit('update:selected', { ...props.selected, [key]: current })
}
</script>
