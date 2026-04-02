<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-6 py-2">
    <JellySurface
      as="section"
      padding="xl"
      radius="2xl"
      tone="accent"
      elevated
      custom-class="jelly-brake-reveal"
    >
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/45">Jelly Demo</p>
            <h1 class="mt-2 text-4xl font-semibold tracking-[-0.05em] text-foreground md:text-5xl">
              Jelly 组件展示页
            </h1>
            <p class="mt-4 max-w-3xl text-base leading-8 text-foreground/66">
              这个页面会依次展示 `JellySurface`、`JellyButton`、`JellyDropdown` 和 `JellyModal` 的实际效果，方便你联调和继续扩展。
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <JellySurface padding="sm" radius="full" tone="soft" custom-class="px-4 py-2">
              <span class="text-sm font-medium text-foreground/65">README: `frontend/components/jelly/README.md`</span>
            </JellySurface>
            <JellyButton variant="primary" @click="showModal = true">
              打开 Demo 弹窗
            </JellyButton>
          </div>
        </div>
      </template>

      <div class="mt-2 grid gap-4 md:grid-cols-3">
        <JellySurface
          v-for="stat in stats"
          :key="stat.label"
          padding="md"
          radius="xl"
          tone="soft"
          custom-class="jelly-brake-reveal"
        >
          <p class="text-sm font-medium text-foreground/50">{{ stat.label }}</p>
          <div class="mt-3 flex items-end gap-2">
            <span class="text-3xl font-semibold tracking-[-0.04em] text-foreground">{{ stat.value }}</span>
            <span class="pb-1 text-xs font-semibold text-emerald-600">{{ stat.trend }}</span>
          </div>
        </JellySurface>
      </div>
    </JellySurface>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <JellySurface padding="lg" radius="xl" tone="default" custom-class="jelly-brake-reveal jelly-brake-delay-1">
        <template #header>
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/45">Surface</p>
            <h2 class="mt-2 text-2xl font-semibold tracking-tight text-foreground">JellySurface</h2>
          </div>
        </template>

        <div class="grid gap-4 md:grid-cols-3">
          <JellySurface padding="md" radius="lg" tone="default">
            <p class="text-sm font-semibold text-foreground">default</p>
            <p class="mt-2 text-sm leading-6 text-foreground/60">适合普通卡片、说明块、列表项。</p>
          </JellySurface>
          <JellySurface padding="md" radius="xl" tone="soft">
            <p class="text-sm font-semibold text-foreground">soft</p>
            <p class="mt-2 text-sm leading-6 text-foreground/60">更轻、更柔和，适合次级信息容器。</p>
          </JellySurface>
          <JellySurface padding="md" radius="xl" tone="accent" elevated>
            <p class="text-sm font-semibold text-foreground">accent + elevated</p>
            <p class="mt-2 text-sm leading-6 text-foreground/60">适合 Hero、重点运营区、强调面板。</p>
          </JellySurface>
        </div>
      </JellySurface>

      <JellySurface padding="lg" radius="xl" tone="soft" custom-class="jelly-brake-reveal jelly-brake-delay-2">
        <template #header>
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/45">Button</p>
            <h2 class="mt-2 text-2xl font-semibold tracking-tight text-foreground">JellyButton</h2>
          </div>
        </template>

        <div class="grid gap-3">
          <div class="flex flex-wrap gap-3">
            <JellyButton>默认按钮</JellyButton>
            <JellyButton variant="primary">主按钮</JellyButton>
            <JellyButton variant="ghost">幽灵按钮</JellyButton>
          </div>

          <div class="flex flex-wrap gap-3">
            <JellyButton size="sm">Small</JellyButton>
            <JellyButton size="md">Medium</JellyButton>
            <JellyButton size="lg">Large</JellyButton>
          </div>

          <JellyButton block variant="primary">
            <template #leading>
              <SparkIcon />
            </template>
            带前置插槽
            <template #trailing>
              <ArrowIcon />
            </template>
          </JellyButton>
        </div>
      </JellySurface>
    </div>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
      <JellySurface padding="lg" radius="xl" tone="default" custom-class="jelly-brake-reveal jelly-brake-delay-2">
        <template #header>
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/45">Dropdown</p>
            <h2 class="mt-2 text-2xl font-semibold tracking-tight text-foreground">JellyDropdown</h2>
          </div>
        </template>

        <div class="grid gap-5 md:grid-cols-2">
          <div class="space-y-3">
            <p class="text-sm font-medium text-foreground/65">默认渲染</p>
            <JellyDropdown v-model="selectedPreset" :options="presetOptions" />
          </div>

          <div class="space-y-3">
            <p class="text-sm font-medium text-foreground/65">自定义 trigger / option 插槽</p>
            <JellyDropdown v-model="selectedTheme" :options="themeOptions">
              <template #trigger="{ selectedOption, open }">
                <div class="flex w-full items-center justify-between gap-4">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-foreground">
                      {{ selectedOption?.label || '选择主题' }}
                    </p>
                    <p class="truncate text-xs text-muted-foreground">
                      {{ selectedOption?.description || '自定义触发器插槽' }}
                    </p>
                  </div>
                  <span class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/18">
                    <ChevronIcon :class="open ? 'rotate-180 transition-transform duration-500' : 'transition-transform duration-500'" />
                  </span>
                </div>
              </template>

              <template #option="{ option, isSelected }">
                <div class="flex w-full items-center justify-between gap-4">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold" :class="isSelected ? 'text-foreground' : 'text-foreground/75'">
                      {{ option.label }}
                    </p>
                    <p class="truncate text-xs text-muted-foreground">{{ option.description }}</p>
                  </div>
                  <span
                    class="h-3.5 w-3.5 rounded-full border border-white/70"
                    :style="{ background: option.swatch }"
                  ></span>
                </div>
              </template>

              <template #footer="{ close }">
                <div class="flex justify-end">
                  <JellyButton size="sm" @click="close">关闭面板</JellyButton>
                </div>
              </template>
            </JellyDropdown>
          </div>
        </div>
      </JellySurface>

      <JellySurface padding="lg" radius="xl" tone="soft" custom-class="jelly-brake-reveal jelly-brake-delay-3">
        <template #header>
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/45">Modal</p>
            <h2 class="mt-2 text-2xl font-semibold tracking-tight text-foreground">JellyModal</h2>
          </div>
        </template>

        <div class="space-y-3">
          <p class="text-sm leading-7 text-foreground/62">
            支持默认标题模式，也支持完全自定义 `header`、`footer` 和 `close` 插槽。
          </p>
          <JellyButton block variant="primary" @click="showModal = true">
            展示刹车惯性弹窗
          </JellyButton>
        </div>
      </JellySurface>
    </div>

    <JellySurface padding="lg" radius="xl" tone="accent" custom-class="jelly-brake-reveal jelly-brake-delay-3">
      <template #header>
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/45">Usage</p>
          <h2 class="mt-2 text-2xl font-semibold tracking-tight text-foreground">组件接入建议</h2>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-3">
        <JellySurface v-for="tip in tips" :key="tip.title" padding="md" radius="xl" tone="soft">
          <p class="text-base font-semibold text-foreground">{{ tip.title }}</p>
          <p class="mt-2 text-sm leading-7 text-foreground/62">{{ tip.description }}</p>
        </JellySurface>
      </div>
    </JellySurface>

    <JellyModal
      v-model="showModal"
      eyebrow="Jelly Modal"
      title="组件弹窗展示"
      description="这里演示 `JellyModal` 的默认标题区、内容区和 footer 插槽。"
      max-width="2xl"
    >
      <div class="grid gap-4 md:grid-cols-2">
        <JellySurface padding="md" radius="xl" tone="soft">
          <template #header>
            <h3 class="text-lg font-semibold text-foreground">默认内容区</h3>
          </template>
          <p class="text-sm leading-7 text-foreground/62">
            可以放表单、确认说明、统计卡片，或者任何你自己的业务组件。
          </p>
        </JellySurface>

        <JellySurface padding="md" radius="xl" tone="default">
          <template #header>
            <h3 class="text-lg font-semibold text-foreground">当前状态</h3>
          </template>
          <div class="space-y-3 text-sm text-foreground/70">
            <div class="flex items-center justify-between">
              <span>preset</span>
              <span class="font-semibold text-foreground">{{ selectedPreset }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>theme</span>
              <span class="font-semibold text-foreground">{{ selectedTheme }}</span>
            </div>
          </div>
        </JellySurface>
      </div>

      <template #footer="{ close }">
        <div class="flex flex-wrap justify-end gap-3">
          <JellyButton @click="close">取消</JellyButton>
          <JellyButton variant="primary" @click="close">确认</JellyButton>
        </div>
      </template>
    </JellyModal>
  </div>
</template>

<script setup>
import { h, ref } from 'vue'
import { JellyButton, JellyDropdown, JellyModal, JellySurface } from '@/components/jelly'

const showModal = ref(false)
const selectedPreset = ref('ocean')
const selectedTheme = ref('aurora')

const stats = [
  { label: '可复用组件', value: '4', trend: '+1' },
  { label: '插槽入口', value: '10+', trend: 'flex' },
  { label: '动画方案', value: '4', trend: 'brake' },
]

const presetOptions = [
  { value: 'ocean', label: '海雾蓝', description: '高透玻璃，高光更冷。' },
  { value: 'mint', label: '薄荷冻', description: '更轻、更软的果冻层次。' },
  { value: 'sunrise', label: '晨光蜜桃', description: '暖色边缘更适合重点操作。' },
]

const themeOptions = [
  {
    value: 'aurora',
    label: 'Aurora',
    description: '青绿和暖光混合的水玻璃主题。',
    swatch: 'linear-gradient(135deg, rgba(45,212,191,0.95), rgba(255,255,255,0.9))',
  },
  {
    value: 'midnight',
    label: 'Midnight',
    description: '更适合深色工作台的冷感版本。',
    swatch: 'linear-gradient(135deg, rgba(56,189,248,0.95), rgba(30,41,59,0.95))',
  },
  {
    value: 'light',
    label: 'Light',
    description: '浅色背景下更干净、更通透。',
    swatch: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(125,211,252,0.82))',
  },
]

const tips = [
  {
    title: '先用 Surface 搭结构',
    description: '页面大区块优先用 `JellySurface`，保持材质层级统一，再在内部自由组合业务组件。',
  },
  {
    title: '按钮用 slot 接图标',
    description: '图标、状态点、方向箭头都建议通过 `leading` / `trailing` 插槽挂载，避免写死。',
  },
  {
    title: '弹层和下拉共用动效',
    description: '需要更强一致性时，优先复用 `brake-pop` 和 `brake-sheet`，不要另起一套 easing。',
  },
]

const SparkIcon = () => h('svg', { class: 'h-4 w-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' }),
])

const ArrowIcon = () => h('svg', { class: 'h-4 w-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 12h14m-5-5l5 5-5 5' }),
])

const ChevronIcon = (props = {}) => h('svg', { class: ['h-4 w-4', props.class], fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M6 9l6 6 6-6' }),
])
</script>
