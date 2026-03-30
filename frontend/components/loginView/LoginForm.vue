<template>
  <div class="space-y-6">
    <div class="text-center">
      <p class="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">{{ t('login.modes.login.eyebrow') }}</p>
      <h2 class="text-3xl font-semibold tracking-tight text-slate-900">{{ t('login.modes.login.title') }}</h2>
    </div>

    <form class="space-y-5" @submit.prevent="emit('submit')">
      <div class="space-y-2">
        <label for="login-email" class="block text-sm font-medium text-slate-700">{{ t('login.emailLabel') }}</label>
        <div class="relative">
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 12 13l9-5.5M5 5.5h14A1.5 1.5 0 0 1 20.5 7v10a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17V7A1.5 1.5 0 0 1 5 5.5Z" />
            </svg>
          </span>
          <input
            id="login-email"
            v-model="emailModel"
            type="email"
            autocomplete="off"
            :placeholder="t('login.emailPlaceholder')"
            class="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
            @focus="emit('focus-change', true)"
            @blur="emit('focus-change', false)"
          >
        </div>
      </div>

      <div class="space-y-2">
        <label for="login-password" class="block text-sm font-medium text-slate-700">{{ t('login.passwordLabel') }}</label>
        <div class="relative">
          <input
            id="login-password"
            v-model="passwordModel"
            :type="props.showPassword ? 'text' : 'password'"
            :placeholder="t('login.passwordPlaceholder')"
            class="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
            @focus="emit('focus-change', true)"
            @blur="emit('focus-change', false)"
          >
          <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition hover:text-slate-700"
            @click="emit('update:showPassword', !props.showPassword)"
          >
            <svg v-if="props.showPassword" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="m3 3 18 18M10.58 10.58A3 3 0 0 0 15 15m2.12 2.12A10.94 10.94 0 0 1 12 18.5c-5 0-9-6.5-9-6.5a18.4 18.4 0 0 1 4.11-4.77m3.14-1.86A10.6 10.6 0 0 1 12 5.5c5 0 9 6.5 9 6.5a18.6 18.6 0 0 1-1.67 2.39" />
            </svg>
            <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.46 12S6 5.5 12 5.5 21.54 12 21.54 12 18 18.5 12 18.5 2.46 12 2.46 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between gap-4">
        <label class="flex items-center gap-3 text-sm text-slate-600">
          <input
            :checked="props.rememberMe"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            @change="emit('update:rememberMe', $event.target.checked)"
          >
          {{ t('login.rememberMe') }}
        </label>
        <button type="button" class="text-sm font-medium text-teal-700 transition hover:text-teal-900" @click="emit('navigate-forgot-password')">
          {{ t('login.forgotPassword') }}
        </button>
      </div>

      <div v-if="props.error" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ props.error }}
      </div>

      <div v-if="props.successMessage" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        {{ props.successMessage }}
      </div>

      <button
        type="submit"
        class="flex h-12 w-full items-center justify-center rounded-2xl bg-slate-900 text-base font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="props.isLoading"
      >
        {{ props.isLoading ? t('login.modes.login.loading') : t('login.modes.login.submit') }}
      </button>
    </form>

    <div class="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-slate-400">
      <div class="h-px flex-1 bg-slate-200" />
      <span>{{ t('login.orContinueWith') }}</span>
      <div class="h-px flex-1 bg-slate-200" />
    </div>

    <button type="button" class="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
      <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#EA4335" d="M12 10.2v3.9h5.42c-.24 1.25-.95 2.31-2 3.03l3.23 2.5c1.88-1.73 2.96-4.27 2.96-7.28 0-.71-.06-1.4-.18-2.05H12Z" />
        <path fill="#4285F4" d="M12 22c2.7 0 4.96-.9 6.61-2.45l-3.23-2.5c-.9.6-2.06.95-3.38.95-2.6 0-4.81-1.76-5.6-4.12H3.06v2.59A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.4 13.88a5.98 5.98 0 0 1 0-3.76V7.53H3.06a10 10 0 0 0 0 8.94l3.34-2.59Z" />
        <path fill="#34A853" d="M12 6c1.47 0 2.8.5 3.84 1.48l2.88-2.88C16.95 2.97 14.7 2 12 2A10 10 0 0 0 3.06 7.53l3.34 2.59C7.19 7.76 9.4 6 12 6Z" />
      </svg>
      {{ t('login.loginWithGoogle') }}
    </button>

    <p class="text-center text-sm text-slate-500">
      {{ t('login.noAccount') }}
      <button type="button" class="ml-1 font-medium text-slate-900 transition hover:text-teal-700" @click="emit('navigate-register')">
        {{ t('login.signUp') }}
      </button>
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  email: { type: String, required: true },
  password: { type: String, required: true },
  showPassword: { type: Boolean, default: false },
  rememberMe: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  successMessage: { type: String, default: '' }
})

const emit = defineEmits([
  'update:email',
  'update:password',
  'update:showPassword',
  'update:rememberMe',
  'focus-change',
  'submit',
  'navigate-forgot-password',
  'navigate-register'
])

const { t } = useI18n()

const emailModel = computed({
  get: () => props.email,
  set: (value) => emit('update:email', value)
})

const passwordModel = computed({
  get: () => props.password,
  set: (value) => emit('update:password', value)
})
</script>
