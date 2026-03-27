<template>
  <div
    ref="pupilRef"
    class="rounded-full"
    :style="pupilStyle"
  />
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  size: { type: Number, default: 12 },
  maxDistance: { type: Number, default: 5 },
  pupilColor: { type: String, default: '#000000' },
  forceLookX: { type: Number, default: null },
  forceLookY: { type: Number, default: null }
})

const pupilRef = ref(null)
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

  if (!pupilRef.value) {
    return { x: 0, y: 0 }
  }

  const rect = pupilRef.value.getBoundingClientRect()
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

const pupilStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
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
