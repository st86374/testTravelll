import { ref, watch } from 'vue'

const STORAGE_KEY = 'theme'

function detectInitial() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'dark' || saved === 'light') return saved
  // 預設深色
  return 'dark'
}

const theme = ref(detectInitial())

function apply(value) {
  document.documentElement.classList.toggle('dark', value === 'dark')
}

apply(theme.value)

watch(theme, (v) => {
  localStorage.setItem(STORAGE_KEY, v)
  apply(v)
})

export function useTheme() {
  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }
  function set(v) {
    if (v === 'dark' || v === 'light') theme.value = v
  }
  return { theme, toggle, set }
}
