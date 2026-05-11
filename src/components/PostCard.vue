<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  post: { type: Object, required: true },
})

function fmt(d) {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return d
  }
}
</script>

<template>
  <RouterLink
    :to="{ name: 'post-detail', params: { slug: post.slug } }"
    class="card p-5 flex flex-col gap-3 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30"
  >
    <div class="flex items-center justify-between text-xs text-[var(--color-text-mute)]">
      <time>{{ fmt(post.publishedAt) }}</time>
      <span v-if="post.author">@{{ post.author }}</span>
    </div>
    <h3 class="text-lg font-serif tracking-tight text-[var(--color-text)]">
      {{ post.title }}
    </h3>
    <p
      v-if="post.excerpt"
      class="text-sm text-[var(--color-text-soft)] line-clamp-3"
    >{{ post.excerpt }}</p>
    <div v-if="post.tags?.length" class="flex flex-wrap gap-1.5 pt-1">
      <span v-for="t in post.tags" :key="t" class="chip">#{{ t }}</span>
    </div>
  </RouterLink>
</template>
