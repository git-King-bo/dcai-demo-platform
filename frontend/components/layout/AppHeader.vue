<template>
  <header class="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/16 bg-[linear-gradient(180deg,hsl(var(--glass-highlight)/0.2),hsl(var(--glass-highlight)/0.06)),linear-gradient(180deg,hsl(var(--card)/0.72),hsl(var(--card)/0.48))] px-6 shadow-[0_24px_60px_hsl(var(--glass-shadow)/0.08)] backdrop-blur-[26px]">
    <!-- Left: Breadcrumb / Page Title -->
    <div class="flex items-center">
      <nav class="flex items-center text-sm">
        <router-link to="/" class="inline-flex h-10 w-10 items-center justify-center rounded-[18px] text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/12 hover:text-foreground">
          <HomeIcon class="w-5 h-5" />
        </router-link>
        <template v-if="pageTitle">
          <ChevronRightIcon class="mx-1 h-4 w-4 text-border-strong" />
          <span class="font-semibold tracking-tight text-foreground">{{ pageTitle }}</span>
        </template>
      </nav>
    </div>

    <!-- Center: Global Search -->
    <div class="flex-1 max-w-xl mx-8">
      <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon class="h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
        </div>
        <input
          type="text"
          :placeholder="t('header.searchPlaceholder')"
          class="w-full rounded-xl border border-border/70 bg-panel/80 py-2.5 pl-11 pr-12 text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
          @keydown.enter="handleSearch"
          v-model="searchQuery"
        />
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <kbd class="hidden items-center gap-0.5 rounded-[12px] border border-white/22 bg-white/18 px-2 py-1 text-[10px] font-semibold text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.46)] sm:flex">
            <span>⌘</span><span>K</span>
          </kbd>
        </div>
      </div>
    </div>

    <!-- Right: Actions & User -->
    <div class="flex items-center gap-2">
      <!-- New Button -->
      <button class="hidden items-center gap-2 rounded-[22px] border border-white/28 bg-[linear-gradient(180deg,hsl(var(--glass-highlight)/0.28),transparent_42%),linear-gradient(135deg,hsl(var(--theme-glow-a)/0.92),hsl(var(--theme-glow-b)/0.72),hsl(var(--theme-glow-c)/0.76))] px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_20px_42px_hsl(var(--theme-glow-a)/0.26)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_24px_48px_hsl(var(--theme-glow-a)/0.32)] sm:flex">
        <PlusIcon class="w-4 h-4" />
        <span>New</span>
      </button>

      <!-- Language Toggle -->
      <div class="relative">
        <button
          @click="showLanguageMenu = !showLanguageMenu"
          class="inline-flex h-11 w-11 items-center justify-center rounded-[20px] text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/12 hover:text-foreground"
          :class="{ 'bg-white/14 text-foreground': showLanguageMenu }"
        >
          <GlobeIcon class="w-5 h-5" />
        </button>

        <!-- Language Dropdown -->
        <Transition name="brake-pop">
          <div v-if="showLanguageMenu" class="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-[26px] border border-white/28 bg-[linear-gradient(180deg,hsl(var(--glass-highlight)/0.28),hsl(var(--glass-highlight)/0.08)),linear-gradient(180deg,hsl(var(--popover)/0.84),hsl(var(--card)/0.48))] py-2 shadow-[0_28px_70px_hsl(var(--glass-shadow)/0.18)] backdrop-blur-2xl">
            <button
              @click="setLanguage('zh')"
              class="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-[18px] px-4 py-2.5 text-sm transition-all duration-300"
              :class="currentLocale === 'zh' ? 'bg-white/24 text-primary font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]' : 'text-popover-foreground hover:bg-white/14 hover:text-primary'"
            >
              简体中文
            </button>
            <button
              @click="setLanguage('zh-Hant')"
              class="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-[18px] px-4 py-2.5 text-sm transition-all duration-300"
              :class="currentLocale === 'zh-Hant' ? 'bg-white/24 text-primary font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]' : 'text-popover-foreground hover:bg-white/14 hover:text-primary'"
            >
              繁體中文
            </button>
            <button
              @click="setLanguage('en')"
              class="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-[18px] px-4 py-2.5 text-sm transition-all duration-300"
              :class="currentLocale === 'en' ? 'bg-white/24 text-primary font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]' : 'text-popover-foreground hover:bg-white/14 hover:text-primary'"
            >
              English
            </button>
          </div>
        </Transition>
      </div>

      <!-- Credits Display -->
      <div class="flex items-center gap-2 rounded-xl border border-border/70 bg-panel/80 px-3 py-2">
      <CoinIcon class="w-5 h-5 text-blue-500" />
        <span class="text-sm font-semibold text-foreground">30</span>
      </div>

      <!-- Notifications -->
      <button class="bell-trigger relative inline-flex h-11 w-11 items-center justify-center rounded-[20px] text-muted-foreground transition-all duration-300 hover:bg-white/12 hover:text-foreground">
        <BellIcon class="bell-swing w-5 h-5" />
        <span class="absolute right-2.5 top-2 h-2 w-2 animate-pulse rounded-full bg-red-500 ring-2 ring-card"></span>
      </button>

      <!-- User Menu -->
      <div class="relative ml-1">
        <button
          @click="showUserMenu = !showUserMenu"
          class="group flex items-center gap-3 rounded-[24px] border border-white/20 bg-white/12 p-1.5 pr-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.46),0_16px_30px_hsl(var(--glass-shadow)/0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/18"
          :class="{ 'bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.56),0_20px_36px_hsl(var(--glass-shadow)/0.06)]': showUserMenu }"
        >
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(180deg,hsl(var(--glass-highlight)/0.22),transparent_40%),linear-gradient(135deg,hsl(var(--theme-glow-a)/0.9),hsl(var(--theme-glow-b)/0.75),hsl(var(--theme-glow-c)/0.7))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_18px_30px_hsl(var(--theme-glow-a)/0.18)] transition-shadow group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.84),0_22px_36px_hsl(var(--theme-glow-a)/0.24)]">
            <CrownIcon class="w-5 h-5" />
          </div>
          <div class="flex flex-col items-start">
            <span class="text-sm font-bold leading-tight text-foreground">{{ displayName }}</span>
            <span class="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">PRO MEMBER</span>
          </div>
          <ChevronDownIcon class="ml-1 w-4 h-4 text-muted-foreground transition-transform duration-200" :class="{ 'rotate-180': showUserMenu }" />
        </button>

        <!-- Dropdown -->
        <Transition name="brake-pop">
          <div v-if="showUserMenu" class="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-[28px] border border-white/28 bg-[linear-gradient(180deg,hsl(var(--glass-highlight)/0.28),hsl(var(--glass-highlight)/0.08)),linear-gradient(180deg,hsl(var(--popover)/0.84),hsl(var(--card)/0.48))] py-2 shadow-[0_28px_70px_hsl(var(--glass-shadow)/0.18)] backdrop-blur-2xl">
            <div class="border-b border-white/14 px-4 py-3">
              <p class="text-sm font-bold text-popover-foreground">{{ displayName }}</p>
              <p class="mt-0.5 text-xs text-muted-foreground">{{ displayEmail }}</p>
            </div>
            <div class="py-1">
              <a href="#" class="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-[18px] px-4 py-2.5 text-sm text-popover-foreground transition-all duration-300 hover:bg-white/14 hover:text-primary">
                <UserIcon class="w-4 h-4 text-muted-foreground" />
                {{ t('header.profile') }}
              </a>
              <button
                type="button"
                class="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-[18px] px-4 py-2.5 text-left text-sm text-popover-foreground transition-all duration-300 hover:bg-white/14 hover:text-primary"
                @click="openSettingsDrawer"
              >
                <CogIcon class="w-4 h-4 text-muted-foreground" />
                {{ t('header.settings') }}
              </button>
              <router-link to="/access-tokens" class="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-[18px] px-4 py-2.5 text-sm text-popover-foreground transition-all duration-300 hover:bg-white/14 hover:text-primary">
                <KeyIcon class="w-4 h-4 text-muted-foreground" />
                {{ t('header.accessTokens') }}
              </router-link>
              <router-link to="/mcp" class="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-[18px] px-4 py-2.5 text-sm text-popover-foreground transition-all duration-300 hover:bg-white/14 hover:text-primary">
                <SparklesIcon class="w-4 h-4 text-muted-foreground" />
                MCP
              </router-link>
            </div>
            <div class="mt-1 border-t border-white/14 pt-1" @click="logout">
              <a href="#" class="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-[18px] px-4 py-2.5 text-sm text-red-600 transition-all duration-300 hover:bg-red-50/70">
                <LogoutIcon class="w-4 h-4" />
                {{ t('header.logout') }}
              </a>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>

  <SettingsDrawer v-model="showSettingsDrawer" />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import SettingsDrawer from '@/components/common/SettingsDrawer.vue'
import { useUserStore } from '@/store/modules/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const searchQuery = ref('')
const showUserMenu = ref(false)
const showLanguageMenu = ref(false)
const showSettingsDrawer = ref(false)

const { locale, t } = useI18n()
const currentLocale = computed(() => locale.value)
const displayName = computed(() => userStore.userName || 'Alice')
const displayEmail = computed(() => userStore.userEmail || 'alice@example.com')

function setLanguage(lang) {
  locale.value = lang
  localStorage.setItem('locale', lang)
  showLanguageMenu.value = false
}

function openSettingsDrawer() {
  showUserMenu.value = false
  showSettingsDrawer.value = true
}

// Icon components
const HomeIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })
])

const ChevronRightIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 5l7 7-7 7' })
])

const SearchIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' })
])

const PlusIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4v16m8-8H4' })
])

const BellIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' })
])

const ChevronDownIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 9l-7 7-7-7' })
])

const UserIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
])

const CogIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }),
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' })
])

const KeyIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' })
])

const LogoutIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' })
])

const GlobeIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' })
])

const CoinIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('circle', { cx: '12', cy: '12', r: '9', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 7v5l3 3' }),
  h('circle', { cx: '12', cy: '12', r: '3', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' })
])

const CrownIcon = () => h('svg', { class: 'w-5 h-5', fill: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { d: 'M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2-2h10v2H7v-2z' })
])

const SparklesIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' })
])

async function logout() {
  showUserMenu.value = false
  await userStore.logout()
  router.push('/login')
}
// Page title based on route
const pageTitle = computed(() => {
  const titleKeys = {
    '/': '',
    '/datasets': 'nav.datasets',
    '/datasets/': 'nav.datasets',
    '/models': 'nav.models',
    '/models/': 'nav.models',
    '/apps': 'nav.apps',
    '/apps/': 'nav.apps',
    '/dataflow': 'nav.packages',
    '/dataflow/canvas': 'nav.canvas',
    '/dataflow/tasks': 'nav.tasks',
  }
  
  if (titleKeys[route.path]) {
    return titleKeys[route.path] ? t(titleKeys[route.path]) : ''
  }
  
  for (const [path, key] of Object.entries(titleKeys)) {
    if (path.endsWith('/') && route.path.startsWith(path)) {
      return key ? t(key) : ''
    }
  }
  
  return ''
})

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/datasets', query: { search: searchQuery.value.trim() } })
    searchQuery.value = ''
  }
}

// Close menus when clicking outside
function handleClickOutside(e) {
  if (!e.target.closest('.relative')) {
    showUserMenu.value = false
    showLanguageMenu.value = false
  }
}

// Close menus on escape key
function handleKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    document.querySelector('input[type="text"]')?.focus()
  }
  if (e.key === 'Escape') {
    showUserMenu.value = false
    showLanguageMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.bell-swing {
  transform-origin: top center;
}

.bell-trigger:hover .bell-swing {
  animation: bellSwing 620ms ease-out 1;
}

@keyframes bellSwing {
  0%,
  100% {
    transform: rotate(0deg);
  }
  18% {
    transform: rotate(16deg);
  }
  38% {
    transform: rotate(-13deg);
  }
  58% {
    transform: rotate(8deg);
  }
  78% {
    transform: rotate(-4deg);
  }
}
</style>
