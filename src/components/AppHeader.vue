<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'

const nav = [
  { to: '/', label: '首頁' },
  { to: '/posts', label: '文章' },
  { to: '/restaurants', label: '餐廳' },
  { to: '/sudoku', label: '數獨' },
  { to: '/about', label: '關於' },
]

const mobileOpen = ref(false)
const route = useRoute()

// 切換路由時自動關閉手機選單
watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  },
)
</script>

<template>
  <header
    class="sticky top-0 z-30 backdrop-blur-md border-b"
    :style="{
      background: 'color-mix(in srgb, var(--color-bg) 75%, transparent)',
      borderColor: 'var(--color-border)',
    }"
  >
    <div class="container-page flex h-14 sm:h-16 items-center justify-between gap-3">
      <RouterLink to="/" class="flex items-center gap-2 group min-w-0">
        <span
          class="grid h-8 w-8 shrink-0 place-items-center rounded-lg font-serif text-base"
          :style="{
            background: 'var(--color-accent)',
            color: '#0b0d10',
            fontWeight: 700,
          }"
        >T</span>
        <span class="text-xs sm:text-sm tracking-wide truncate text-[var(--color-text-soft)] group-hover:text-[var(--color-text)] transition">
          <span class="hidden sm:inline">Tommmmm 的食記與筆記</span>
          <span class="sm:hidden">Tommmmm</span>
        </span>
      </RouterLink>

      <!-- 桌機導覽 -->
      <nav class="hidden md:flex items-center gap-1">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="px-3 py-1.5 rounded-full text-sm transition"
          active-class="is-active"
          :style="{ color: 'var(--color-text-soft)' }"
        >
          {{ item.label }}
        </RouterLink>
        <span class="mx-2 h-5 w-px" :style="{ background: 'var(--color-border)' }" />
        <ThemeToggle />
      </nav>

      <!-- 手機：主題切換 + 漢堡 -->
      <div class="flex md:hidden items-center gap-1.5">
        <ThemeToggle />
        <button
          type="button"
          @click="mobileOpen = !mobileOpen"
          class="inline-flex h-9 w-9 items-center justify-center rounded-full border transition"
          :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-soft)' }"
          :aria-label="mobileOpen ? '關閉選單' : '打開選單'"
          aria-expanded="false"
        >
          <svg v-if="!mobileOpen" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 手機展開的選單 -->
    <transition name="fade">
      <nav
        v-if="mobileOpen"
        class="md:hidden border-t"
        :style="{
          borderColor: 'var(--color-border)',
          background: 'color-mix(in srgb, var(--color-bg) 92%, transparent)',
        }"
      >
        <div class="container-page py-2 flex flex-col">
          <RouterLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="px-3 py-2.5 rounded-lg text-sm transition"
            active-class="is-active"
            :style="{ color: 'var(--color-text-soft)' }"
          >
            {{ item.label }}
          </RouterLink>
        </div>
      </nav>
    </transition>
  </header>
</template>

<style scoped>
.is-active {
  background: var(--color-accent-soft);
  color: var(--color-accent) !important;
}
</style>
