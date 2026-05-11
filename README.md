# Tomm 的食記與筆記

Vue 3 + Vite + Tailwind v4 打造的個人部落格，深色模式為主。
**所有內容都即時從 Google 試算表載入** — 沒有寫死的 JSON、不需要重新部署。

## 開發

```bash
npm install
npm run dev
```

預設 dev server 在 http://localhost:5173。

## Google 試算表設定

### 1. 設成「知道連結的任何人都可以檢視」

在試算表右上角「共用」→ 一般存取權限改成「知道連結的任何人都可以檢視」。
> 這個專案讀的是 `gviz` 公開 CSV endpoint，所以不需要「發佈到網路」，但**檢視權限必須是公開**。

### 2. 建立兩個分頁，分別命名為 `restaurants` 與 `posts`

第一列當欄位名稱（header），名字大小寫要一致。中文欄位名也支援，括號是中文別名。

#### `restaurants` 分頁欄位

| 欄位 | 必填 | 說明 |
|---|---|---|
| `mapUrl`（地圖網址） | ✓ | Google Maps 連結（短網址或長網址都可） |
| `name`（店名） | ✓ | 店名 |
| `area`（區域） |  | 區域，例：台北・松山 |
| `address`（地址） |  | 完整地址 |
| `rating`（評分） |  | 數字，例 4.5 |
| `ratingCount`（評分人數） |  | 整數 |
| `hours`（營業時間） |  | 自由文字，可換行 |
| `cuisine`（類型） |  | 例：日本料理 |
| `priceLevel`（價位） |  | $ / $$ / $$$ |
| `tags`（標籤） |  | 用逗號或頓號分隔，例：壽司, 生魚片, 請客場合 |
| `note`（心得） |  | 個人心得，可換行 |
| `visitedAt`（造訪日期） |  | YYYY-MM-DD |
| `photo`（照片） |  | 圖片網址（保留欄位） |

#### `posts` 分頁欄位

| 欄位 | 必填 | 說明 |
|---|---|---|
| `title`（標題） | ✓ | 文章標題 |
| `slug` |  | 不填會自動從標題產生 |
| `excerpt`（摘要） |  | 列表卡片用 |
| `body`（內文） |  | 支援基本 Markdown：`#` `##` 標題、`-` 清單 |
| `cover`（封面） |  | 圖片網址（保留欄位） |
| `tags`（標籤） |  | 逗號分隔 |
| `publishedAt`（發佈日期） |  | YYYY-MM-DD |
| `author`（作者） |  | 預設 Tomm |

### 3. 把試算表 ID 寫進 `.env.local`

```env
VITE_SHEET_ID=1IkJ03IVDE7NTCo2MRM3yxpz2UvagQ-Rdmuo3tci4zGA
VITE_SHEET_RESTAURANTS_TAB=restaurants
VITE_SHEET_POSTS_TAB=posts
```

> 試算表 ID 是網址中 `/d/` 與 `/edit` 之間那一段。

重啟 dev server 後，網站就會直接讀你的試算表內容。每個列表頁右上角有「重新載入」按鈕可以手動刷新；換頁或重整頁面也都會重抓。

## 部署

```bash
npm run build
```

把 `dist/` 上傳到任何靜態主機（Vercel / Netlify / Cloudflare Pages）。
記得在主機設定「所有 404 → index.html」以支援 Vue Router 的 history 模式。
別忘了把 `VITE_SHEET_ID` 等環境變數設定到主機端。

## 結構

```
src/
├── App.vue
├── main.js
├── style.css
├── router/index.js
├── components/
│   ├── AppHeader.vue
│   ├── AppFooter.vue
│   ├── ThemeToggle.vue
│   ├── RestaurantCard.vue
│   └── PostCard.vue
├── composables/
│   ├── useSheet.js       # 通用：抓 Google Sheet CSV → JSON（無快取、無 fallback）
│   ├── useRestaurants.js
│   ├── usePosts.js
│   └── useTheme.js       # 深色 / 淺色切換
└── views/
    ├── HomeView.vue
    ├── RestaurantsView.vue
    ├── RestaurantDetailView.vue
    ├── PostsView.vue
    ├── PostDetailView.vue
    ├── AboutView.vue
    └── NotFoundView.vue
```

## 資料流

```
Google Sheet
   │
   │  https://docs.google.com/spreadsheets/d/{ID}/gviz/tq?tqx=out:csv&sheet={tab}
   ▼
useSheet (Papa Parse)
   │
   ▼
useRestaurants / usePosts (transform)
   │
   ▼
Views
```

每次 composable 第一次被使用都會發一次 fetch；列表頁的「重新載入」按鈕呼叫同一個 `load()` 強制重抓。
