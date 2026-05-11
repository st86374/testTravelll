<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useRestaurants } from '../composables/useRestaurants'
import { usePlaceInfo } from '../composables/usePlaceInfo'

const route = useRoute()
const { data, loading } = useRestaurants()

const restaurant = computed(() =>
  data.value.find((r) => String(r.id) === String(route.params.id)),
)

// 響應式追蹤這間店的 mapUrl，丟給 usePlaceInfo 去抓 Google Maps 內容
const mapUrl = computed(() => restaurant.value?.mapUrl || '')
const { data: placeInfo, loading: placeLoading, error: placeError } = usePlaceInfo(mapUrl)

// 真正要顯示的資料：表單填了就用表單，沒填就 fallback 到從網址抓回來的
const displayName = computed(
  () => restaurant.value?.name || placeInfo.value?.name || '(未命名)',
)
const displayAddress = computed(
  () => restaurant.value?.address || placeInfo.value?.address || '',
)
const displayRating = computed(() => {
  const r = restaurant.value?.rating
  if (r != null) return r
  return placeInfo.value?.rating ?? null
})
const displayRatingCount = computed(() => {
  const c = restaurant.value?.ratingCount
  if (c != null) return c
  return placeInfo.value?.ratingCount ?? null
})
const displayImage = computed(
  () => restaurant.value?.photo || placeInfo.value?.image || '',
)

const mapEmbed = computed(() => {
  if (!restaurant.value) return ''
  const q = encodeURIComponent(
    [restaurant.value.name || placeInfo.value?.name, displayAddress.value]
      .filter(Boolean)
      .join(' ') || restaurant.value.mapUrl,
  )
  return `https://www.google.com/maps?q=${q}&output=embed`
})

function fmtDate(d) {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('zh-TW')
  } catch {
    return d
  }
}
</script>

<template>
  <section class="container-page pt-10 pb-16">
    <RouterLink
      to="/restaurants"
      class="text-xs text-[var(--color-text-mute)] hover:text-[var(--color-accent)] transition"
    >← 回餐廳清單</RouterLink>

    <div v-if="loading && !restaurant" class="mt-6 text-sm text-[var(--color-text-mute)]">
      載入中…
    </div>

    <div v-else-if="!restaurant" class="mt-6">
      <h1 class="font-serif text-2xl">找不到這間店</h1>
      <p class="mt-2 text-[var(--color-text-soft)]">可能連結過期，或這筆資料已被移除。</p>
    </div>

    <article v-else class="mt-4">
      <header class="flex flex-wrap items-end justify-between gap-3">
        <div class="min-w-0">
          <p class="chip mb-2">{{ restaurant.cuisine || '餐廳' }}</p>
          <h1 class="font-serif text-3xl sm:text-4xl tracking-tight">
            {{ displayName }}
          </h1>
          <p class="mt-1 text-sm text-[var(--color-text-mute)]">
            {{ [restaurant.area, displayAddress].filter(Boolean).join(' ・ ') || '—' }}
          </p>
          <p
            v-if="placeLoading"
            class="mt-1 text-xs text-[var(--color-text-mute)]"
          >正在從 Google Maps 補抓地址 / 評分…</p>
          <p
            v-else-if="placeError && !placeInfo"
            class="mt-1 text-xs text-[var(--color-text-mute)]"
          >沒辦法從 Google Maps 連結讀取資料（CORS proxy 失敗）</p>
        </div>
        <div class="text-right text-sm">
          <div v-if="displayRating != null" :style="{ color: 'var(--color-accent)' }">
            ★ {{ Number(displayRating).toFixed(1) }}
            <span v-if="displayRatingCount != null" class="text-[var(--color-text-mute)]">
              ({{ Number(displayRatingCount).toLocaleString() }})
            </span>
          </div>
          <div v-if="restaurant.priceLevel" class="text-[var(--color-text-mute)]">
            價位 {{ restaurant.priceLevel }}
          </div>
          <div v-if="restaurant.visitedAt" class="text-[var(--color-text-mute)]">
            造訪 {{ fmtDate(restaurant.visitedAt) }}
          </div>
        </div>
      </header>

      <div class="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div class="card overflow-hidden aspect-[4/3]">
          <iframe
            :src="mapEmbed"
            class="w-full h-full"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        <div class="card p-6">
          <img
            v-if="displayImage"
            :src="displayImage"
            :alt="displayName"
            loading="lazy"
            referrerpolicy="no-referrer"
            class="w-full h-44 object-cover rounded-lg mb-4"
          />

          <h2 class="font-serif text-xl mb-3">心得</h2>
          <p class="prose-tomm whitespace-pre-line">
            {{ restaurant.note || '還沒寫到這間，之後補。' }}
          </p>

          <div v-if="restaurant.hours" class="mt-5">
            <h3 class="text-sm font-medium text-[var(--color-text-soft)] mb-2">營業時間</h3>
            <p class="text-sm text-[var(--color-text-soft)] whitespace-pre-line">{{ restaurant.hours }}</p>
          </div>

          <div v-if="restaurant.tags?.length" class="mt-5 flex flex-wrap gap-1.5">
            <span v-for="t in restaurant.tags" :key="t" class="chip">{{ t }}</span>
          </div>

          <div class="mt-6 flex flex-wrap gap-3 text-sm">
            <a
              v-if="restaurant.mapUrl"
              :href="restaurant.mapUrl"
              target="_blank"
              rel="noopener"
              class="px-3 py-1.5 rounded-full border transition hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]"
              :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-soft)' }"
            >在 Google Maps 開啟</a>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>
