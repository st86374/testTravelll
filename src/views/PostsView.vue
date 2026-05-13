<script setup>
import { ref, computed } from 'vue'
import { usePosts } from '../composables/usePosts'
import PostCard from '../components/PostCard.vue'

const { data, loading, error, fetchedAt, load } = usePosts()
const q = ref('')

const sorted = computed(() =>
  [...data.value].sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt))),
)

const filtered = computed(() => {
  const kw = q.value.trim().toLowerCase()
  if (!kw) return sorted.value
  return sorted.value.filter((p) => {
    const hay = [p.title, p.excerpt, p.body, ...(p.tags || [])].filter(Boolean).join(' ').toLowerCase()
    return hay.includes(kw)
  })
})

function fmtTime(d) {
  if (!d) return ''
  return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <section class="container-page pt-10 sm:pt-12 pb-4 sm:pb-6">
    <p class="chip mb-3">文章</p>
    <h1 class="font-serif text-2xl sm:text-4xl tracking-tight">寫一些東西</h1>
    <p class="mt-3 max-w-2xl text-sm sm:text-base text-[var(--color-text-soft)]">
      食記、旅行筆記、技術小心得 — 想到什麼寫什麼。
    </p>

    <div class="mt-5 sm:mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
      <div class="relative w-full sm:flex-1 sm:max-w-md">
        <input
          v-model="q"
          type="search"
          placeholder="搜尋文章…"
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
        <span>{{ filtered.length }} 篇</span>
        <span v-if="fetchedAt">· {{ fmtTime(fetchedAt) }}</span>
        <button
          type="button"
          class="ml-auto sm:ml-0 px-3 py-1 rounded-full border transition hover:text-[var(--color-accent)]"
          :style="{ borderColor: 'var(--color-border)' }"
          :disabled="loading"
          @click="load"
        >{{ loading ? '載入中…' : '重新載入' }}</button>
      </div>
    </div>
  </section>

  <section class="container-page py-6">
    <div v-if="error" class="card p-5 text-sm" :style="{ color: 'var(--color-text-soft)' }">
      <p class="text-[var(--color-text)] font-medium mb-1">沒辦法從 Google 試算表載入文章</p>
      <p>{{ error.message || error }}</p>
      <p class="mt-2 text-xs text-[var(--color-text-mute)]">
        如果你目前沒有 posts 分頁，可以先忽略這個錯誤；新增一個叫 <code>posts</code> 的分頁、加上
        <code>title, excerpt, body, publishedAt</code> 之類的欄位就會自動出現。
      </p>
    </div>
    <div v-else-if="loading && !data.length" class="text-sm text-[var(--color-text-mute)]">載入中…</div>
    <div v-else-if="!data.length" class="text-sm text-[var(--color-text-mute)]">
      還沒有任何文章。在 Google 試算表的 posts 分頁加上 title / body 等欄位，這裡就會立即顯示。
    </div>
    <div v-else-if="!filtered.length" class="text-sm text-[var(--color-text-mute)]">
      還沒有符合的文章。
    </div>
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <PostCard v-for="p in filtered" :key="p.slug" :post="p" />
    </div>
  </section>
</template>
