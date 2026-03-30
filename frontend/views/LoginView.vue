<template>
  <AnimatedLoginView @auth-success="handleAuthSuccess" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import AnimatedLoginView from '@/components/loginView/AnimatedLoginView.vue'

const router = useRouter()

function handleAuthSuccess(event) {
  if (event?.mode === 'login') {
    router.push('/')
  }
}
</script>
