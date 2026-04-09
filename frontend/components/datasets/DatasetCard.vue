<template>
  <article class="group block h-full cursor-pointer" @click="openDataset">
    <div class="dataset-card">
      <div class="flex items-start gap-2.5">
        <div class="dataset-card__avatar">
          {{ dataset.author.charAt(0).toUpperCase() }}
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-1.5">
            <h3
              class="truncate text-[15px] font-semibold tracking-[-0.02em] text-foreground"
            >
              {{ dataset.name || dataset.id }}
            </h3>
            <span
              v-if="dataset.datasetType"
              class="dataset-card__micro-pill"
              :class="
                dataset.datasetType === 'original'
                  ? 'dataset-card__micro-pill--green'
                  : 'dataset-card__micro-pill--blue'
              "
            >
              {{ dataset.datasetType === "original" ? "Original" : "Derived" }}
            </span>
            <span
              v-if="dataset.readonly"
              class="dataset-card__micro-pill dataset-card__micro-pill--red"
            >
              Read-only
            </span>
          </div>

          <p
            class="mt-1 truncate text-[11px] uppercase tracking-[0.14em] text-foreground/40"
          >
            {{ dataset.id }}
          </p>
        </div>

      </div>

      <p class="mt-3 line-clamp-2 text-[13px] leading-6 text-foreground/58">
        {{ dataset.description }}
      </p>

      <div class="mt-3 flex flex-wrap gap-1.5">
        <TagBadge
          :label="prettyLabel(dataset.domain)"
          :color="domainColorMap[dataset.domain] || 'gray'"
          size="2xs"
        />
        <TagBadge
          :label="prettyLabel(dataset.modality)"
          color="teal"
          size="2xs"
        />
        <TagBadge
          :label="prettyLabel(dataset.task)"
          :color="taskColorMap[dataset.task] || 'gray'"
          size="2xs"
        />
      </div>
      <div v-if="dataset.parentDataset" class="mt-2 flex items-center gap-1">
        <span class="text-xs text-gray-400">From:</span>
        <router-link
          :to="`/datasets/${dataset.parentDataset}`"
          class="text-xs text-blue-600 hover:underline hover:text-blue-700 flex items-center gap-0.5"
          @click.stop
        >
          {{ dataset.parentDataset }}
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </router-link>
      </div>
      <div
        v-if="
          dataset.domain === 'autonomous-driving' &&
          dataset.metadata?.sensors?.length
        "
        class="mt-3 flex flex-wrap gap-1.5"
      >
        <span
          v-for="sensor in dataset.metadata.sensors.slice(0, 3)"
          :key="sensor"
          class="rounded-full border border-white/10 bg-white/6 px-2 py-1 text-[10px] font-medium text-foreground/52"
        >
          {{ sensor }}
        </span>
      </div>

      <div
        class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-white/8 pt-3 text-[11px] text-foreground/48"
      >
        <StatBadge icon="download" :value="dataset.downloads" compact />
        <StatBadge icon="like" :value="dataset.likes" compact />
        <span class="dataset-card__meta"
          >{{ formatRows(dataset.rows) }} rows</span
        >
        <span class="dataset-card__meta">{{ dataset.size }}</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { useRouter } from "vue-router";
import TagBadge from "@/components/common/TagBadge.vue";
import StatBadge from "@/components/common/StatBadge.vue";
import { taskColorMap, domainColorMap } from "@/data/filters.js";

const props = defineProps({
  dataset: { type: Object, required: true },
});

const router = useRouter();

function openDataset() {
  router.push(`/datasets/${props.dataset.id}`);
}

function formatRows(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

function prettyLabel(value) {
  if (!value) return "";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
</script>

<style scoped>
.dataset-card {
  height: 100%;
  border: 1px solid hsl(var(--glass-highlight) / 0.16);
  border-radius: 24px;
  padding: 0.9rem;
  background:
    linear-gradient(
      180deg,
      hsl(var(--glass-highlight) / 0.14),
      transparent 72%
    ),
    linear-gradient(135deg, hsl(var(--card) / 0.8), hsl(var(--card) / 0.54));
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  box-shadow:
    inset 0 1px 0 hsl(var(--glass-highlight) / 0.36),
    0 14px 32px hsl(var(--glass-shadow) / 0.06);
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.group:hover .dataset-card {
  border-color: hsl(var(--glass-highlight) / 0.26);
  box-shadow:
    inset 0 1px 0 hsl(var(--glass-highlight) / 0.46),
    0 18px 36px hsl(var(--glass-shadow) / 0.09);
  transform: translateY(-2px);
}

.dataset-card__avatar {
  display: inline-flex;
  height: 2.2rem;
  width: 2.2rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  border: 1px solid hsl(var(--glass-highlight) / 0.12);
  background: hsl(var(--glass-highlight) / 0.08);
  color: hsl(var(--foreground) / 0.74);
  font-size: 2rem;
  font-weight: 700;
}

.dataset-card__micro-pill {
  display: inline-flex;
  align-items: center;
  border-width: 1px;
  border-radius: 999px;
  padding: 0.15rem 0.5rem;
  font-size: 0.625rem;
  font-weight: 600;
}

.dataset-card__micro-pill--green {
  border-color: rgb(16 185 129 / 0.2);
  background: rgb(16 185 129 / 0.12);
  color: rgb(6 95 70);
}

.dataset-card__micro-pill--blue {
  border-color: rgb(59 130 246 / 0.2);
  background: rgb(59 130 246 / 0.12);
  color: rgb(30 64 175);
}

.dataset-card__micro-pill--red {
  border-color: rgb(244 63 94 / 0.18);
  background: rgb(244 63 94 / 0.1);
  color: rgb(159 18 57);
}

.dataset-card__arrow {
  display: inline-flex;
  height: 1.9rem;
  width: 1.9rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid hsl(var(--glass-highlight) / 0.1);
  background: hsl(var(--glass-highlight) / 0.06);
  color: hsl(var(--foreground) / 0.42);
}

.group:hover .dataset-card__arrow {
  color: hsl(var(--foreground) / 0.72);
  background: hsl(var(--glass-highlight) / 0.12);
}

.dataset-card__meta {
  white-space: nowrap;
}

.dataset-card__meta::before {
  display: inline-flex;
  content: "";
  width: 0.22rem;
  height: 0.22rem;
  margin-right: 0.42rem;
  border-radius: 999px;
  background: hsl(var(--foreground) / 0.24);
}

.dataset-card__source {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid hsl(var(--glass-highlight) / 0.1);
  border-radius: 999px;
  background: hsl(var(--glass-highlight) / 0.06);
  padding: 0.375rem 0.6rem;
  font-size: 0.6875rem;
  font-weight: 500;
  color: hsl(var(--foreground) / 0.58);
  transition:
    background-color 160ms ease,
    color 160ms ease,
    border-color 160ms ease;
}

.dataset-card__source:hover {
  border-color: hsl(var(--glass-highlight) / 0.2);
  background: hsl(var(--glass-highlight) / 0.12);
  color: hsl(var(--foreground) / 0.84);
}
</style>
