<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer
    class="mt-12 sm:mt-24 border-t"
    :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-mute)' }"
  >
    <div class="container-page py-6 sm:py-10 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
      <p>© {{ year }} Tomm. 用 Vue 3 + Vite + Tailwind 親手寫的小角落。</p>
      <p class="text-[11px] sm:text-xs">資料來源：Google 試算表（CSV 發佈）</p>
    </div>
  </footer>
</template>
