<template>
  <div class="space-y-4">
    <!-- Standard Filters -->
    <FilterSidebar
      :filter-groups="filterGroups"
      :selected="selected"
      @update:selected="$emit('update:selected', $event)"
    />
    
    <!-- Dataset Type Filter -->
    <div class="border-t border-border/70 pt-4">
      <h4 class="mb-2 text-sm font-semibold text-foreground">Dataset Type</h4>
      <div class="space-y-1">
        <label
          v-for="type in datasetTypeFilters"
          :key="type.value"
          :class="filterOptionClass(isSelected('datasetType', type.value))"
        >
          <input
            type="checkbox"
            :value="type.value"
            :checked="selected.datasetType?.includes(type.value)"
            @change="toggleFilter('datasetType', type.value)"
            :class="checkboxClass"
          />
          <span class="text-sm" :class="isSelected('datasetType', type.value) ? 'text-foreground' : 'text-foreground/76'">
            {{ type.label }}
          </span>
          <span
            class="ml-auto text-xs tabular-nums"
            :class="isSelected('datasetType', type.value) ? 'text-primary' : 'text-muted-foreground'"
          >
            {{ type.count }}
          </span>
        </label>
      </div>
    </div>
    
    <!-- Autodriving-specific Filters (shown when autonomous-driving domain is selected) -->
    <div v-if="isAutodrivingSelected" class="rounded-[24px] border border-primary/18 bg-primary/8 p-4">
      <h4 class="mb-3 flex items-center space-x-1 text-sm font-semibold text-primary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.447-.894L15 7m0 13V7m0 0L9.553 4.553A1 1 0 009 4.118v.004" />
        </svg>
        <span>Autonomous Driving</span>
      </h4>
      
      <!-- Time Range Filter -->
      <div class="mb-3">
        <h5 class="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/56">Time Conditions</h5>
        <div class="space-y-1">
          <label
            v-for="time in timeRangeFilters"
            :key="time.value"
            :class="filterOptionClass(isSelected('timeRange', time.value))"
          >
            <input
              type="checkbox"
              :value="time.value"
              :checked="selected.timeRange?.includes(time.value)"
              @change="toggleFilter('timeRange', time.value)"
              :class="checkboxClass"
            />
            <span class="text-sm" :class="isSelected('timeRange', time.value) ? 'text-foreground' : 'text-foreground/76'">
              {{ time.label }}
            </span>
          </label>
        </div>
      </div>
      
      <!-- Weather Filter -->
      <div class="mb-3">
        <h5 class="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/56">Weather</h5>
        <div class="space-y-1">
          <label
            v-for="weather in weatherFilters"
            :key="weather.value"
            :class="filterOptionClass(isSelected('weather', weather.value))"
          >
            <input
              type="checkbox"
              :value="weather.value"
              :checked="selected.weather?.includes(weather.value)"
              @change="toggleFilter('weather', weather.value)"
              :class="checkboxClass"
            />
            <span class="text-sm" :class="isSelected('weather', weather.value) ? 'text-foreground' : 'text-foreground/76'">
              {{ weather.label }}
            </span>
          </label>
        </div>
      </div>
      
      <!-- Scene Type Filter -->
      <div class="mb-3">
        <h5 class="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/56">Scene Types</h5>
        <div class="space-y-1">
          <label
            v-for="scene in sceneTypeFilters"
            :key="scene.value"
            :class="filterOptionClass(isSelected('sceneType', scene.value))"
          >
            <input
              type="checkbox"
              :value="scene.value"
              :checked="selected.sceneType?.includes(scene.value)"
              @change="toggleFilter('sceneType', scene.value)"
              :class="checkboxClass"
            />
            <span class="text-sm" :class="isSelected('sceneType', scene.value) ? 'text-foreground' : 'text-foreground/76'">
              {{ scene.label }}
            </span>
          </label>
        </div>
      </div>
      
      <!-- Semantic Search -->
      <div class="mb-3">
        <h5 class="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/56">Semantic Search</h5>
        <input
          v-model="semanticQuery"
          type="text"
          placeholder="objects, scenes, actions..."
          :class="textInputClass"
          @input="updateSemanticQuery"
        />
      </div>
      
      <!-- Spatial Search -->
      <div class="mb-3">
        <h5 class="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/56">Spatial Search</h5>
        <input
          v-model="spatialQuery"
          type="text"
          placeholder="region or city..."
          :class="textInputClass"
          @input="updateSpatialQuery"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import FilterSidebar from '@/components/common/FilterSidebar.vue'
import { 
  domainFilters, 
  modalityFilters, 
  languageFilters, 
  licenseFilters,
  datasetTypeFilters,
  timeRangeFilters,
  weatherFilters,
  sceneTypeFilters
} from '@/data/filters.js'

const props = defineProps({
  selected: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:selected'])

const semanticQuery = ref(props.selected.semanticQuery || '')
const spatialQuery = ref(props.selected.spatialQuery || '')

const isAutodrivingSelected = computed(() => 
  props.selected.domain?.includes('autonomous-driving')
)

const filterGroups = [
  { key: 'domain', label: 'Domain', options: domainFilters, open: true },
  { key: 'modality', label: 'Modality', options: modalityFilters, open: true },
  { key: 'language', label: 'Languages', options: languageFilters, open: false },
  { key: 'license', label: 'Licenses', options: licenseFilters, open: false },
]

const checkboxClass = 'h-4 w-4 rounded border-border bg-card/70 text-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-0'
const textInputClass = 'w-full rounded-2xl border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10'

function toggleFilter(category, value) {
  const current = props.selected[category] || []
  const updated = current.includes(value)
    ? current.filter(v => v !== value)
    : [...current, value]
  
  emit('update:selected', {
    ...props.selected,
    [category]: updated
  })
}

function updateSemanticQuery() {
  emit('update:selected', {
    ...props.selected,
    semanticQuery: semanticQuery.value
  })
}

function updateSpatialQuery() {
  emit('update:selected', {
    ...props.selected,
    spatialQuery: spatialQuery.value
  })
}

function isSelected(category, value) {
  return (props.selected[category] || []).includes(value)
}

function filterOptionClass(active) {
  return [
    'flex cursor-pointer items-center gap-2 rounded-2xl border px-2.5 py-2 transition-all duration-200',
    active
      ? 'border-primary/25 bg-primary/12 text-foreground'
      : 'border-transparent text-foreground/72 hover:border-white/10 hover:bg-white/8 hover:text-foreground',
  ]
}
</script>
