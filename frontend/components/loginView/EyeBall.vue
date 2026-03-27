<template>
  <div
    ref="eyeRef"
    class="rounded-full flex items-center justify-center transition-all duration-150"
    :style="eyeStyle"
  >
    <div
      v-if="!isBlinking"
      class="rounded-full"
      :style="pupilStyle"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  size: { type: Number, default: 48 },
  pupilSize: { type: Number, default: 16 },
  maxDistance: { type: Number, default: 10 },
  eyeColor: { type: String, default: '#ffffff' },
  pupilColor: { type: String, default: '#000000' },
  isBlinking: { type: Boolean, default: false },
  forceLookX: { type: Number, default: null },
  forceLookY: { type: Number, default: null }
})

const eyeRef = ref(null)
const mouseX = ref(0)
const mouseY = ref(0)

function handleMouseMove(event) {
  mouseX.value = event.clientX
  mouseY.value = event.clientY
}

const pupilPosition = computed(() => {
  if (props.forceLookX !== null && props.forceLookY !== null) {
    return { x: props.forceLookX, y: props.forceLookY }
  }

  if (!eyeRef.value) {
    return { x: 0, y: 0 }
  }

  const rect = eyeRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const deltaX = mouseX.value - centerX
  const deltaY = mouseY.value - centerY
  const distance = Math.min(Math.hypot(deltaX, deltaY), props.maxDistance)
  const angle = Math.atan2(deltaY, deltaX)

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance
  }
})

const eyeStyle = computed(() => ({
  width: `${props.size}px`,
  height: props.isBlinking ? '2px' : `${props.size}px`,
  backgroundColor: props.eyeColor,
  overflow: 'hidden'
}))

const pupilStyle = computed(() => ({
  width: `${props.pupilSize}px`,
  height: `${props.pupilSize}px`,
  backgroundColor: props.pupilColor,
  transform: `translate(${pupilPosition.value.x}px, ${pupilPosition.value.y}px)`,
  transition: 'transform 0.1s ease-out'
}))

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>
