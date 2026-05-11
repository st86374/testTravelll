import { useSheet } from './useSheet'

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{Letter}\p{Number}-]/gu, '')
    .slice(0, 80)
}

function transform(row) {
  if (!row) return null
  const title = row.title || row.Title || row['標題']
  if (!title) return null
  const slug = row.slug || slugify(title)
  const tags = (row.tags || row.Tags || row['標籤'] || '')
    .split(/[,，、|]/)
    .map((t) => t.trim())
    .filter(Boolean)

  return {
    slug,
    title,
    excerpt: row.excerpt || row['摘要'] || '',
    body: row.body || row['內文'] || '',
    cover: row.cover || row['封面'] || '',
    tags,
    publishedAt: row.publishedAt || row['發佈日期'] || '',
    author: row.author || row['作者'] || 'Tomm',
  }
}

const sheetId = import.meta.env.VITE_SHEET_ID || ''
const sheetTab = import.meta.env.VITE_SHEET_POSTS_TAB || 'posts'

const sheet = useSheet({ sheetId, sheet: sheetTab, transform })

// 模組載入時就先打一次 fetch，避免依賴 onMounted 造成切頁空白
let firstLoad = null
function ensureLoaded() {
  if (!firstLoad) {
    firstLoad = sheet.load()
  }
  return firstLoad
}
ensureLoaded()

export function usePosts() {
  if (!sheet.loading.value && !sheet.data.value.length && sheet.error.value) {
    firstLoad = sheet.load()
  }
  return sheet
}
