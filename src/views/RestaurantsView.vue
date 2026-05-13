<script setup>
import { ref, computed } from 'vue'
import { useRestaurants } from '../composables/useRestaurants'
import RestaurantCard from '../components/RestaurantCard.vue'

const { data, loading, error, fetchedAt, load } = useRestaurants()

const q = ref('')
const activeTag = ref('')

const allTags = computed(() => {
  const set = new Set()
  data.value.forEach((r) => (r.tags || []).forEach((t) => set.add(t)))
  return [...set].sort()
})

const filtered = computed(() => {
  const kw = q.value.trim().toLowerCase()
  return data.value.filter((r) => {
    const okTag = !activeTag.value || (r.tags || []).includes(activeTag.value)
    if (!kw) return okTag
    const hay = [r.name, r.area, r.cuisine, r.address, r.note, ...(r.tags || [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return okTag && hay.includes(kw)
  })
})

function fmtTime(d) {
  if (!d) return ''
  return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <section class="container-page pt-10 sm:pt-12 pb-4 sm:pb-6">
    <p class="chip mb-3">餐廳清單</p>
    <h1 class="font-serif text-2xl sm:text-4xl tracking-tight">私房收藏的店家</h1>
    <p class="mt-3 max-w-2xl text-sm sm:text-base text-[var(--color-text-soft)]">
      所有資料即時讀自 Google 試算表，編輯試算表後重新整理就會更新。
    </p>

    <div class="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
      <div class="relative w-full sm:flex-1 sm:max-w-md">
        <input
          v-model="q"
          type="search"
          placeholder="搜尋店名、區域、餐點…"
          class="w-full h-11 pl-10 pr-3 rounded-full border outline-none transition focus:ring-2"
          :style="{
            background: 'var(--color-bg-soft)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }"
        />
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-60" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      </div>
      <div class="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[var(--color-text-mute)]">
        <span>共 {{ filtered.length }} / {{ data.length }} 間</span>
        <span v-if="fetchedAt" class="hidden sm:inline">· 最後更新 {{ fmtTime(fetchedAt) }}</span>
        <span v-if="fetchedAt" class="sm:hidden">· {{ fmtTime(fetchedAt) }}</span>
        <button
          type="button"
          class="ml-auto sm:ml-0 px-3 py-1 rounded-full border transition hover:text-[var(--color-accent)]"
          :style="{ borderColor: 'var(--color-border)' }"
          :disabled="loading"
          @click="load"
        >{{ loading ? '載入中…' : '重新載入' }}</button>
      </div>
    </div>

    <div v-if="allTags.length" class="mt-4 flex flex-wrap gap-1.5 sm:gap-2">
      <button
        type="button"
        class="px-3 py-1 text-xs rounded-full border transition"
        :class="{ 'is-on': activeTag === '' }"
        :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-soft)' }"
        @click="activeTag = ''"
      >全部</button>
      <button
        v-for="t in allTags"
        :key="t"
        type="button"
        class="px-3 py-1 text-xs rounded-full border transition"
        :class="{ 'is-on': activeTag === t }"
        :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-soft)' }"
        @click="activeTag = activeTag === t ? '' : t"
      >{{ t }}</button>
    </div>
  </section>

  <section class="container-page py-6">
    <div v-if="error" class="card p-5 text-sm" :style="{ color: 'var(--color-text-soft)' }">
      <p class="text-[var(--color-text)] font-medium mb-1">沒辦法從 Google 試算表載入資料</p>
      <p>{{ error.message || error }}</p>
      <p class="mt-2 text-xs text-[var(--color-text-mute)]">
        請確認 .env.local 裡的 <code>VITE_SHEET_ID</code> 與分頁名稱正確，
        且試算表設定為「知道連結的任何人都可以檢視」。
      </p>
    </div>
    <div v-else-if="loading && !data.length" class="text-sm text-[var(--color-text-mute)]">載入中…</div>
    <div v-else-if="!data.length" class="text-sm text-[var(--color-text-mute)]">
      試算表是空的。把第一列填好欄位名稱（例：mapUrl, name, area, hours…），
      第二列開始貼資料就會出現在這裡。
    </div>
    <div v-else-if="!filtered.length" class="text-sm text-[var(--color-text-mute)]">
      找不到符合的店家，換個關鍵字試試？
    </div>
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RestaurantCard v-for="r in filtered" :key="r.id" :restaurant="r" />
    </div>
  </section>
</template>

<style scoped>
.is-on {
  background: var(--color-accent-soft);
  color: var(--color-accent) !important;
  border-color: color-mix(in srgb, var(--color-accent) 35%, transparent) !important;
}
</style>
