<script setup>
import { useTheme } from '../composables/useTheme'
const { theme, toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    @click="toggle"
    class="inline-flex h-9 w-9 items-center justify-center rounded-full border transition hover:scale-105"
    :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-soft)' }"
    :aria-label="theme === 'dark' ? '切換成淺色' : '切換成深色'"
    :title="theme === 'dark' ? '切換成淺色' : '切換成深色'"
  >
    <!-- 月亮 -->
    <svg
      v-if="theme === 'dark'"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
    <!-- 太陽 -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  </button>
</template>
