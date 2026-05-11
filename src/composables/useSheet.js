import { ref } from 'vue'
import Papa from 'papaparse'

/**
 * 從 Google 試算表抓 CSV 並解析。每次呼叫 load() 都會打 Network，沒有快取。
 *
 * 用 gviz CSV endpoint：
 *   https://docs.google.com/spreadsheets/d/{ID}/gviz/tq?tqx=out:csv&sheet={NAME}
 * 試算表必須設為「知道連結的任何人都可以檢視」。
 */
export function useSheet({ sheetId, sheet, transform = (r) => r }) {
  const data = ref([])
  const loading = ref(false)
  const error = ref(null)
  const fetchedAt = ref(null)

  function buildUrl() {
    if (!sheetId) return null
    const base = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/gviz/tq?tqx=out:csv`
    return sheet ? `${base}&sheet=${encodeURIComponent(sheet)}` : base
  }

  async function load() {
    const url = buildUrl()
    if (!url) {
      error.value = new Error('未設定 sheetId（VITE_SHEET_ID）')
      data.value = []
      return
    }
    loading.value = true
    error.value = null
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`)
      const text = await res.text()
      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
      })
      const rows = (parsed.data || [])
        .map(transform)
        .filter(Boolean)
      data.value = rows
      fetchedAt.value = new Date()
    } catch (e) {
      console.error('[useSheet] load failed:', e)
      error.value = e
      data.value = []
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetchedAt, load }
}
