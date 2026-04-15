<template>
  <div class="space-y-4">
    <!-- Dataset Type Filter -->
    <div>
      <h4 class="mb-2 text-sm font-semibold text-foreground">Dataset Type</h4>
      <div class="space-y-1">
        <label
          v-for="type in datasetTypeFilters"
          :key="type.value"
          :class="filterOptionClass(isSelected('datasetTypes', type.value))"
        >
          <input
            type="checkbox"
            :value="type.value"
            :checked="selected.datasetTypes?.includes(type.value)"
            @change="toggleFilter('datasetTypes', type.value)"
            :class="checkboxClass"
          />
          <span class="text-sm" :class="isSelected('datasetTypes', type.value) ? 'text-foreground' : 'text-foreground/76'">
            {{ type.label }}
          </span>
          <span
            class="ml-auto text-xs tabular-nums"
            :class="isSelected('datasetTypes', type.value) ? 'text-primary' : 'text-muted-foreground'"
          >
            {{ formatCount(type.count) }}
          </span>
        </label>
      </div>
    </div>

    <!-- Time Range Filter -->
    <div>
      <h4 class="mb-2 text-sm font-semibold text-foreground">Time Conditions</h4>
      <div class="space-y-1">
        <label
          v-for="time in timeRangeFilters"
          :key="time.value"
          :class="filterOptionClass(isSelected('timeRanges', time.value))"
        >
          <input
            type="checkbox"
            :value="time.value"
            :checked="selected.timeRanges?.includes(time.value)"
            @change="toggleFilter('timeRanges', time.value)"
            :class="checkboxClass"
          />
          <span class="text-sm" :class="isSelected('timeRanges', time.value) ? 'text-foreground' : 'text-foreground/76'">
            {{ time.label }}
          </span>
          <span
            class="ml-auto text-xs tabular-nums"
            :class="isSelected('timeRanges', time.value) ? 'text-primary' : 'text-muted-foreground'"
          >
            {{ formatCount(time.count) }}
          </span>
        </label>
      </div>
    </div>

    <!-- Weather Filter -->
    <div>
      <h4 class="mb-2 text-sm font-semibold text-foreground">Weather Conditions</h4>
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
          <span
            class="ml-auto text-xs tabular-nums"
            :class="isSelected('weather', weather.value) ? 'text-primary' : 'text-muted-foreground'"
          >
            {{ formatCount(weather.count) }}
          </span>
        </label>
      </div>
    </div>

    <!-- Scene Type Filter -->
    <div>
      <h4 class="mb-2 text-sm font-semibold text-foreground">Scene Types</h4>
      <div class="space-y-1">
        <label
          v-for="scene in sceneTypeFilters"
          :key="scene.value"
          :class="filterOptionClass(isSelected('sceneTypes', scene.value))"
        >
          <input
            type="checkbox"
            :value="scene.value"
            :checked="selected.sceneTypes?.includes(scene.value)"
            @change="toggleFilter('sceneTypes', scene.value)"
            :class="checkboxClass"
          />
          <span class="text-sm" :class="isSelected('sceneTypes', scene.value) ? 'text-foreground' : 'text-foreground/76'">
            {{ scene.label }}
          </span>
          <span
            class="ml-auto text-xs tabular-nums"
            :class="isSelected('sceneTypes', scene.value) ? 'text-primary' : 'text-muted-foreground'"
          >
            {{ formatCount(scene.count) }}
          </span>
        </label>
      </div>
    </div>

    <!-- Annotation Type Filter -->
    <div>
      <h4 class="mb-2 text-sm font-semibold text-foreground">Annotation Types</h4>
      <div class="space-y-1">
        <label
          v-for="ann in annotationTypeFilters"
          :key="ann.value"
          :class="filterOptionClass(isSelected('annotations', ann.value))"
        >
          <input
            type="checkbox"
            :value="ann.value"
            :checked="selected.annotations?.includes(ann.value)"
            @change="toggleFilter('annotations', ann.value)"
            :class="checkboxClass"
          />
          <span class="text-sm" :class="isSelected('annotations', ann.value) ? 'text-foreground' : 'text-foreground/76'">
            {{ ann.label }}
          </span>
          <span
            class="ml-auto text-xs tabular-nums"
            :class="isSelected('annotations', ann.value) ? 'text-primary' : 'text-muted-foreground'"
          >
            {{ formatCount(ann.count) }}
          </span>
        </label>
      </div>
    </div>

    <!-- Semantic Search -->
    <div>
      <h4 class="mb-2 text-sm font-semibold text-foreground">Semantic Search</h4>
      <div class="space-y-2">
        <input
          v-model="semanticQuery"
          type="text"
          placeholder="Search objects, scenes, actions..."
          :class="textInputClass"
          @input="updateSemanticSearch"
        />
        <div v-if="selected.semanticTags?.length" class="flex flex-wrap gap-1">
          <span 
            v-for="tag in selected.semanticTags" 
            :key="tag"
            class="flex items-center space-x-1 rounded-full border border-primary/20 bg-primary/12 px-2 py-1 text-xs text-primary"
          >
            {{ tag }}
            <button @click="removeSemanticTag(tag)" class="transition-colors hover:text-foreground">×</button>
          </span>
        </div>
      </div>
    </div>

    <!-- Spatial Search -->
    <div>
      <h4 class="mb-2 text-sm font-semibold text-foreground">Spatial Bounds</h4>
      <div class="space-y-2">
        <input
          v-model="spatialQuery"
          type="text"
          placeholder="Region name or coordinates..."
          :class="textInputClass"
          @input="updateSpatialSearch"
        />
        <div class="grid grid-cols-2 gap-2">
          <input
            v-model="latRange[0]"
            type="number"
            step="0.01"
            placeholder="Min Lat"
            :class="compactInputClass"
            @input="updateLatRange"
          />
          <input
            v-model="latRange[1]"
            type="number"
            step="0.01"
            placeholder="Max Lat"
            :class="compactInputClass"
            @input="updateLatRange"
          />
          <input
            v-model="lonRange[0]"
            type="number"
            step="0.01"
            placeholder="Min Lon"
            :class="compactInputClass"
            @input="updateLonRange"
          />
          <input
            v-model="lonRange[1]"
            type="number"
            step="0.01"
            placeholder="Max Lon"
            :class="compactInputClass"
            @input="updateLonRange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  datasetTypeFilters,
  timeRangeFilters,
  weatherFilters,
  sceneTypeFilters,
  annotationTypeFilters
} from '@/data/filters.js'

const props = defineProps({
  selected: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:selected'])

const semanticQuery = ref('')
const spatialQuery = ref('')
const latRange = ref([null, null])
const lonRange = ref([null, null])

const checkboxClass = 'h-4 w-4 rounded border-border bg-card/70 text-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-0'
const textInputClass = 'w-full rounded-2xl border border-border/70 bg-card/70 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10'
const compactInputClass = 'rounded-xl border border-border/70 bg-card/70 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10'

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

function updateSemanticSearch() {
  // Debounce and update semantic tags
  const tags = semanticQuery.value
    .split(/[,\s]+/)
    .filter(t => t.trim())
  
  emit('update:selected', {
    ...props.selected,
    semanticQuery: semanticQuery.value,
    semanticTags: tags
  })
}

function removeSemanticTag(tag) {
  const tags = (props.selected.semanticTags || []).filter(t => t !== tag)
  semanticQuery.value = tags.join(' ')
  emit('update:selected', {
    ...props.selected,
    semanticTags: tags
  })
}

function updateSpatialSearch() {
  emit('update:selected', {
    ...props.selected,
    spatialQuery: spatialQuery.value
  })
}

function updateLatRange() {
  emit('update:selected', {
    ...props.selected,
    latRange: latRange.value.filter(v => v !== null).length === 2 ? latRange.value : null
  })
}

function updateLonRange() {
  emit('update:selected', {
    ...props.selected,
    lonRange: lonRange.value.filter(v => v !== null).length === 2 ? lonRange.value : null
  })
}

function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
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
