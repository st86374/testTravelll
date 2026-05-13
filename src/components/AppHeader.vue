<script setup>
import { RouterLink } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'

const nav = [
  { to: '/', label: '首頁' },
  { to: '/posts', label: '文章' },
  { to: '/restaurants', label: '餐廳' },
  { to: '/sudoku', label: '數獨' },
  { to: '/about', label: '關於' },
]
</script>

<template>
  <header
    class="sticky top-0 z-30 backdrop-blur-md border-b"
    :style="{
      background: 'color-mix(in srgb, var(--color-bg) 75%, transparent)',
      borderColor: 'var(--color-border)',
    }"
  >
    <div class="container-page flex h-16 items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-2 group">
        <span
          class="grid h-8 w-8 place-items-center rounded-lg font-serif text-base"
          :style="{
            background: 'var(--color-accent)',
            color: '#0b0d10',
            fontWeight: 700,
          }"
        >T</span>
        <span class="text-sm tracking-wide text-[var(--color-text-soft)] group-hover:text-[var(--color-text)] transition">
          Tommmmm 的食記與筆記
        </span>
      </RouterLink>

      <nav class="flex items-center gap-1">
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
    </div>
  </header>
</template>

<style scoped>
.is-active {
  background: var(--color-accent-soft);
  color: var(--color-accent) !important;
}
</style>
