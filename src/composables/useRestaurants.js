import { useSheet } from './useSheet'

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{Letter}\p{Number}-]/gu, '')
    .slice(0, 80)
}

// 簡單字串雜湊，當其他資料都缺時用來做穩定 id
function hash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  // 轉成 base36 並避免負號
  return (h >>> 0).toString(36)
}

const URL_RE = /^https?:\/\//i

function looksLikeUrl(v) {
  return typeof v === 'string' && URL_RE.test(v.trim())
}

function placeNameFromMapsUrl(url) {
  if (!url) return ''
  // 解析 https://www.google.com/maps/place/{name}/... 的店名
  // maps.app.goo.gl 短網址沒辦法在前端 redirect，這段對它無效
  try {
    const u = new URL(url)
    const m = u.pathname.match(/\/place\/([^/]+)/)
    if (m && m[1]) return decodeURIComponent(m[1]).replace(/\+/g, ' ')
  } catch (_) {
    // ignore
  }
  return ''
}

function transform(row) {
  if (!row) return null

  // 容忍英文 / 中文欄位名
  let mapUrl = row.mapUrl || row['地圖網址'] || row['Map URL'] || row.url || ''
  let address = row.address || row['地址'] || ''

  // 使用者常常把 Google Maps 連結直接貼到「地址」欄
  // 在這裡幫忙判斷：地址欄是 URL 就一併視為 mapUrl，避免地圖跟搜尋出錯
  if (!mapUrl && looksLikeUrl(address)) {
    mapUrl = address.trim()
    address = ''
  }
  // 如果 mapUrl 跟 address 同時都是 URL（重覆），把 address 清掉
  if (looksLikeUrl(address) && address.trim() === mapUrl.trim()) {
    address = ''
  }

  const name =
    row.name ||
    row.Name ||
    row['店名'] ||
    row['餐廳名稱'] ||
    row.title ||
    placeNameFromMapsUrl(mapUrl)

  if (!mapUrl && !name && !address) return null

  // 穩定 id：優先 sheet 自填 → name → mapUrl → address，最後雜湊
  const idSource =
    row.id ||
    row.ID ||
    slugify(name) ||
    slugify(mapUrl) ||
    slugify(address)
  const fallbackBasis = `${name}|${mapUrl}|${address}`
  const id = idSource || `r-${hash(fallbackBasis || JSON.stringify(row))}`

  const tags = (row.tags || row.Tags || row['標籤'] || '')
    .split(/[,，、|]/)
    .map((t) => t.trim())
    .filter(Boolean)

  const ratingRaw = row.rating ?? row['評分'] ?? row.Rating
  const rating = ratingRaw === '' || ratingRaw == null ? null : Number(ratingRaw)

  const ratingCountRaw = row.ratingCount ?? row['評分人數'] ?? row['評論數']
  const ratingCount =
    ratingCountRaw === '' || ratingCountRaw == null ? null : Number(ratingCountRaw)

  return {
    id,
    name: name || '',
    area: row.area || row['區域'] || row.city || '',
    address,
    rating: Number.isFinite(rating) ? rating : null,
    ratingCount: Number.isFinite(ratingCount) ? ratingCount : null,
    hours: row.hours || row['營業時間'] || row.openingHours || '',
    priceLevel: row.priceLevel || row['價位'] || '',
    cuisine: row.cuisine || row['類型'] || '',
    tags,
    note: row.note || row['心得'] || row.notes || '',
    photo: row.photo || row['照片'] || '',
    mapUrl,
    visitedAt: row.visitedAt || row['造訪日期'] || '',
  }
}

const sheetId = import.meta.env.VITE_SHEET_ID || ''
const sheetTab = import.meta.env.VITE_SHEET_RESTAURANTS_TAB || 'restaurants'

const sheet = useSheet({ sheetId, sheet: sheetTab, transform })

// 模組載入時就先打一次 fetch，後續任何頁面都直接拿到同一份資料
// 不依賴 onMounted/booted，避免切頁時 race 造成空白
let firstLoad = null
function ensureLoaded() {
  if (!firstLoad) {
    firstLoad = sheet.load()
  }
  return firstLoad
}
ensureLoaded()

export function useRestaurants() {
  // 萬一第一次 load 失敗導致 data 空著，下次有元件來用就再試一次
  if (!sheet.loading.value && !sheet.data.value.length && sheet.error.value) {
    firstLoad = sheet.load()
  }
  return sheet
}
