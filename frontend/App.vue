<template>
  <div v-if="usesBlankLayout" class="min-h-screen bg-slate-50">
    <router-view />
  </div>

  <div v-else class="min-h-screen flex bg-slate-50">
    <NavBar />

    <main
      class="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out"
      :class="sidebarCollapsed ? 'ml-16' : 'ml-60'"
    >
      <AppHeader />

      <div class="flex-1 p-6">
        <router-view />
      </div>

      <AppFooter />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/layout/NavBar.vue'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'

const sidebarCollapsed = ref(false)
const route = useRoute()

const usesBlankLayout = computed(() => route.meta.layout === 'blank')

function handleSidebarToggle(e) {
  sidebarCollapsed.value = e.detail.collapsed
}

onMounted(() => {
  window.addEventListener('sidebar-toggle', handleSidebarToggle)
})

onUnmounted(() => {
  window.removeEventListener('sidebar-toggle', handleSidebarToggle)
})
</script>
