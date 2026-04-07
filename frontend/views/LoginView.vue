<template>
  <AnimatedLoginView @auth-success="handleAuthSuccess" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import AnimatedLoginView from '@/components/loginView/AnimatedLoginView.vue'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

function handleAuthSuccess(event) {
  if (event?.mode === 'login' && userStore.isAuthenticated) {
    router.push('/')
  }
}
</script>
