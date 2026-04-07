<template>
  <aside :class="['operator-panel', { 'panel-open': open }]" @click.stop>
    <!-- Category Filter -->
    <div class="category-section">
      <div class="category-tabs">
        <button
          v-for="category in categories"
          :key="category.key"
          @click="handleCategoryClick(category.key)"
          :class="['category-tab', { active: activeCategory === category.key }]"
        >
          {{ category.label }}
        </button>
      </div>
    </div>

    <!-- Search Section -->
    <div class="search-section">
      <div class="search-wrapper">
        <div class="search-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索算子..."
          class="search-input"
          @input="handleSearchInput"
        />
        <button v-if="searchQuery" @click="clearSearch" class="search-clear">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div v-if="searchQuery.trim()" class="search-results-info">
        <span class="results-count">{{ filteredOperators.length }} 个结果</span>
        <span class="search-term">"{{ searchQuery.trim() }}"</span>
      </div>
    </div>

    <!-- Operator List -->
    <div class="operator-list">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载算子中...</div>
      </div>

      <!-- Operator Grid -->
      <div v-else-if="filteredOperators.length > 0" class="operator-grid">
        <div
          v-for="operator in filteredOperators"
          :key="operator.id"
          :draggable="true"
          @dragstart="handleDragStart($event, operator)"
          @dragend="handleDragEnd"
          class="operator-card"
        >
          <div class="operator-header">
            <div class="operator-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 21H5V3H14V9H19Z"/>
              </svg>
            </div>
            <div class="operator-meta">
              <div class="operator-name">{{ operator.name }}</div>
              <div class="operator-type">{{ operator.type }}</div>
            </div>
          </div>
          <div class="operator-description">
            <div
              v-if="operator.description && operator.description !== '暂无描述'"
              v-html="formatDescription(operator.description)"
              class="description-content"
            ></div>
            <div v-else class="description-placeholder">暂无描述</div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state-container">
        <div class="empty-state-content">
          <div class="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 21H5V3H14V9H19Z"/>
            </svg>
          </div>
          <div class="empty-state-title">暂无可用算子</div>
          <div class="empty-state-subtitle">请检查网络连接或稍后重试</div>
          <button class="refresh-button" @click="$emit('refresh')">
            <svg class="refresh-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12S7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12S8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z"/>
            </svg>
            刷新算子列表
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  // 面板是否打开
  open: {
    type: Boolean,
    default: false
  },
  // 由父组件（OperatorWorkflow）传入的算子列表，与 useNodes 共用同一份引用
  operators: {
    type: Array,
    default: () => []
  },
  // 加载状态由父组件控制
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['refresh'])

// ---- 分类配置（面板内部状态）----
const categories = ref([
  { key: 'all',             label: '全部' },
  { key: 'parser',          label: '解析' },
  { key: 'data-process',    label: '处理' },
  { key: 'data-synthesis',  label: '合成' },
  { key: 'data-evaluation', label: '评估' },
])
const activeCategory = ref('all')

// ---- 搜索状态（面板内部）----
const searchQuery = ref('')

// ---- 筛选后的算子列表 ----
const filteredOperators = computed(() => {
  let list = props.operators

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(op =>
      (op.name || '').toLowerCase().includes(q) ||
      (op.type || '').toLowerCase().includes(q) ||
      (op.description || '').toLowerCase().includes(q)
    )
  } else if (activeCategory.value !== 'all') {
    list = list.filter(op => op.category === activeCategory.value)
  }

  return [...list].sort((a, b) =>
    (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
  )
})

// ---- 分类/搜索操作 ----
const handleCategoryClick = (key) => {
  searchQuery.value = ''
  activeCategory.value = key
}

const handleSearchInput = () => {
  if (searchQuery.value.trim()) activeCategory.value = 'all'
}

const clearSearch = () => {
  searchQuery.value = ''
  activeCategory.value = 'all'
}

// ---- 拖拽 ----
const handleDragStart = (event, operator) => {
  event.dataTransfer.setData('application/json', JSON.stringify(operator))
  event.dataTransfer.effectAllowed = 'copy'
}

const handleDragEnd = () => {}

// ---- 工具方法 ----
const formatDescription = (description) => {
  if (!description || description === '暂无描述') return ''
  return description
    .replace(/\n/g, '<br>')
    .replace(/输入参数：/g, '<strong>输入参数：</strong>')
    .replace(/输出参数：/g, '<strong>输出参数：</strong>')
    .replace(/^<br>/, '')
}
</script>

<style scoped>
/* ===== 面板容器 ===== */
.operator-panel {
  position: absolute;
  top: 0;
  left: -320px;
  width: 280px;
  height: 100%;
  background: var(--apple-background);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 2001;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.04), 0 16px 32px rgba(0, 0, 0, 0.08);
}

.operator-panel.panel-open {
  left: 0;
}

/* ===== 分类 Tab ===== */
.category-section {
  padding: 16px 12px;
  background: var(--apple-background);
  border-bottom: 1px solid var(--apple-separator);
}

.category-tabs {
  display: flex;
  gap: 2px;
  background: var(--apple-gray-1);
  border-radius: 8px;
  padding: 2px;
}

.category-tab {
  flex: 1;
  padding: 6px 4px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--apple-secondary-label);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  text-align: center;
}

.category-tab.active {
  background: var(--apple-background);
  color: var(--apple-label);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.category-tab:hover:not(.active):not(.disabled) {
  background: var(--apple-gray-2);
  color: var(--apple-label);
}

.category-tab.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: transparent;
  color: var(--apple-tertiary-label);
}

.category-tab.disabled:hover {
  background: transparent;
  color: var(--apple-tertiary-label);
}

.category-tab:focus {
  outline: 2px solid var(--apple-blue);
  outline-offset: 2px;
}

/* ===== 搜索区域 ===== */
.search-section {
  padding: 12px;
  background: var(--apple-background);
  border-bottom: 1px solid var(--apple-separator);
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  height: 36px;
  padding: 8px 16px 8px 40px;
  border: 1.5px solid var(--apple-gray-3);
  border-radius: 18px;
  background: var(--apple-gray-1);
  color: var(--apple-label);
  font-size: 14px;
  font-weight: 400;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  transition: all 0.2s ease;
  outline: none;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: var(--apple-blue);
  background: var(--apple-background);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.search-input::placeholder {
  color: var(--apple-tertiary-label);
  font-style: normal;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--apple-tertiary-label);
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.search-wrapper:focus-within .search-icon {
  color: var(--apple-blue);
}

.search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 10px;
  background: var(--apple-gray-4);
  color: var(--apple-background);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0.8;
}

.search-clear:hover {
  background: var(--apple-gray-5);
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

.search-clear:active {
  transform: translateY(-50%) scale(0.95);
}

.search-results-info {
  margin-top: 8px;
  padding: 4px 8px;
  font-size: 12px;
  color: var(--apple-secondary-label);
  background: var(--apple-gray-1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.results-count {
  font-weight: 500;
  color: var(--apple-label);
}

.search-term {
  font-weight: 400;
  color: var(--apple-blue);
}

/* ===== 算子列表 ===== */
.operator-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background: var(--apple-background);
}

.operator-list::-webkit-scrollbar {
  width: 4px;
}

.operator-list::-webkit-scrollbar-track {
  background: transparent;
}

.operator-list::-webkit-scrollbar-thumb {
  background: var(--apple-gray-4);
  border-radius: 2px;
}

.operator-list::-webkit-scrollbar-thumb:hover {
  background: var(--apple-gray-5);
}

.operator-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  width: 100%;
}

/* ===== 算子卡片 ===== */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.operator-card {
  background: var(--apple-background);
  border: 1px solid var(--apple-gray-2);
  border-radius: 12px;
  padding: 12px;
  cursor: grab;
  transition: all 0.2s ease;
  position: relative;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  animation: fadeIn 0.3s ease-out;
}

.operator-card:hover {
  border-color: var(--apple-blue);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.08);
  transform: translateY(-1px);
}

.operator-card:active {
  cursor: grabbing;
  transform: translateY(0) scale(0.98);
}

.operator-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
}

.operator-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--apple-blue), var(--apple-blue-light));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.operator-icon svg {
  width: 18px;
  height: 18px;
}

.operator-meta {
  flex: 1;
  min-width: 0;
}

.operator-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--apple-label);
  margin-bottom: 2px;
  line-height: 1.3;
}

.operator-type {
  font-size: 11px;
  font-weight: 500;
  color: var(--apple-blue);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  line-height: 1.2;
}

.operator-description {
  font-size: 12px;
  font-weight: 400;
  color: var(--apple-secondary-label);
  line-height: 1.4;
  margin-top: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.description-content {
  white-space: normal;
}

.description-content strong {
  font-weight: 600;
  color: var(--apple-label);
  display: block;
  margin-top: 6px;
  margin-bottom: 2px;
}

.description-content strong:first-child {
  margin-top: 0;
}

.description-placeholder {
  color: var(--apple-tertiary-label);
  font-style: italic;
}

/* ===== 加载状态 ===== */
@keyframes spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--apple-gray-3);
  border-top: 2px solid var(--apple-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--apple-secondary-label);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

/* ===== 空状态 ===== */
.empty-state-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  padding: 32px 16px;
}

.empty-state-content {
  text-align: center;
  max-width: 240px;
}

.empty-state-icon {
  margin-bottom: 16px;
  color: var(--apple-gray-4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--apple-label);
  margin-bottom: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.empty-state-subtitle {
  font-size: 14px;
  font-weight: 400;
  color: var(--apple-secondary-label);
  margin-bottom: 24px;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.refresh-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  background: var(--apple-blue);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.25);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  min-height: 44px;
}

.refresh-button:hover {
  background: var(--apple-blue-light);
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.refresh-button:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.2);
}

.refresh-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.refresh-button:hover .refresh-icon {
  transform: rotate(180deg);
}

/* ===== 响应式 ===== */
@media (max-width: 1024px) {
  .operator-panel {
    width: 260px;
    left: -280px;
  }

  .category-section {
    padding: 12px 8px;
  }

  .operator-list {
    padding: 8px;
  }
}
</style>
