<template>
  <div class="space-y-6">
    <div class="text-center">
      <p class="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">{{ t('login.modes.register.eyebrow') }}</p>
      <h2 class="text-3xl font-semibold tracking-tight text-slate-900">{{ t('login.modes.register.title') }}</h2>
      <p class="mt-3 text-sm leading-6 text-slate-500">{{ t('login.modes.register.description') }}</p>
    </div>

    <form class="space-y-5" @submit.prevent="emit('submit')">
      <div class="space-y-2">
        <label for="register-full-name" class="block text-sm font-medium text-slate-700">{{ t('login.fullNameLabel') }}</label>
        <input
          id="register-full-name"
          v-model="fullNameModel"
          type="text"
          :placeholder="t('login.fullNamePlaceholder')"
          class="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
          @focus="emit('focus-change', true)"
          @blur="emit('focus-change', false)"
        >
      </div>

      <div class="space-y-2">
        <label for="register-email" class="block text-sm font-medium text-slate-700">{{ t('login.emailLabel') }}</label>
        <div class="relative">
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 12 13l9-5.5M5 5.5h14A1.5 1.5 0 0 1 20.5 7v10a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17V7A1.5 1.5 0 0 1 5 5.5Z" />
            </svg>
          </span>
          <input
            id="register-email"
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
        <label for="register-password" class="block text-sm font-medium text-slate-700">{{ t('login.passwordLabel') }}</label>
        <div class="relative">
          <input
            id="register-password"
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

      <div class="space-y-2">
        <label for="register-confirm-password" class="block text-sm font-medium text-slate-700">{{ t('login.confirmPasswordLabel') }}</label>
        <input
          id="register-confirm-password"
          v-model="confirmPasswordModel"
          :type="props.showPassword ? 'text' : 'password'"
          :placeholder="t('login.confirmPasswordPlaceholder')"
          class="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
          @focus="emit('focus-change', true)"
          @blur="emit('focus-change', false)"
        >
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
        {{ props.isLoading ? t('login.modes.register.loading') : t('login.modes.register.submit') }}
      </button>
    </form>

    <p class="text-center text-sm text-slate-500">
      {{ t('login.haveAccount') }}
      <button type="button" class="ml-1 font-medium text-slate-900 transition hover:text-teal-700" @click="emit('navigate-login')">
        {{ t('login.loginButton') }}
      </button>
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  confirmPassword: { type: String, required: true },
  showPassword: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  successMessage: { type: String, default: '' }
})

const emit = defineEmits([
  'update:fullName',
  'update:email',
  'update:password',
  'update:confirmPassword',
  'update:showPassword',
  'focus-change',
  'submit',
  'navigate-login'
])

const { t } = useI18n()

const fullNameModel = computed({
  get: () => props.fullName,
  set: (value) => emit('update:fullName', value)
})

const emailModel = computed({
  get: () => props.email,
  set: (value) => emit('update:email', value)
})

const passwordModel = computed({
  get: () => props.password,
  set: (value) => emit('update:password', value)
})

const confirmPasswordModel = computed({
  get: () => props.confirmPassword,
  set: (value) => emit('update:confirmPassword', value)
})
</script>
