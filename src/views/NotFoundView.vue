<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="container-page pt-14 sm:pt-20 pb-12 sm:pb-16 max-w-2xl text-center">
    <p class="chip mx-auto mb-3">404</p>
    <h1 class="font-serif text-3xl sm:text-4xl tracking-tight">這頁不見了</h1>
    <p class="mt-3 text-sm sm:text-base text-[var(--color-text-soft)]">可能是連結拼錯，或這個頁面早就被打掃掉了。</p>
    <RouterLink
      to="/"
      class="mt-6 inline-block px-4 py-2 rounded-full text-sm font-medium"
      :style="{ background: 'var(--color-accent)', color: '#0b0d10' }"
    >回首頁</RouterLink>
  </section>
</template>
