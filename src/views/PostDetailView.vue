<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { usePosts } from '../composables/usePosts'

const route = useRoute()
const { data, loading } = usePosts()

const post = computed(() =>
  data.value.find((p) => String(p.slug) === String(route.params.slug)),
)

function fmtDate(d) {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return d
  }
}

// 簡易 Markdown：標題 / 段落 / 清單，避免引入大型套件
function renderBody(text) {
  if (!text) return ''
  const lines = String(text).split(/\r?\n/)
  let html = ''
  let inList = false
  const flushList = () => {
    if (inList) {
      html += '</ul>'
      inList = false
    }
  }
  for (const raw of lines) {
    const line = raw.trimEnd()
    if (/^###\s+/.test(line)) {
      flushList()
      html += `<h3>${escape(line.replace(/^###\s+/, ''))}</h3>`
    } else if (/^##\s+/.test(line)) {
      flushList()
      html += `<h2>${escape(line.replace(/^##\s+/, ''))}</h2>`
    } else if (/^#\s+/.test(line)) {
      flushList()
      html += `<h2>${escape(line.replace(/^#\s+/, ''))}</h2>`
    } else if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) {
        html += '<ul>'
        inList = true
      }
      html += `<li>${escape(line.replace(/^\s*[-*]\s+/, ''))}</li>`
    } else if (line.trim() === '') {
      flushList()
      html += ''
    } else {
      flushList()
      html += `<p>${escape(line)}</p>`
    }
  }
  flushList()
  return html
}

function escape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
</script>

<template>
  <section class="container-page pt-8 sm:pt-10 pb-12 sm:pb-16 max-w-3xl">
    <RouterLink
      to="/posts"
      class="text-xs text-[var(--color-text-mute)] hover:text-[var(--color-accent)] transition"
    >← 回文章列表</RouterLink>

    <div v-if="loading && !post" class="mt-6 text-sm text-[var(--color-text-mute)]">
      載入中…
    </div>
    <div v-else-if="!post" class="mt-6">
      <h1 class="font-serif text-2xl">找不到這篇文章</h1>
    </div>
    <article v-else class="mt-6">
      <header>
        <p class="text-sm text-[var(--color-text-mute)]">
          {{ fmtDate(post.publishedAt) }}<span v-if="post.author"> ・ {{ post.author }}</span>
        </p>
        <h1 class="mt-2 font-serif text-2xl sm:text-3xl md:text-4xl leading-snug tracking-tight">{{ post.title }}</h1>
        <p v-if="post.excerpt" class="mt-3 text-[var(--color-text-soft)]">{{ post.excerpt }}</p>
        <div v-if="post.tags?.length" class="mt-3 flex flex-wrap gap-1.5">
          <span v-for="t in post.tags" :key="t" class="chip">#{{ t }}</span>
        </div>
      </header>

      <div class="prose-tomm mt-8" v-html="renderBody(post.body)"></div>
    </article>
  </section>
</template>
