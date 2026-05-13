<script setup>
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'

const { theme, toggle } = useTheme()

const isDark = computed(() => theme.value === 'dark')
const aria = computed(() =>
  isDark.value ? '切換成淺色模式' : '切換成深色模式',
)
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="isDark"
    :aria-label="aria"
    :title="aria"
    @click="toggle"
    class="theme-switch"
    :class="{ 'is-dark': isDark }"
  >
    <!-- 軌道上的太陽 / 月亮裝飾 -->
    <span class="track-icon track-sun" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    </span>
    <span class="track-icon track-moon" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </span>

    <!-- 滑動的圓形把手 -->
    <span class="thumb" aria-hidden="true">
      <svg
        v-if="isDark"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <svg
        v-else
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    </span>
  </button>
</template>

<style scoped>
.theme-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 52px;
  height: 28px;
  padding: 0 4px;
  border-radius: 9999px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-soft);
  cursor: pointer;
  transition: background 200ms ease, border-color 200ms ease;
  flex-shrink: 0;
}

.theme-switch:hover {
  border-color: color-mix(in srgb, var(--color-accent) 50%, var(--color-border));
}

.theme-switch:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* 軌道上的太陽 / 月亮（永遠都看得到，被覆蓋的那一邊會比較淡） */
.track-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  transition: opacity 200ms ease, color 200ms ease;
  pointer-events: none;
}

.track-sun {
  left: 6px;
  color: #f5b83d;
  opacity: 1;
}

.track-moon {
  right: 6px;
  color: var(--color-text-soft);
  opacity: 1;
}

/* 深色模式：高亮月亮，淡化太陽 */
.theme-switch.is-dark .track-sun {
  opacity: 0.35;
}
.theme-switch.is-dark .track-moon {
  color: #e6e9ee;
  opacity: 1;
}

/* 淺色模式：高亮太陽，淡化月亮 */
.theme-switch:not(.is-dark) .track-moon {
  opacity: 0.35;
}
.theme-switch:not(.is-dark) .track-sun {
  opacity: 1;
}

/* 滑動的圓形 thumb */
.thumb {
  position: absolute;
  top: 50%;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  display: grid;
  place-items: center;
  background: var(--color-bg-elev);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--color-border);
  transform: translateY(-50%);
  transition: left 240ms cubic-bezier(0.4, 0, 0.2, 1),
    background 200ms ease, color 200ms ease;
  color: var(--color-accent);
}

.theme-switch.is-dark .thumb {
  left: calc(100% - 22px - 3px);
  color: #f5b83d;
}
</style>
