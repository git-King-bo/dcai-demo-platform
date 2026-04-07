<template>
  <div class="min-h-screen bg-background text-foreground">
    <ThemeTransitionOverlay
      :active="isThemeTransitioning"
      :theme-id="transitionThemeId"
      :transition-key="transitionSequence"
    />

    <div v-if="usesBlankLayout" class="min-h-screen bg-background">
      <router-view />
    </div>

    <div v-else class="min-h-screen flex bg-background">
      <NavBar />

      <main
        class="flex min-h-screen flex-1 flex-col transition-all duration-300 ease-in-out"
        :class="sidebarCollapsed ? 'ml-16' : 'ml-60'"
      >
        <AppHeader />

        <div class="flex-1">
          <router-view v-slot="{ Component, route: slotRoute }">
            <Transition name="fade-slide" mode="out-in">
              <keep-alive :include="keepInclude">
                <component :is="Component" :key="slotRoute.name || slotRoute.path" />
              </keep-alive>
            </Transition>
          </router-view>
        </div>

        <!-- <AppFooter /> -->
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, markRaw } from "vue";
import { useRoute } from "vue-router";
import ThemeTransitionOverlay from "./components/common/ThemeTransitionOverlay.vue";
import NavBar from "./components/layout/NavBar.vue";
import AppHeader from "./components/layout/AppHeader.vue";
import AppFooter from "./components/layout/AppFooter.vue";
import { useTheme } from "./composables/useTheme";

const sidebarCollapsed = ref(false);
const route = useRoute();
const keepInclude = markRaw([]);
const {
  cleanupTheme,
  initializeTheme,
  isThemeTransitioning,
  transitionSequence,
  transitionThemeId,
} = useTheme();

const usesBlankLayout = computed(() => route.meta.layout === "blank");

function handleSidebarToggle(e) {
  sidebarCollapsed.value = e.detail.collapsed;
}

onMounted(() => {
  initializeTheme();
  window.addEventListener("sidebar-toggle", handleSidebarToggle);
});

onUnmounted(() => {
  window.removeEventListener("sidebar-toggle", handleSidebarToggle);
  cleanupTheme();
});
</script>
<style scoped>
/* 淡入淡出 + 滑动效果 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
