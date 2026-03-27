<template>
  <div class="h-screen w-screen overflow-hidden bg-white">
    <div class="grid h-screen lg:grid-cols-[1.15fr_0.85fr]">
      <section class="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:bg-[linear-gradient(135deg,#0f766e_0%,#155e75_45%,#1e3a8a_100%)] lg:p-12 lg:text-white">
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.16),transparent_35%)]" />
        <div class="hero-grid absolute inset-0 opacity-30" />

        <div class="relative z-10 flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 backdrop-blur-sm">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="m12 3 1.9 5.82L20 10.73l-4.9 3.56 1.88 5.83L12 16.6l-4.98 3.52 1.88-5.83L4 10.73l6.1-1.91L12 3Z" />
            </svg>
          </div>
          <div>
            <p class="text-sm uppercase tracking-[0.35em] text-white/70">{{ t('login.brandTagline') }}</p>
            <h1 class="text-xl font-semibold tracking-tight">{{ t('login.brandName') }}</h1>
          </div>
        </div>

        <div class="relative z-10 flex items-end justify-center py-8">
          <div class="relative h-[400px] w-[550px] max-w-full scale-90 xl:scale-100">
            <div
              ref="purpleRef"
              class="absolute bottom-0 transition-all duration-700 ease-in-out"
              :style="purpleStyle"
            >
              <div class="absolute flex gap-8 transition-all duration-700 ease-in-out" :style="purpleEyesStyle">
                <EyeBall
                  :size="18"
                  :pupil-size="7"
                  :max-distance="5"
                  eye-color="#ffffff"
                  pupil-color="#2D2D2D"
                  :is-blinking="isPurpleBlinking"
                  :force-look-x="purpleEyeLookX"
                  :force-look-y="purpleEyeLookY"
                />
                <EyeBall
                  :size="18"
                  :pupil-size="7"
                  :max-distance="5"
                  eye-color="#ffffff"
                  pupil-color="#2D2D2D"
                  :is-blinking="isPurpleBlinking"
                  :force-look-x="purpleEyeLookX"
                  :force-look-y="purpleEyeLookY"
                />
              </div>
            </div>

            <div
              ref="blackRef"
              class="absolute bottom-0 transition-all duration-700 ease-in-out"
              :style="blackStyle"
            >
              <div class="absolute flex gap-6 transition-all duration-700 ease-in-out" :style="blackEyesStyle">
                <EyeBall
                  :size="16"
                  :pupil-size="6"
                  :max-distance="4"
                  eye-color="#ffffff"
                  pupil-color="#2D2D2D"
                  :is-blinking="isBlackBlinking"
                  :force-look-x="blackEyeLookX"
                  :force-look-y="blackEyeLookY"
                />
                <EyeBall
                  :size="16"
                  :pupil-size="6"
                  :max-distance="4"
                  eye-color="#ffffff"
                  pupil-color="#2D2D2D"
                  :is-blinking="isBlackBlinking"
                  :force-look-x="blackEyeLookX"
                  :force-look-y="blackEyeLookY"
                />
              </div>
            </div>

            <div
              ref="orangeRef"
              class="absolute bottom-0 transition-all duration-700 ease-in-out"
              :style="orangeStyle"
            >
              <div class="absolute flex gap-8 transition-all duration-200 ease-out" :style="orangeEyesStyle">
                <PupilDot :size="12" :max-distance="5" pupil-color="#2D2D2D" :force-look-x="sideEyeLookX" :force-look-y="sideEyeLookY" />
                <PupilDot :size="12" :max-distance="5" pupil-color="#2D2D2D" :force-look-x="sideEyeLookX" :force-look-y="sideEyeLookY" />
              </div>
            </div>

            <div
              ref="yellowRef"
              class="absolute bottom-0 transition-all duration-700 ease-in-out"
              :style="yellowStyle"
            >
              <div class="absolute flex gap-6 transition-all duration-200 ease-out" :style="yellowEyesStyle">
                <PupilDot :size="12" :max-distance="5" pupil-color="#2D2D2D" :force-look-x="sideEyeLookX" :force-look-y="sideEyeLookY" />
                <PupilDot :size="12" :max-distance="5" pupil-color="#2D2D2D" :force-look-x="sideEyeLookX" :force-look-y="sideEyeLookY" />
              </div>
              <div class="absolute h-[4px] w-20 rounded-full bg-[#2D2D2D] transition-all duration-200 ease-out" :style="yellowMouthStyle" />
            </div>
          </div>
        </div>

        <div class="relative z-10 flex items-center gap-8 text-sm text-white/65">
          <a href="#" class="transition-colors hover:text-white">{{ t('login.links.privacyPolicy') }}</a>
          <a href="#" class="transition-colors hover:text-white">{{ t('login.links.termsOfService') }}</a>
          <a href="#" class="transition-colors hover:text-white">{{ t('login.links.contact') }}</a>
        </div>
      </section>

      <section class="relative flex items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] p-6 sm:p-8 lg:p-12">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.08),transparent_35%),radial-gradient(circle_at_bottom,rgba(30,58,138,0.08),transparent_45%)]" />

        <div class="relative z-10 w-full max-w-[440px] rounded-[28px] border border-slate-200/70 bg-white/85 p-8 shadow-[0_20px_70px_rgba(30,41,59,0.12)] backdrop-blur">
          <div class="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="m12 3 1.9 5.82L20 10.73l-4.9 3.56 1.88 5.83L12 16.6l-4.98 3.52 1.88-5.83L4 10.73l6.1-1.91L12 3Z" />
              </svg>
            </div>
            <span class="text-lg font-semibold text-slate-900">{{ t('login.brandName') }}</span>
          </div>

          <div class="mb-10 text-center">
            <p class="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">{{ t('login.welcomeTag') }}</p>
            <h2 class="text-3xl font-semibold tracking-tight text-slate-900">{{ t('login.title') }}</h2>
            <!-- <p class="mt-3 text-sm leading-6 text-slate-500">{{ t('login.subtitle') }}</p> -->
          </div>

          <form class="space-y-5" @submit.prevent="handleSubmit">
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-slate-700">{{ t('login.emailLabel') }}</label>
              <div class="relative">
                <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 12 13l9-5.5M5 5.5h14A1.5 1.5 0 0 1 20.5 7v10a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17V7A1.5 1.5 0 0 1 5 5.5Z" />
                  </svg>
                </span>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  autocomplete="off"
                  placeholder="xxx@xx.com"
                  class="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  @focus="isTyping = true"
                  @blur="isTyping = false"
                >
              </div>
            </div>

            <div class="space-y-2">
              <label for="password" class="block text-sm font-medium text-slate-700">{{ t('login.passwordLabel') }}</label>
              <div class="relative">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  :placeholder="t('login.passwordPlaceholder')"
                  class="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  @focus="isTyping = true"
                  @blur="isTyping = false"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition hover:text-slate-700"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="showPassword" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
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
                <input v-model="rememberMe" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500">
                {{ t('login.rememberMe') }}
              </label>
              <a href="#" class="text-sm font-medium text-teal-700 transition hover:text-teal-900">{{ t('login.forgotPassword') }}</a>
            </div>

            <div v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {{ error }}
            </div>

            <div v-if="successMessage" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {{ successMessage }}
            </div>

            <button
              type="submit"
              class="flex h-12 w-full items-center justify-center rounded-2xl bg-slate-900 text-base font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isLoading"
            >
              {{ isLoading ? t('login.signingIn') : t('login.loginButton') }}
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

          <p class="mt-8 text-center text-sm text-slate-500">
            {{ t('login.noAccount') }}
            <a href="#" class="ml-1 font-medium text-slate-900 transition hover:text-teal-700">{{ t('login.signUp') }}</a>
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import EyeBall from './EyeBall.vue'
import PupilDot from './PupilDot.vue'
const router = useRouter()

const { t } = useI18n()

const showPassword = ref(false)
const email = ref('')
const password = ref('')
const error = ref('')
const successMessage = ref('')
const isLoading = ref(false)
const rememberMe = ref(false)
const mouseX = ref(0)
const mouseY = ref(0)
const isPurpleBlinking = ref(false)
const isBlackBlinking = ref(false)
const isTyping = ref(false)
const isLookingAtEachOther = ref(false)
const isPurplePeeking = ref(false)

const purpleRef = ref(null)
const blackRef = ref(null)
const yellowRef = ref(null)
const orangeRef = ref(null)

let purpleBlinkTimeoutId = null
let purpleBlinkInnerTimeoutId = null
let blackBlinkTimeoutId = null
let blackBlinkInnerTimeoutId = null
let lookTimerId = null
let purplePeekIntervalId = null
let purplePeekInnerTimeoutId = null
let submitTimerId = null

function handleMouseMove(event) {
  mouseX.value = event.clientX
  mouseY.value = event.clientY
}

function randomBlinkDelay() {
  return Math.random() * 4000 + 3000
}

function schedulePurpleBlink() {
  purpleBlinkTimeoutId = window.setTimeout(() => {
    isPurpleBlinking.value = true
    purpleBlinkInnerTimeoutId = window.setTimeout(() => {
      isPurpleBlinking.value = false
      schedulePurpleBlink()
    }, 150)
  }, randomBlinkDelay())
}

function scheduleBlackBlink() {
  blackBlinkTimeoutId = window.setTimeout(() => {
    isBlackBlinking.value = true
    blackBlinkInnerTimeoutId = window.setTimeout(() => {
      isBlackBlinking.value = false
      scheduleBlackBlink()
    }, 150)
  }, randomBlinkDelay())
}

function clearPeekTimers() {
  if (purplePeekIntervalId) {
    window.clearTimeout(purplePeekIntervalId)
    purplePeekIntervalId = null
  }

  if (purplePeekInnerTimeoutId) {
    window.clearTimeout(purplePeekInnerTimeoutId)
    purplePeekInnerTimeoutId = null
  }
}

function calculatePosition(targetRef) {
  if (!targetRef.value) {
    return { faceX: 0, faceY: 0, bodySkew: 0 }
  }

  const rect = targetRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 3
  const deltaX = mouseX.value - centerX
  const deltaY = mouseY.value - centerY

  return {
    faceX: Math.max(-15, Math.min(15, deltaX / 20)),
    faceY: Math.max(-10, Math.min(10, deltaY / 30)),
    bodySkew: Math.max(-6, Math.min(6, -deltaX / 120))
  }
}

const purplePos = computed(() => calculatePosition(purpleRef))
const blackPos = computed(() => calculatePosition(blackRef))
const yellowPos = computed(() => calculatePosition(yellowRef))
const orangePos = computed(() => calculatePosition(orangeRef))

const isPasswordPeekMode = computed(() => password.value.length > 0 && showPassword.value)
const isPasswordHiddenMode = computed(() => password.value.length > 0 && !showPassword.value)

const purpleEyeLookX = computed(() => {
  if (isPasswordPeekMode.value) {
    return isPurplePeeking.value ? 4 : -4
  }

  if (isLookingAtEachOther.value) {
    return 3
  }

  return null
})

const purpleEyeLookY = computed(() => {
  if (isPasswordPeekMode.value) {
    return isPurplePeeking.value ? 5 : -4
  }

  if (isLookingAtEachOther.value) {
    return 4
  }

  return null
})

const blackEyeLookX = computed(() => {
  if (isPasswordPeekMode.value) {
    return -4
  }

  if (isLookingAtEachOther.value) {
    return 0
  }

  return null
})

const blackEyeLookY = computed(() => {
  if (isPasswordPeekMode.value) {
    return -4
  }

  if (isLookingAtEachOther.value) {
    return -4
  }

  return null
})

const sideEyeLookX = computed(() => (isPasswordPeekMode.value ? -5 : null))
const sideEyeLookY = computed(() => (isPasswordPeekMode.value ? -4 : null))

const purpleStyle = computed(() => ({
  left: '70px',
  width: '180px',
  height: isTyping.value || isPasswordHiddenMode.value ? '440px' : '400px',
  backgroundColor: '#6C3FF5',
  borderRadius: '10px 10px 0 0',
  zIndex: 1,
  transform: isPasswordPeekMode.value
    ? 'skewX(0deg)'
    : isTyping.value || isPasswordHiddenMode.value
      ? `skewX(${purplePos.value.bodySkew - 12}deg) translateX(40px)`
      : `skewX(${purplePos.value.bodySkew}deg)`,
  transformOrigin: 'bottom center'
}))

const purpleEyesStyle = computed(() => ({
  left: isPasswordPeekMode.value ? '20px' : isLookingAtEachOther.value ? '55px' : `${45 + purplePos.value.faceX}px`,
  top: isPasswordPeekMode.value ? '35px' : isLookingAtEachOther.value ? '65px' : `${40 + purplePos.value.faceY}px`
}))

const blackStyle = computed(() => ({
  left: '240px',
  width: '120px',
  height: '310px',
  backgroundColor: '#2D2D2D',
  borderRadius: '8px 8px 0 0',
  zIndex: 2,
  transform: isPasswordPeekMode.value
    ? 'skewX(0deg)'
    : isLookingAtEachOther.value
      ? `skewX(${blackPos.value.bodySkew * 1.5 + 10}deg) translateX(20px)`
      : isTyping.value || isPasswordHiddenMode.value
        ? `skewX(${blackPos.value.bodySkew * 1.5}deg)`
        : `skewX(${blackPos.value.bodySkew}deg)`,
  transformOrigin: 'bottom center'
}))

const blackEyesStyle = computed(() => ({
  left: isPasswordPeekMode.value ? '10px' : isLookingAtEachOther.value ? '32px' : `${26 + blackPos.value.faceX}px`,
  top: isPasswordPeekMode.value ? '28px' : isLookingAtEachOther.value ? '12px' : `${32 + blackPos.value.faceY}px`
}))

const orangeStyle = computed(() => ({
  left: '0px',
  width: '240px',
  height: '200px',
  zIndex: 3,
  backgroundColor: '#FF9B6B',
  borderRadius: '120px 120px 0 0',
  transform: isPasswordPeekMode.value ? 'skewX(0deg)' : `skewX(${orangePos.value.bodySkew}deg)`,
  transformOrigin: 'bottom center'
}))

const orangeEyesStyle = computed(() => ({
  left: isPasswordPeekMode.value ? '50px' : `${82 + orangePos.value.faceX}px`,
  top: isPasswordPeekMode.value ? '85px' : `${90 + orangePos.value.faceY}px`
}))

const yellowStyle = computed(() => ({
  left: '310px',
  width: '140px',
  height: '230px',
  backgroundColor: '#E8D754',
  borderRadius: '70px 70px 0 0',
  zIndex: 4,
  transform: isPasswordPeekMode.value ? 'skewX(0deg)' : `skewX(${yellowPos.value.bodySkew}deg)`,
  transformOrigin: 'bottom center'
}))

const yellowEyesStyle = computed(() => ({
  left: isPasswordPeekMode.value ? '20px' : `${52 + yellowPos.value.faceX}px`,
  top: isPasswordPeekMode.value ? '35px' : `${40 + yellowPos.value.faceY}px`
}))

const yellowMouthStyle = computed(() => ({
  left: isPasswordPeekMode.value ? '10px' : `${40 + yellowPos.value.faceX}px`,
  top: isPasswordPeekMode.value ? '88px' : `${88 + yellowPos.value.faceY}px`
}))

watch(isTyping, (typing) => {
  if (lookTimerId) {
    window.clearTimeout(lookTimerId)
    lookTimerId = null
  }

  if (typing) {
    isLookingAtEachOther.value = true
    lookTimerId = window.setTimeout(() => {
      isLookingAtEachOther.value = false
      lookTimerId = null
    }, 800)
    return
  }

  isLookingAtEachOther.value = false
})

watch([password, showPassword], ([newPassword, passwordVisible]) => {
  clearPeekTimers()

  if (newPassword.length > 0 && passwordVisible) {
    purplePeekIntervalId = window.setTimeout(() => {
      isPurplePeeking.value = true
      purplePeekInnerTimeoutId = window.setTimeout(() => {
        isPurplePeeking.value = false
      }, 800)
    }, Math.random() * 3000 + 2000)
    return
  }

  isPurplePeeking.value = false
}, { immediate: true })

async function handleSubmit() {
  error.value = ''
  successMessage.value = ''
  isLoading.value = true

  await new Promise((resolve) => {
    submitTimerId = window.setTimeout(resolve, 300)
  })

  if (email.value === 'erik@gmail.com' && password.value === '1234') {
    successMessage.value = t(rememberMe.value ? 'login.successRemember' : 'login.success')
    router.push('/')
  } else {
    error.value = t('login.invalidCredentials')
  }

  isLoading.value = false
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  schedulePurpleBlink()
  scheduleBlackBlink()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)

  if (purpleBlinkTimeoutId) {
    window.clearTimeout(purpleBlinkTimeoutId)
  }

  if (purpleBlinkInnerTimeoutId) {
    window.clearTimeout(purpleBlinkInnerTimeoutId)
  }

  if (blackBlinkTimeoutId) {
    window.clearTimeout(blackBlinkTimeoutId)
  }

  if (blackBlinkInnerTimeoutId) {
    window.clearTimeout(blackBlinkInnerTimeoutId)
  }

  if (lookTimerId) {
    window.clearTimeout(lookTimerId)
  }

  clearPeekTimers()

  if (submitTimerId) {
    window.clearTimeout(submitTimerId)
  }
})
</script>

<style scoped>
.hero-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
