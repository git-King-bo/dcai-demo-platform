<template>
  <div class="datasets-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="lg:grid lg:grid-cols-4 lg:gap-6">
      <!-- Sidebar -->
      <aside class="hidden lg:block lg:col-span-1">
        <div class="datasets-page__panel datasets-page__panel--sidebar sticky top-20">
          <SearchBar v-model="searchQuery" :placeholder="$t('datasets.searchPlaceholder')" />
          <div class="mt-4">
            <DatasetFilters v-model:selected="filters" />
          </div>
          <button
            v-if="activeFilterCount > 0"
            @click="clearFilters"
            class="datasets-page__clear mt-3"
          >
            {{ $t('common.clearAllFilters') }} ({{ activeFilterCount }})
          </button>
        </div>
      </aside>
      <!-- Main content -->
      <div class="lg:col-span-3">
        <div class="datasets-page__toolbar flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2 lg:hidden">
            <button @click="showMobileFilters = !showMobileFilters" class="datasets-page__mobile-filter">
              {{ $t('common.filters') }}
              <span v-if="activeFilterCount" class="datasets-page__mobile-filter-badge">{{ activeFilterCount }}</span>
            </button>
          </div>
          <div class="w-full max-w-[260px] lg:w-[260px]">
            <JellyDropdown
              v-model="sortBy"
              :options="sortDropdownOptions"
              :placeholder="$t('common.sort')"
              :ui="sortDropdownUi"
            />
          </div>
          <div class="hidden text-sm font-medium text-foreground/58 lg:block">
            {{ $t('datasets.count', { count: totalItems }) }}
          </div>

        </div>
        <!-- Mobile filters -->
        <div v-if="showMobileFilters" class="datasets-page__panel datasets-page__panel--mobile lg:hidden mb-4">
          <SearchBar v-model="searchQuery" :placeholder="$t('datasets.searchPlaceholder')" />
          <div class="mt-3">
            <DatasetFilters v-model:selected="filters" />
          </div>
        </div>
        <!-- Results -->
        <div v-if="paginatedItems.length" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DatasetCard v-for="ds in paginatedItems" :key="ds.id" :dataset="ds" />
        </div>
        <div v-else class="datasets-page__empty text-center py-16">
          <p class="datasets-page__empty-title">{{ $t('datasets.noResults') }}</p>
          <p class="datasets-page__empty-hint text-sm mt-1">{{ $t('datasets.noResultsHint') }}</p>
        </div>
        <div v-show="totalPages > 1" class="datasets-page__pagination">
          <PaginationBar v-model="currentPage" :total-pages="totalPages" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { datasetApi } from '@/services/api.js'
import { sortOptions } from '@/data/filters.js'
import { useSearch } from '@/composables/useSearch.js'
import { usePagination } from '@/composables/usePagination.js'
import SearchBar from '@/components/common/SearchBar.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import DatasetCard from '@/components/datasets/DatasetCard.vue'
import DatasetFilters from '@/components/datasets/DatasetFilters.vue'
import JellyDropdown from '@/components/jelly/JellyDropdown.vue'

const { t } = useI18n()
const showMobileFilters = ref(false)
const datasets = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    datasets.value = await datasetApi.getDatasets()
  } catch (error) {
    console.error('Failed to load datasets:', error)
  } finally {
    loading.value = false
  }
})

const { searchQuery, filters, sortBy, filtered, clearFilters, activeFilterCount } = useSearch(datasets, { defaultSort: 'default' })
const { currentPage, totalPages, paginatedItems, totalItems } = usePagination(filtered, 12)

const sortDropdownOptions = computed(() =>
  sortOptions.map((option) => ({
    ...option,
  }))
)

const sortDropdownUi = {
  panelClass: 'z-[90]',
  listClass: 'space-y-0.5',
  listStyle: {
    maxHeight: '16rem',
    scrollbarGutter: 'stable',
  },
  optionClass: 'rounded-[16px] px-3 py-2.5',
  panelStyle: {
    background:
      'linear-gradient(180deg, hsl(var(--glass-highlight) / 0.18), hsl(var(--glass-highlight) / 0.08)), linear-gradient(135deg, hsl(var(--popover) / 0.94), hsl(var(--card) / 0.78))',
  },
}
</script>

<style scoped>
.datasets-page__panel,
.datasets-page__toolbar,
.datasets-page__empty,
.datasets-page__pagination {
  border: 1px solid hsl(var(--glass-highlight) / 0.18);
  background:
    linear-gradient(180deg, hsl(var(--glass-highlight) / 0.16), transparent 72%),
    linear-gradient(135deg, hsl(var(--card) / 0.78), hsl(var(--card) / 0.52));
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  box-shadow:
    inset 0 1px 0 hsl(var(--glass-highlight) / 0.42),
    0 18px 44px hsl(var(--glass-shadow) / 0.08);
}

.datasets-page__panel {
  border-radius: 30px;
  padding: 1.15rem;
}

.datasets-page__panel--sidebar {
  overflow: hidden;
}

.datasets-page__panel--mobile {
  border-radius: 24px;
  padding: 1rem;
}

.datasets-page__toolbar {
  position: relative;
  z-index: 20;
  border-radius: 24px;
  padding: 0.85rem 1rem;
}

.datasets-page__mobile-filter {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid hsl(var(--glass-highlight) / 0.16);
  border-radius: 18px;
  padding: 0.6rem 0.85rem;
  background: hsl(var(--glass-highlight) / 0.08);
  color: hsl(var(--foreground) / 0.68);
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 180ms ease, color 180ms ease;
}

.datasets-page__mobile-filter:hover {
  background: hsl(var(--glass-highlight) / 0.14);
  color: hsl(var(--foreground) / 1);
}

.datasets-page__mobile-filter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.35rem;
  border-radius: 999px;
  padding: 0.1rem 0.4rem;
  background: linear-gradient(135deg, hsl(var(--theme-glow-a) / 0.92), hsl(var(--theme-glow-b) / 0.76));
  color: hsl(var(--primary-foreground) / 1);
  font-size: 0.75rem;
  font-weight: 700;
}

.datasets-page__clear {
  font-size: 0.75rem;
  color: hsl(var(--foreground) / 0.54);
  text-decoration: underline;
  text-decoration-color: hsl(var(--glass-highlight) / 0.24);
  text-underline-offset: 0.25rem;
  transition: color 180ms ease;
}

.datasets-page__clear:hover {
  color: hsl(var(--foreground) / 0.92);
}

.datasets-page__empty {
  border-radius: 30px;
  color: hsl(var(--foreground) / 0.58);
}

.datasets-page__empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: hsl(var(--foreground) / 0.9);
}

.datasets-page__empty-hint {
  color: hsl(var(--foreground) / 0.52);
}

.datasets-page__pagination {
  margin-top: 1rem;
  border-radius: 24px;
  padding: 0.25rem 0.75rem 0.75rem;
  position: relative;
  z-index: 1;
}
</style>
