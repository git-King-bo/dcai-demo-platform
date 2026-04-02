# Jelly Components

`frontend/components/jelly/` 提供一组可复用的“水玻璃 / 果冻”风格基础组件。

适用场景：
- 需要统一的玻璃拟态容器、按钮、下拉框、弹窗
- 需要高扩展性和自定义插槽能力
- 需要更有“刹车惯性”感觉的过渡动画

## 目录

```text
frontend/components/jelly/
├── JellySurface.vue
├── JellyButton.vue
├── JellyDropdown.vue
├── JellyModal.vue
└── index.js
```

## 快速开始

```js
import { JellyButton, JellyDropdown, JellyModal, JellySurface } from '@/components/jelly'
```

## JellySurface

通用玻璃容器，适合作为卡片、面板、区块容器。

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string` | `'div'` | 渲染标签，例如 `div`、`article`、`button` |
| `padding` | `string` | `'md'` | 内边距，支持 `sm` `md` `lg` `xl` |
| `radius` | `string` | `'xl'` | 圆角，支持 `lg` `xl` `2xl` `full` |
| `tone` | `string` | `'default'` | 视觉层次，支持 `default` `soft` `accent` |
| `elevated` | `boolean` | `false` | 是否增加更强悬浮阴影 |
| `bodyClass` | `string` | `''` | 内容区域附加类名 |
| `customClass` | `string` | `''` | 外层附加类名 |

### Slots

| Slot | Description |
| --- | --- |
| `header` | 顶部区域 |
| `default` | 主内容区域 |
| `footer` | 底部区域 |

### 示例

```vue
<JellySurface as="article" padding="lg" radius="xl" tone="accent" elevated>
  <template #header>
    <h3 class="text-xl font-semibold">系统概览</h3>
  </template>

  <p>这里放卡片内容。</p>

  <template #footer>
    <div class="flex justify-end">
      <JellyButton>查看详情</JellyButton>
    </div>
  </template>
</JellySurface>
```

## JellyButton

带果冻高光和阻尼过渡的按钮组件。

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tag` | `string` | `'button'` | 渲染标签 |
| `type` | `string` | `'button'` | 原生按钮类型 |
| `variant` | `string` | `'default'` | 样式，支持 `default` `primary` `ghost` |
| `size` | `string` | `'md'` | 尺寸，支持 `sm` `md` `lg` |
| `block` | `boolean` | `false` | 是否撑满宽度 |
| `disabled` | `boolean` | `false` | 禁用态 |
| `customClass` | `string` | `''` | 附加类名 |

### Slots

| Slot | Description |
| --- | --- |
| `leading` | 前置内容，常用于图标 |
| `default` | 按钮文本 |
| `trailing` | 后置内容，常用于箭头、状态点 |

### 示例

```vue
<JellyButton variant="primary" size="lg">
  <template #leading>
    <PlusIcon />
  </template>
  新建面板
</JellyButton>
```

## JellyDropdown

支持自定义触发器和选项渲染的下拉组件。

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `string \| number` | `''` | 当前值 |
| `options` | `Array` | `[]` | 选项数组，建议使用 `{ value, label, description }` |
| `placeholder` | `string` | `'Select an option'` | 未选中占位文案 |
| `block` | `boolean` | `true` | 是否撑满宽度 |
| `closeOnSelect` | `boolean` | `true` | 选中后是否关闭 |
| `triggerClass` | `string` | `''` | trigger 附加类名 |
| `panelClass` | `string` | `''` | 面板附加类名 |

### Emits

| Event | Description |
| --- | --- |
| `update:modelValue` | 更新绑定值 |
| `change` | 选择后回调 |
| `open` | 打开面板 |
| `close` | 关闭面板 |

### Slots

| Slot | Description |
| --- | --- |
| `trigger` | 自定义触发器，提供 `{ open, selectedOption }` |
| `option` | 自定义选项，提供 `{ option, isSelected }` |
| `footer` | 面板底部扩展区，提供 `{ close }` |

### 示例

```vue
<JellyDropdown v-model="preset" :options="presets">
  <template #trigger="{ selectedOption, open }">
    <div class="flex items-center justify-between">
      <span>{{ selectedOption?.label || '请选择' }}</span>
      <ChevronIcon :class="open ? 'rotate-180' : ''" />
    </div>
  </template>
</JellyDropdown>
```

## JellyModal

带 Teleport、遮罩层和“刹车惯性”入场动画的弹窗组件。

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | `false` | 是否显示 |
| `title` | `string` | `''` | 默认标题 |
| `description` | `string` | `''` | 默认描述 |
| `eyebrow` | `string` | `''` | 标题上方辅助文案 |
| `transitionName` | `string` | `'brake-sheet'` | 过渡动画名 |
| `maxWidth` | `string` | `'xl'` | 最大宽度，支持 `md` `lg` `xl` `2xl` |
| `padded` | `boolean` | `true` | 是否内置 padding |
| `closeOnOverlay` | `boolean` | `true` | 点击遮罩是否关闭 |
| `closeOnEscape` | `boolean` | `true` | 按 `Escape` 是否关闭 |
| `customClass` | `string` | `''` | 外层附加类名 |

### Emits

| Event | Description |
| --- | --- |
| `update:modelValue` | 更新显示状态 |
| `open` | 打开弹层时触发 |
| `close` | 关闭弹层时触发 |

### Slots

| Slot | Description |
| --- | --- |
| `header` | 自定义头部 |
| `default` | 主内容，提供 `{ close }` |
| `footer` | 底部操作区，提供 `{ close }` |
| `close` | 自定义关闭按钮，提供 `{ close }` |

### 示例

```vue
<JellyModal v-model="showModal" title="创建工作区" max-width="2xl">
  <div>这里放表单内容</div>

  <template #footer="{ close }">
    <div class="flex justify-end gap-3">
      <JellyButton @click="close">取消</JellyButton>
      <JellyButton variant="primary" @click="close">确认</JellyButton>
    </div>
  </template>
</JellyModal>
```

## 动画说明

`frontend/assets/main.css` 中已经定义了以下动画：

- `brake-pop`
- `brake-sheet`
- `brake-fade`
- `jelly-brake-reveal`

这些动画会表现出“先冲一下，再拉回”的阻尼感，适合下拉框、面板进场和弹窗打开。

## Demo 页面

项目内已提供演示页面：

```text
/jelly-demo
```

对应文件：

```text
frontend/views/JellyComponentsDemoPage.vue
```
