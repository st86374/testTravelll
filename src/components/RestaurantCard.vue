<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { usePlaceInfo } from '../composables/usePlaceInfo'

const props = defineProps({
  restaurant: { type: Object, required: true },
})

const mapUrl = computed(() => props.restaurant?.mapUrl || '')
const { data: placeInfo, loading: placeLoading } = usePlaceInfo(mapUrl)

const displayName = computed(
  () => props.restaurant.name || placeInfo.value?.name || '(未命名)',
)
const displayAddress = computed(
  () => props.restaurant.address || placeInfo.value?.address || '',
)
const displayImage = computed(
  () => props.restaurant.photo || placeInfo.value?.image || '',
)
const displayRating = computed(() => {
  const r = props.restaurant.rating
  if (r != null) return Number(r)
  const r2 = placeInfo.value?.rating
  return r2 != null ? Number(r2) : null
})
const displayRatingCount = computed(() => {
  const c = props.restaurant.ratingCount
  if (c != null) return c
  return placeInfo.value?.ratingCount ?? null
})

const stars = computed(() => {
  const r = displayRating.value
  return r == null ? null : r.toFixed(1)
})
</script>

<template>
  <RouterLink
    :to="{ name: 'restaurant-detail', params: { id: restaurant.id } }"
    class="card overflow-hidden flex flex-col transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30"
  >
    <div
      v-if="displayImage"
      class="aspect-[16/9] w-full overflow-hidden"
      :style="{ background: 'var(--color-bg-soft)' }"
    >
      <img
        :src="displayImage"
        :alt="displayName"
        loading="lazy"
        referrerpolicy="no-referrer"
        class="w-full h-full object-cover"
      />
    </div>

    <div class="p-5 flex flex-col gap-3 flex-1">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="text-lg font-serif tracking-tight text-[var(--color-text)] truncate">
            {{ displayName }}
          </h3>
          <p class="mt-1 text-xs text-[var(--color-text-mute)] truncate">
            {{ [restaurant.area, restaurant.cuisine].filter(Boolean).join(' ・ ') || '—' }}
          </p>
        </div>
        <div
          v-if="stars"
          class="shrink-0 text-sm font-medium text-right"
          :style="{ color: 'var(--color-accent)' }"
        >
          <div>★ {{ stars }}</div>
          <div
            v-if="displayRatingCount != null"
            class="text-[10px] text-[var(--color-text-mute)] font-normal"
          >
            {{ Number(displayRatingCount).toLocaleString() }} 則評論
          </div>
        </div>
      </div>

      <p
        v-if="displayAddress"
        class="text-xs text-[var(--color-text-mute)] line-clamp-2"
      >📍 {{ displayAddress }}</p>

      <p
        v-if="restaurant.note"
        class="text-sm text-[var(--color-text-soft)] line-clamp-3"
      >
        {{ restaurant.note }}
      </p>

      <p
        v-if="restaurant.hours"
        class="text-xs text-[var(--color-text-mute)] line-clamp-1"
      >🕒 {{ restaurant.hours }}</p>

      <div v-if="restaurant.tags?.length" class="flex flex-wrap gap-1.5 pt-1">
        <span v-for="t in restaurant.tags" :key="t" class="chip">{{ t }}</span>
      </div>

      <p
        v-if="placeLoading && !displayAddress && !stars"
        class="text-[10px] text-[var(--color-text-mute)] mt-auto"
      >補抓 Google Maps 資料中…</p>
    </div>
  </RouterLink>
</template>
