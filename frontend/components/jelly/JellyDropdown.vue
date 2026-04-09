<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      class="jelly-dropdown-trigger"
      :class="[block ? 'w-full' : '', resolvedUi.triggerClass]"
      @click="toggleOpen"
    >
      <slot name="trigger" :open="isOpen" :selected-option="selectedOption">
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <div class="flex min-w-0 flex-1 flex-col text-left">
            <span class="truncate text-sm font-semibold text-foreground">
              {{ selectedOption ? selectedOption.label : placeholder }}
            </span>
            <span v-if="selectedOption?.description" class="truncate text-xs text-muted-foreground">
              {{ selectedOption.description }}
            </span>
          </div>
        </div>
        <svg
          class="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-500"
          :class="isOpen ? 'rotate-180' : ''"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.9"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </slot>
    </button>

    <Transition name="brake-pop">
      <div
        v-if="isOpen"
        class="jelly-dropdown-panel"
        :class="[resolvedUi.panelClass]"
        :style="resolvedUi.panelStyle"
      >
        <div
          :class="['space-y-2 overflow-y-auto', resolvedUi.listClass]"
          :style="resolvedUi.listStyle"
        >
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            class="jelly-dropdown-option"
            :class="[option.value === modelValue ? 'jelly-dropdown-option-active' : '', resolvedUi.optionClass]"
            @click="selectOption(option.value)"
          >
            <slot
              name="option"
              :option="option"
              :is-selected="option.value === modelValue"
            >
              <div class="flex min-w-0 flex-1 flex-col text-left">
                <span class="truncate text-sm font-semibold">{{ option.label }}</span>
                <span v-if="option.description" class="truncate text-xs text-muted-foreground">{{ option.description }}</span>
              </div>
            </slot>
          </button>
        </div>

        <div v-if="$slots.footer" class="mt-3 border-t border-white/15 pt-3">
          <slot name="footer" :close="close" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: { type: String, default: 'Select an option' },
  block: { type: Boolean, default: true },
  closeOnSelect: { type: Boolean, default: true },
  ui: {
    type: Object,
    default: () => ({}),
  },
  triggerClass: { type: String, default: '' },
  panelClass: { type: String, default: '' },
  panelStyle: { type: [String, Object, Array], default: '' },
  listClass: { type: String, default: '' },
  listStyle: { type: [String, Object, Array], default: '' },
  optionClass: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'change', 'open', 'close'])

const isOpen = ref(false)
const rootRef = ref(null)

const selectedOption = computed(() => props.options.find((option) => option.value === props.modelValue) || null)

const resolvedUi = computed(() => ({
  triggerClass: props.ui.triggerClass ?? props.triggerClass,
  panelClass: props.ui.panelClass ?? props.panelClass,
  panelStyle: props.ui.panelStyle ?? props.panelStyle,
  listClass: props.ui.listClass ?? props.listClass,
  listStyle: props.ui.listStyle ?? props.listStyle,
  optionClass: props.ui.optionClass ?? props.optionClass,
}))

function toggleOpen() {
  isOpen.value = !isOpen.value
  emit(isOpen.value ? 'open' : 'close')
}

function close() {
  if (!isOpen.value) {
    return
  }

  isOpen.value = false
  emit('close')
}

function selectOption(value) {
  emit('update:modelValue', value)
  emit('change', value)

  if (props.closeOnSelect) {
    close()
  }
}

function handleClickOutside(event) {
  if (!rootRef.value || rootRef.value.contains(event.target)) {
    return
  }

  close()
}

function handleEscape(event) {
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>
