import { ref, watch, isRef } from 'vue'

/**
 * 從 Google Maps 連結（含 maps.app.goo.gl 短網址、google.com/maps/place/...）
 * 抓回頁面 HTML，解析 og:title / og:description / og:image，把店名、地址、評分、
 * 評論數、封面圖帶回前端顯示。
 *
 * 由於 Google Maps 不支援 CORS，這裡走 allorigins.win 這個公開 CORS proxy；
 * 若連線失敗會把 error 寫進來，UI 端自行 fallback 到表單原本就填好的欄位。
 */

const PROXY = 'https://api.allorigins.win/get?url='

// url -> { data, error }
const cache = new Map()
// url -> Promise<info>
const inFlight = new Map()

function getMeta(html, regex) {
  const m = html.match(regex)
  return m ? m[1] : ''
}

function decodeHtmlEntities(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16))
      } catch {
        return ''
      }
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCodePoint(parseInt(dec, 10))
      } catch {
        return ''
      }
    })
}

function looksLikeAddress(p) {
  if (!p) return false
  // 中文地址常見：路 / 街 / 巷 / 弄 / 號 / 樓 / 段 / 區 / 市
  // 英文地址常見：街道字尾 St / Rd / Ave / Blvd 與郵遞區號
  return (
    /\d/.test(p) &&
    /(街|路|巷|弄|號|樓|段|區|市|縣|村|里|鄉|鎮|Street|St\.?|Road|Rd\.?|Avenue|Ave\.?|Blvd\.?|Lane|Ln\.?|Drive|Dr\.?|\b\d{3,5}\b)/i.test(
      p,
    )
  )
}

function parseRating(desc) {
  if (!desc) return { rating: null, ratingCount: null }
  // ★ 4.5 · (1,234) / 4.5 ★ (1,234) / 4.5 (1,234)
  let m = desc.match(/(?:★\s*)?(\d(?:\.\d)?)\s*★?\s*[·•・]?\s*\(?([\d,]{1,9})\s*\)?/)
  if (m) {
    const r = Number(m[1])
    const c = Number(String(m[2]).replace(/,/g, ''))
    if (r >= 0 && r <= 5 && Number.isFinite(c)) {
      return { rating: r, ratingCount: c }
    }
  }
  // 沒有評論數，但有「4.5 stars」這種寫法
  m = desc.match(/(\d(?:\.\d)?)\s*(?:stars?|星|顆星)/i)
  if (m) return { rating: Number(m[1]), ratingCount: null }
  return { rating: null, ratingCount: null }
}

function parsePlaceInfo(html, requestedUrl) {
  const ogTitle = decodeHtmlEntities(
    getMeta(html, /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i),
  )
  const ogDesc = decodeHtmlEntities(
    getMeta(
      html,
      /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i,
    ),
  )
  const ogImage = decodeHtmlEntities(
    getMeta(html, /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i),
  )
  const ogUrl = decodeHtmlEntities(
    getMeta(html, /<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i),
  )
  const docTitle = decodeHtmlEntities(getMeta(html, /<title>([^<]+)<\/title>/i))

  // og:title 通常會帶「· Google 地圖」「- Google Maps」之類的尾巴，去掉
  const cleanName =
    (ogTitle || docTitle)
      .replace(/\s*[-–—·]\s*Google\s*(地圖|Maps).*$/i, '')
      .replace(/\s*[-–—·]\s*Google\s*$/i, '')
      .trim() || ''

  const desc = ogDesc.replace(/\s+/g, ' ').trim()

  // og:description 通常用「・」「·」「•」分段，把每段拿出來分別判斷
  const parts = desc.split(/[・·•|]+/).map((p) => p.trim()).filter(Boolean)
  const address = parts.find(looksLikeAddress) || ''

  const { rating, ratingCount } = parseRating(desc)

  return {
    name: cleanName,
    address,
    rating,
    ratingCount,
    image: ogImage || '',
    resolvedUrl: ogUrl || requestedUrl,
    rawDescription: desc,
  }
}

async function fetchPlaceInfo(url) {
  if (cache.has(url)) {
    const c = cache.get(url)
    if (c.error) throw c.error
    return c.data
  }
  if (inFlight.has(url)) return inFlight.get(url)

  const p = (async () => {
    try {
      const res = await fetch(`${PROXY}${encodeURIComponent(url)}`)
      if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`)
      const json = await res.json()
      const html = json && json.contents
      if (typeof html !== 'string') throw new Error('Proxy 回傳格式不正確')
      const info = parsePlaceInfo(html, url)
      cache.set(url, { data: info, error: null })
      return info
    } catch (e) {
      cache.set(url, { data: null, error: e })
      throw e
    } finally {
      inFlight.delete(url)
    }
  })()
  inFlight.set(url, p)
  return p
}

/**
 * @param {string | import('vue').Ref<string> | (() => string)} urlSource
 */
export function usePlaceInfo(urlSource) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  function readUrl() {
    if (typeof urlSource === 'function') return urlSource()
    if (isRef(urlSource)) return urlSource.value
    return urlSource || ''
  }

  async function load() {
    const url = readUrl()
    if (!url) {
      data.value = null
      error.value = null
      loading.value = false
      return
    }
    // 已快取就直接拿
    if (cache.has(url)) {
      const c = cache.get(url)
      data.value = c.data
      error.value = c.error || null
      loading.value = false
      return
    }
    loading.value = true
    error.value = null
    try {
      const info = await fetchPlaceInfo(url)
      // 還是同一個 url 才寫回（避免快速切換時搶到後面 url 的結果）
      if (readUrl() === url) {
        data.value = info
        error.value = null
      }
    } catch (e) {
      if (readUrl() === url) {
        data.value = null
        error.value = e
      }
    } finally {
      if (readUrl() === url) {
        loading.value = false
      }
    }
  }

  watch(() => readUrl(), load, { immediate: true })

  return { data, loading, error }
}
