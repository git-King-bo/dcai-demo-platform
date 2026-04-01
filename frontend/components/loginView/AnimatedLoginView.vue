<template>
  <div class="h-screen w-screen overflow-hidden bg-background text-foreground">
    <div class="grid h-screen lg:grid-cols-[1.15fr_0.85fr]">
      <section class="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:bg-[linear-gradient(135deg,hsl(var(--hero-from))_0%,hsl(var(--hero-via))_45%,hsl(var(--hero-to))_100%)] lg:p-12 lg:text-white">
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.16),transparent_35%)]" />
        <div class="hero-grid absolute inset-0 opacity-30" />

        <div class="relative z-10 flex items-center gap-3">
          <div class="flex items-center justify-center rounded-2xl bg-white/12 backdrop-blur-sm">
            <img :src="ysOrbitBadge" alt="YS brand mark" class="h-16 w-16">
          </div>
          <div>
            <h1 class="text-xl font-semibold letter-spacing tracking-[0.25em]">DCAI</h1>
            <p class="text-sm uppercase tracking-[0.35em] text-white/70">{{ t('login.brandTagline') }}</p>
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

        <div class="relative z-10 w-full max-w-[440px] rounded-[28px] border border-border/70 bg-card/85 p-8 shadow-[0_20px_70px_hsl(var(--shadow-color)/0.16)] backdrop-blur">
          <div class="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <img :src="ysOrbitBadge" alt="YS brand mark" class="h-7 w-7">
            </div>
            <span class="text-lg font-semibold text-foreground">DCAI</span>
          </div>

          <Transition name="auth-fade-slide" mode="out-in">
            <LoginForm
              v-if="isLoginMode"
              key="login"
              :email="email"
              :password="password"
              :show-password="showPassword"
              :remember-me="rememberMe"
              :is-loading="isLoading"
              :error="error"
              :success-message="successMessage"
              @update:email="email = $event"
              @update:password="password = $event"
              @update:show-password="showPassword = $event"
              @update:remember-me="rememberMe = $event"
              @focus-change="isTyping = $event"
              @submit="handleSubmit"
              @navigate-forgot-password="navigateToMode('forgot-password')"
              @navigate-register="navigateToMode('register')"
            />
            <RegisterForm
              v-else-if="isRegisterMode"
              key="register"
              :full-name="fullName"
              :email="email"
              :password="password"
              :confirm-password="confirmPassword"
              :show-password="showPassword"
              :is-loading="isLoading"
              :error="error"
              :success-message="successMessage"
              @update:full-name="fullName = $event"
              @update:email="email = $event"
              @update:password="password = $event"
              @update:confirm-password="confirmPassword = $event"
              @update:show-password="showPassword = $event"
              @focus-change="isTyping = $event"
              @submit="handleSubmit"
              @navigate-login="navigateToMode('login')"
            />
            <ForgotPasswordForm
              v-else
              key="forgot-password"
              :email="email"
              :is-loading="isLoading"
              :error="error"
              :success-message="successMessage"
              @update:email="email = $event"
              @focus-change="isTyping = $event"
              @submit="handleSubmit"
              @navigate-login="navigateToMode('login')"
            />
          </Transition>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ysOrbitBadge from '@/assets/branding/ys-orbit-badge.svg'
import ForgotPasswordForm from './ForgotPasswordForm.vue'
import EyeBall from './EyeBall.vue'
import LoginForm from './LoginForm.vue'
import PupilDot from './PupilDot.vue'
import RegisterForm from './RegisterForm.vue'

const props = defineProps({
  initialMode: {
    type: String,
    default: 'login'
  }
})

const emit = defineEmits(['mode-change', 'auth-success'])

const { t } = useI18n()

const showPassword = ref(false)
const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
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

const authMode = ref(props.initialMode)

const isLoginMode = computed(() => authMode.value === 'login')
const isRegisterMode = computed(() => authMode.value === 'register')
const isForgotPasswordMode = computed(() => authMode.value === 'forgot-password')

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

watch(authMode, () => {
  error.value = ''
  successMessage.value = ''
  showPassword.value = false
})

watch(() => props.initialMode, (mode) => {
  authMode.value = mode || 'login'
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

function navigateToMode(mode) {
  error.value = ''
  successMessage.value = ''
  authMode.value = mode
  emit('mode-change', mode)
}

async function simulateAuthRequest() {
  await new Promise((resolve) => {
    submitTimerId = window.setTimeout(resolve, 350)
  })
}

async function handleSubmit() {
  error.value = ''
  successMessage.value = ''
  isLoading.value = true

  await simulateAuthRequest()

  if (!email.value) {
    error.value = t('login.validation.emailRequired')
    isLoading.value = false
    return
  }

  if (isForgotPasswordMode.value) {
    successMessage.value = t('login.resetPasswordSuccess')
    isLoading.value = false
    return
  }

  if (isRegisterMode.value) {
    if (!fullName.value) {
      error.value = t('login.validation.fullNameRequired')
      isLoading.value = false
      return
    }

    if (!password.value) {
      error.value = t('login.validation.passwordRequired')
      isLoading.value = false
      return
    }

    if (password.value !== confirmPassword.value) {
      error.value = t('login.validation.passwordMismatch')
      isLoading.value = false
      return
    }

    successMessage.value = t('login.registerSuccess')
    isLoading.value = false
    return
  }

  if (email.value === 'erik@gmail.com' && password.value === '1234') {
    successMessage.value = t(rememberMe.value ? 'login.successRemember' : 'login.success')
    emit('auth-success', {
      mode: 'login',
      email: email.value,
      rememberMe: rememberMe.value
    })
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

.auth-fade-slide-enter-active,
.auth-fade-slide-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}

.auth-fade-slide-enter-from,
.auth-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
