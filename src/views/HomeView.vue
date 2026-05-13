<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useRestaurants } from '../composables/useRestaurants'
import { usePosts } from '../composables/usePosts'
import RestaurantCard from '../components/RestaurantCard.vue'
import PostCard from '../components/PostCard.vue'

const { data: restaurants, loading: rLoading, error: rError } = useRestaurants()
const { data: posts, loading: pLoading, error: pError } = usePosts()

const latestRestaurants = computed(() => restaurants.value.slice(0, 6))
const latestPosts = computed(() =>
  [...posts.value]
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)))
    .slice(0, 3),
)
</script>

<template>
  <section class="container-page pt-10 sm:pt-16 pb-8 sm:pb-10">
    <div class="max-w-3xl">
      <p class="chip mb-3 sm:mb-4">Hello — I'm Tomm</p>
      <h1
        class="font-serif text-2xl sm:text-4xl md:text-5xl leading-tight tracking-tight"
        :style="{ color: 'var(--color-text)' }"
      >
        在台北的餐桌、街角，<br class="hidden sm:inline" />與一些不太重要但很重要的小事。
      </h1>
      <p class="mt-4 sm:mt-5 text-sm sm:text-lg text-[var(--color-text-soft)] leading-relaxed">
        這裡會慢慢長出兩件事：一份我私心收藏的餐廳清單，以及偶爾寫下的雜記。
        所有內容都即時從 Google 試算表載入，不重新部署也能更新。
      </p>
      <div class="mt-6 sm:mt-7 flex flex-wrap gap-2 sm:gap-3">
        <RouterLink
          to="/restaurants"
          class="px-4 py-2 rounded-full text-sm font-medium transition hover:opacity-90"
          :style="{ background: 'var(--color-accent)', color: '#0b0d10' }"
        >看餐廳清單 →</RouterLink>
        <RouterLink
          to="/posts"
          class="px-4 py-2 rounded-full text-sm font-medium border transition hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]"
          :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-soft)' }"
        >逛逛文章</RouterLink>
      </div>
    </div>
  </section>

  <!-- 最新文章 -->
  <section class="container-page py-8 sm:py-10">
    <header class="flex items-end justify-between mb-4 sm:mb-5">
      <h2 class="font-serif text-xl sm:text-2xl tracking-tight">最新文章</h2>
      <RouterLink
        to="/posts"
        class="text-sm text-[var(--color-text-soft)] hover:text-[var(--color-accent)] transition"
      >全部 →</RouterLink>
    </header>
    <div v-if="pError" class="text-sm text-[var(--color-text-mute)]">
      讀取文章失敗：{{ pError.message || pError }}
    </div>
    <div v-else-if="pLoading && !posts.length" class="text-sm text-[var(--color-text-mute)]">載入中…</div>
    <div v-else-if="!latestPosts.length" class="text-sm text-[var(--color-text-mute)]">
      還沒有文章，到 Google 試算表的 posts 分頁加幾筆吧。
    </div>
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <PostCard v-for="p in latestPosts" :key="p.slug" :post="p" />
    </div>
  </section>

  <!-- 餐廳精選 -->
  <section class="container-page py-8 sm:py-10">
    <header class="flex items-end justify-between mb-4 sm:mb-5">
      <h2 class="font-serif text-xl sm:text-2xl tracking-tight">餐廳精選</h2>
      <RouterLink
        to="/restaurants"
        class="text-sm text-[var(--color-text-soft)] hover:text-[var(--color-accent)] transition"
      >全部 →</RouterLink>
    </header>
    <div v-if="rError" class="text-sm text-[var(--color-text-mute)]">
      讀取餐廳清單失敗：{{ rError.message || rError }}
    </div>
    <div v-else-if="rLoading && !restaurants.length" class="text-sm text-[var(--color-text-mute)]">載入中…</div>
    <div v-else-if="!latestRestaurants.length" class="text-sm text-[var(--color-text-mute)]">
      試算表還沒有資料，到 restaurants 分頁加幾筆。
    </div>
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RestaurantCard v-for="r in latestRestaurants" :key="r.id" :restaurant="r" />
    </div>
  </section>
</template>
