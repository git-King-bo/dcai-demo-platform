<template>
  <Teleport to="body">
    <Transition name="brake-fade">
      <div
        v-if="isOverlayVisible"
        class="jelly-modal-overlay"
        @click="handleOverlayClick"
      >
        <Transition :name="transitionName" @after-leave="handleContentAfterLeave">
          <div
            v-if="isContentVisible"
            class="jelly-modal-shell"
            :class="[maxWidthClass, padded ? 'p-6 md:p-7' : '', customClass]"
            @click.stop
          >
            <div v-if="$slots.header || title || description" class="mb-5 flex items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <slot name="header">
                  <p v-if="eyebrow" class="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {{ eyebrow }}
                  </p>
                  <h3 v-if="title" class="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    {{ title }}
                  </h3>
                  <p v-if="description" class="mt-2 text-sm leading-6 text-muted-foreground">
                    {{ description }}
                  </p>
                </slot>
              </div>

              <slot name="close" :close="close">
                <button type="button" class="jelly-modal-close" @click="close">
                  ×
                </button>
              </slot>
            </div>

            <div class="relative z-[1]">
              <slot :close="close" />
            </div>

            <div v-if="$slots.footer" class="mt-6">
              <slot name="footer" :close="close" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  transitionName: { type: String, default: 'brake-sheet' },
  maxWidth: { type: String, default: 'xl' },
  padded: { type: Boolean, default: true },
  closeOnOverlay: { type: Boolean, default: true },
  closeOnEscape: { type: Boolean, default: true },
  customClass: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'open', 'close'])

const isOverlayVisible = ref(false)
const isContentVisible = ref(false)

const maxWidthClass = computed(() => ({
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
}[props.maxWidth] || 'max-w-xl'))

function close() {
  emit('update:modelValue', false)
  emit('close')
}

async function openModal() {
  isOverlayVisible.value = true
  await nextTick()
  requestAnimationFrame(() => {
    isContentVisible.value = true
  })
}

function hideModal() {
  isContentVisible.value = false
}

function handleContentAfterLeave() {
  if (!props.modelValue) {
    isOverlayVisible.value = false
  }
}

function handleOverlayClick() {
  if (props.closeOnOverlay) {
    close()
  }
}

function handleEscape(event) {
  if (props.modelValue && props.closeOnEscape && event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})

watch(
  () => props.modelValue,
  (isOpen, wasOpen) => {
    if (isOpen && !wasOpen) {
      openModal()
      emit('open')
      return
    }

    if (!isOpen && wasOpen) {
      hideModal()
    }
  },
  { immediate: true }
)
</script>
