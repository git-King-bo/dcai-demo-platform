<template>
  <div class="space-y-6">
    <div class="text-center">
      <p class="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-primary">{{ t('login.modes.forgot-password.eyebrow') }}</p>
      <h2 class="text-3xl font-semibold tracking-tight text-foreground">{{ t('login.modes.forgot-password.title') }}</h2>
      <p class="mt-3 text-sm leading-6 text-muted-foreground">{{ t('login.modes.forgot-password.description') }}</p>
    </div>

    <form class="space-y-5" @submit.prevent="emit('submit')">
      <div class="space-y-2">
        <label for="forgot-password-email" class="block text-sm font-medium text-foreground">{{ t('login.emailLabel') }}</label>
        <div class="relative">
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 12 13l9-5.5M5 5.5h14A1.5 1.5 0 0 1 20.5 7v10a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17V7A1.5 1.5 0 0 1 5 5.5Z" />
            </svg>
          </span>
          <input
            id="forgot-password-email"
            v-model="emailModel"
            type="email"
            autocomplete="off"
            :placeholder="t('login.emailPlaceholder')"
            class="h-12 w-full rounded-2xl border border-border/80 bg-card pl-12 pr-4 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
            @focus="emit('focus-change', true)"
            @blur="emit('focus-change', false)"
          >
        </div>
      </div>

      <div v-if="props.error" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ props.error }}
      </div>

      <div v-if="props.successMessage" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        {{ props.successMessage }}
      </div>

      <button
        type="submit"
        class="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-base font-medium text-primary-foreground transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="props.isLoading"
      >
        {{ props.isLoading ? t('login.modes.forgot-password.loading') : t('login.modes.forgot-password.submit') }}
      </button>
    </form>

    <p class="text-center text-sm text-muted-foreground">
      {{ t('login.rememberedPassword') }}
      <button type="button" class="ml-1 font-medium text-foreground transition hover:text-primary" @click="emit('navigate-login')">
        {{ t('login.backToLogin') }}
      </button>
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  email: { type: String, required: true },
  isLoading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  successMessage: { type: String, default: '' }
})

const emit = defineEmits([
  'update:email',
  'focus-change',
  'submit',
  'navigate-login'
])

const { t } = useI18n()

const emailModel = computed({
  get: () => props.email,
  set: (value) => emit('update:email', value)
})
</script>
