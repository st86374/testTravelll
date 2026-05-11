<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer
    class="mt-24 border-t"
    :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-mute)' }"
  >
    <div class="container-page py-10 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <p>© {{ year }} Tomm. 用 Vue 3 + Vite + Tailwind 親手寫的小角落。</p>
      <p class="text-xs">資料來源：Google 試算表（CSV 發佈）</p>
    </div>
  </footer>
</template>
