<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const STORAGE_KEY = 'tommblog-sudoku-save-v1'

/* ─────────────── 數獨核心邏輯 ─────────────── */
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function isValid(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false
    if (board[i][col] === num) return false
  }
  const br = Math.floor(row / 3) * 3
  const bc = Math.floor(col / 3) * 3
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if (board[r][c] === num) return false
    }
  }
  return true
}

function solve(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
          if (isValid(board, r, c, n)) {
            board[r][c] = n
            if (solve(board)) return true
            board[r][c] = 0
          }
        }
        return false
      }
    }
  }
  return true
}

function generateSolved() {
  const b = Array.from({ length: 9 }, () => Array(9).fill(0))
  solve(b)
  return b
}

const DIFF_REMOVE = { easy: 36, medium: 46, hard: 54 }
const DIFF_LABEL = { easy: '簡單', medium: '中等', hard: '困難' }

function generatePuzzle(difficulty) {
  const solution = generateSolved()
  const puzzle = solution.map((r) => [...r])
  const positions = shuffle(Array.from({ length: 81 }, (_, i) => i))
  const toRemove = DIFF_REMOVE[difficulty] ?? 36
  for (let i = 0; i < toRemove; i++) {
    const p = positions[i]
    puzzle[Math.floor(p / 9)][p % 9] = 0
  }
  return { puzzle, solution }
}

/* ─────────────── 狀態 ─────────────── */
const difficulty = ref('easy')
const puzzle = ref(null)
const board = ref(null)
const solution = ref(null)
const selected = ref(null) // [r, c]
const showingSolution = ref(false)
const elapsedBase = ref(0)
const startedAt = ref(0)
const tick = ref(0)
const notice = ref('')
const showLoadDialog = ref(false)
const showCompleteDialog = ref(false)
const showNewGameDialog = ref(false)
const showSolutionConfirmDialog = ref(false)
const pendingDifficulty = ref('easy')
const generating = ref(false)
let timerId = null
let noticeTimer = null
let suppressAutoSave = false

/* ─────────────── 計算屬性 ─────────────── */
const elapsedSec = computed(() => {
  tick.value
  if (!startedAt.value) return elapsedBase.value
  return elapsedBase.value + Math.floor((Date.now() - startedAt.value) / 1000)
})

const timeText = computed(() => {
  const s = elapsedSec.value
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, '0')
  const ss = (s % 60).toString().padStart(2, '0')
  return `${m}:${ss}`
})

const isComplete = computed(() => {
  if (!board.value || !solution.value) return false
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board.value[r][c] !== solution.value[r][c]) return false
    }
  }
  return true
})

/* ─────────────── 操作 ─────────────── */
function flash(msg) {
  notice.value = msg
  if (noticeTimer) clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => {
    notice.value = ''
  }, 1800)
}

function startNewGame(diff) {
  generating.value = true
  suppressAutoSave = true
  setTimeout(() => {
    const { puzzle: p, solution: s } = generatePuzzle(diff)
    puzzle.value = p
    board.value = p.map((r) => [...r])
    solution.value = s
    difficulty.value = diff
    selected.value = null
    showingSolution.value = false
    elapsedBase.value = 0
    startedAt.value = Date.now()
    showCompleteDialog.value = false
    generating.value = false
    if (!timerId) {
      timerId = setInterval(() => {
        tick.value++
      }, 1000)
    }
    suppressAutoSave = false
    saveGame(true)
  }, 30)
}

function selectCell(r, c) {
  selected.value = [r, c]
}

function isLocked(r, c) {
  return puzzle.value && puzzle.value[r][c] !== 0
}

function setNumber(n) {
  if (showingSolution.value) return
  if (!selected.value) return
  const [r, c] = selected.value
  if (isLocked(r, c)) return
  board.value[r] = [...board.value[r]]
  board.value[r][c] = n
  saveGame(true)
  if (isComplete.value) {
    showCompleteDialog.value = true
    if (timerId) clearInterval(timerId)
    timerId = null
  }
}

function clearCell() {
  if (!selected.value) return
  const [r, c] = selected.value
  if (isLocked(r, c)) return
  board.value[r] = [...board.value[r]]
  board.value[r][c] = 0
  saveGame(true)
}

function requestShowSolution() {
  if (showingSolution.value) {
    // 隱藏解答不需要確認
    showingSolution.value = false
    return
  }
  showSolutionConfirmDialog.value = true
}

function confirmShowSolution() {
  showingSolution.value = true
  showSolutionConfirmDialog.value = false
}

function cancelShowSolution() {
  showSolutionConfirmDialog.value = false
}

function saveGame(silent = false) {
  if (suppressAutoSave) return
  if (!board.value) return
  const data = {
    puzzle: puzzle.value,
    board: board.value,
    solution: solution.value,
    difficulty: difficulty.value,
    elapsed: elapsedSec.value,
    savedAt: Date.now(),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    if (!silent) flash('已儲存進度 ✓')
  } catch (e) {
    if (!silent) flash('儲存失敗：' + (e?.message || ''))
  }
}

function readSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function loadSave() {
  const data = readSave()
  if (!data) return false
  suppressAutoSave = true
  puzzle.value = data.puzzle
  board.value = data.board
  solution.value = data.solution
  difficulty.value = data.difficulty || 'easy'
  elapsedBase.value = data.elapsed || 0
  startedAt.value = Date.now()
  showingSolution.value = false
  selected.value = null
  showCompleteDialog.value = false
  if (!timerId) {
    timerId = setInterval(() => {
      tick.value++
    }, 1000)
  }
  suppressAutoSave = false
  return true
}

function clearSave() {
  localStorage.removeItem(STORAGE_KEY)
}

function chooseLoad() {
  if (loadSave()) {
    showLoadDialog.value = false
    flash('已讀取上次的進度 ✓')
  }
}

function chooseNew() {
  clearSave()
  showLoadDialog.value = false
  openNewGameDialog()
}

function openNewGameDialog() {
  pendingDifficulty.value = difficulty.value || 'easy'
  showNewGameDialog.value = true
}

function confirmNewGame() {
  const diff = pendingDifficulty.value || 'easy'
  showNewGameDialog.value = false
  startNewGame(diff)
}

function cancelNewGame() {
  showNewGameDialog.value = false
  // 若目前還沒有遊戲在進行中（例如進入頁面但選擇否），仍然要保持狀態
  if (!board.value) {
    // 若沒局可玩就再次打開
    showNewGameDialog.value = true
  }
}

/* ─────────────── 鍵盤輸入 ─────────────── */
function onKey(e) {
  if (showLoadDialog.value || showNewGameDialog.value || showSolutionConfirmDialog.value) return
  if (e.key >= '1' && e.key <= '9') {
    setNumber(Number(e.key))
  } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
    clearCell()
  } else if (e.key === 'ArrowUp' && selected.value) {
    const [r, c] = selected.value
    selected.value = [Math.max(0, r - 1), c]
  } else if (e.key === 'ArrowDown' && selected.value) {
    const [r, c] = selected.value
    selected.value = [Math.min(8, r + 1), c]
  } else if (e.key === 'ArrowLeft' && selected.value) {
    const [r, c] = selected.value
    selected.value = [r, Math.max(0, c - 1)]
  } else if (e.key === 'ArrowRight' && selected.value) {
    const [r, c] = selected.value
    selected.value = [r, Math.min(8, c + 1)]
  }
}

/* ─────────────── 高亮（同行/同列/同宮/同數字） ─────────────── */
function isHighlighted(r, c) {
  if (!selected.value) return false
  const [sr, sc] = selected.value
  if (sr === r || sc === c) return true
  if (Math.floor(sr / 3) === Math.floor(r / 3) && Math.floor(sc / 3) === Math.floor(c / 3))
    return true
  return false
}

function isSameNumber(r, c) {
  if (!selected.value || !board.value) return false
  const [sr, sc] = selected.value
  const v = board.value[sr][sc]
  if (!v) return false
  if (sr === r && sc === c) return false
  return board.value[r][c] === v
}

/* ─────────────── 生命週期 ─────────────── */
onMounted(() => {
  if (readSave()) {
    showLoadDialog.value = true
  } else {
    openNewGameDialog()
  }
  window.addEventListener('keydown', onKey)
  window.addEventListener('beforeunload', () => {
    saveGame(true)
  })
})

onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId)
  if (noticeTimer) clearTimeout(noticeTimer)
  window.removeEventListener('keydown', onKey)
  // 卸載前保存最新狀態
  saveGame(true)
})

function displayValue(r, c) {
  if (showingSolution.value) return solution.value?.[r]?.[c] || ''
  const v = board.value?.[r]?.[c]
  return v ? v : ''
}
</script>

<template>
  <section class="container-page pt-10 sm:pt-12 pb-4 sm:pb-6">
    <p class="chip mb-3">排隊小遊戲</p>
    <h1
      class="font-serif text-2xl sm:text-4xl leading-tight tracking-tight"
      :style="{ color: 'var(--color-text)' }"
    >
      數獨・打發等位的十分鐘
    </h1>
    <p class="mt-3 text-sm sm:text-base text-[var(--color-text-soft)] leading-relaxed">
      隨機產生題目，三種難度任選。每下一步會自動儲存，下次回來會問你要不要繼續上一局。
    </p>
  </section>

  <section class="container-page pb-12 sm:pb-16">
    <div class="card p-3 sm:p-6">
      <!-- 工具列 -->
      <div class="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <button
          @click="openNewGameDialog"
          class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-medium transition hover:opacity-90"
          :style="{ background: 'var(--color-accent)', color: '#0b0d10' }"
        >
          ＋ 新遊戲
        </button>

        <div
          class="ml-auto flex items-center gap-2 sm:gap-3 text-xs sm:text-sm"
          :style="{ color: 'var(--color-text-soft)' }"
        >
          <span class="tabular-nums" :style="{ color: 'var(--color-text)' }">⏱ {{ timeText }}</span>
          <span class="hidden sm:inline">|</span>
          <span class="hidden sm:inline">難度：{{ DIFF_LABEL[difficulty] }}</span>
          <span class="sm:hidden">{{ DIFF_LABEL[difficulty] }}</span>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <!-- 數獨棋盤 -->
        <div class="flex-1 flex justify-center">
          <div v-if="generating" class="aspect-square w-full max-w-md grid place-items-center text-sm" :style="{ color: 'var(--color-text-mute)' }">產生題目中…</div>
          <div
            v-else-if="board"
            class="grid grid-cols-9 aspect-square w-full max-w-[min(92vw,28rem)] select-none"
            :style="{
              background: 'var(--color-border)',
              gap: '1px',
              padding: '2px',
              boxShadow: '0 0 0 1px var(--color-border)',
            }"
          >
            <template v-for="(row, r) in board" :key="r">
              <button
                v-for="(_, c) in row"
                :key="r + '-' + c"
                @click="selectCell(r, c)"
                class="aspect-square grid place-items-center text-sm sm:text-xl font-medium tabular-nums transition relative"
                :class="[
                  (c % 3 === 2 && c !== 8) ? 'sudoku-r' : '',
                  (r % 3 === 2 && r !== 8) ? 'sudoku-b' : '',
                ]"
                :style="{
                  background:
                    selected && selected[0] === r && selected[1] === c
                      ? 'var(--color-accent-soft)'
                      : isSameNumber(r, c)
                      ? 'color-mix(in srgb, var(--color-accent) 14%, var(--color-bg-elev))'
                      : isHighlighted(r, c)
                      ? 'color-mix(in srgb, var(--color-accent) 5%, var(--color-bg-elev))'
                      : 'var(--color-bg-elev)',
                  color: isLocked(r, c) ? 'var(--color-text)' : 'var(--color-accent)',
                  fontWeight: isLocked(r, c) ? 600 : 500,
                  outline:
                    selected && selected[0] === r && selected[1] === c
                      ? '2px solid var(--color-accent)'
                      : 'none',
                  outlineOffset: '-2px',
                }"
              >
                {{ displayValue(r, c) }}
              </button>
            </template>
          </div>
        </div>

        <!-- 數字鍵盤 + 操作 -->
        <div class="w-full lg:w-72 flex flex-col gap-3">
          <div class="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-3 gap-1.5 sm:gap-2">
            <button
              v-for="n in 9"
              :key="n"
              @click="setNumber(n)"
              class="aspect-square lg:aspect-auto lg:py-3 rounded-lg text-base sm:text-lg font-medium transition hover:opacity-90"
              :style="{
                background: 'var(--color-bg-soft)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }"
            >
              {{ n }}
            </button>
            <button
              @click="clearCell"
              class="aspect-square lg:aspect-auto lg:py-3 rounded-lg text-xs sm:text-sm transition hover:opacity-90"
              :style="{
                background: 'var(--color-bg-soft)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-soft)',
              }"
            >
              清除
            </button>
          </div>

          <div class="mt-1">
            <button
              @click="requestShowSolution"
              class="w-full py-2.5 rounded-lg text-sm font-medium transition hover:opacity-90"
              :style="{
                background: showingSolution ? 'var(--color-accent-soft)' : 'var(--color-bg-soft)',
                border: '1px solid var(--color-border)',
                color: showingSolution ? 'var(--color-accent)' : 'var(--color-text)',
              }"
            >
              {{ showingSolution ? '👁 隱藏解答' : '👁 解答' }}
            </button>
          </div>

          <div class="text-xs leading-relaxed mt-1" :style="{ color: 'var(--color-text-mute)' }">
            提示：可用鍵盤 1–9 輸入、方向鍵移動、Backspace 清除。每下一步會自動儲存。
          </div>
        </div>
      </div>

      <!-- 浮動提示訊息 -->
      <transition name="fade">
        <div
          v-if="notice"
          class="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm shadow-lg z-40"
          :style="{
            background: 'var(--color-bg-elev)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }"
        >
          {{ notice }}
        </div>
      </transition>
    </div>
  </section>

  <!-- 讀取進度詢問視窗 -->
  <transition name="fade">
    <div
      v-if="showLoadDialog"
      class="fixed inset-0 z-50 grid place-items-center p-4"
      :style="{ background: 'color-mix(in srgb, #000 60%, transparent)' }"
    >
      <div
        class="card w-full max-w-sm p-6"
        :style="{ background: 'var(--color-bg-elev)' }"
      >
        <h3 class="font-serif text-xl mb-2">發現上次的進度</h3>
        <p class="text-sm mb-5 leading-relaxed" :style="{ color: 'var(--color-text-soft)' }">
          你上次玩到一半就被叫號了？要從上次的地方接著玩，還是開新的一局？
        </p>
        <div class="flex flex-col gap-2">
          <button
            @click="chooseLoad"
            class="py-2.5 rounded-lg text-sm font-medium transition hover:opacity-90"
            :style="{ background: 'var(--color-accent)', color: '#0b0d10' }"
          >
            是，繼續上次的遊戲
          </button>
          <button
            @click="chooseNew"
            class="py-2.5 rounded-lg text-sm font-medium border transition"
            :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-soft)' }"
          >
            否，開始新的一局
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- 新遊戲難度選擇視窗 -->
  <transition name="fade">
    <div
      v-if="showNewGameDialog"
      class="fixed inset-0 z-50 grid place-items-center p-4"
      :style="{ background: 'color-mix(in srgb, #000 60%, transparent)' }"
    >
      <div class="card w-full max-w-sm p-6" :style="{ background: 'var(--color-bg-elev)' }">
        <h3 class="font-serif text-xl mb-2">選擇難度</h3>
        <p class="text-sm mb-4 leading-relaxed" :style="{ color: 'var(--color-text-soft)' }">
          挑一個難度，按下確認就會開始一局新遊戲。
        </p>
        <div class="flex flex-col gap-2 mb-5">
          <button
            v-for="d in ['easy', 'medium', 'hard']"
            :key="d"
            @click="pendingDifficulty = d"
            class="py-2.5 px-4 rounded-lg text-sm font-medium border transition text-left flex items-center justify-between"
            :style="
              pendingDifficulty === d
                ? { background: 'var(--color-accent-soft)', borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }
                : { background: 'var(--color-bg-soft)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }
            "
          >
            <span>{{ DIFF_LABEL[d] }}</span>
            <span v-if="pendingDifficulty === d">✓</span>
          </button>
        </div>
        <div class="flex gap-2">
          <button
            v-if="board"
            @click="cancelNewGame"
            class="flex-1 py-2.5 rounded-lg text-sm border transition"
            :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-soft)' }"
          >
            取消
          </button>
          <button
            @click="confirmNewGame"
            class="flex-1 py-2.5 rounded-lg text-sm font-medium transition hover:opacity-90"
            :style="{ background: 'var(--color-accent)', color: '#0b0d10' }"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- 顯示解答確認視窗 -->
  <transition name="fade">
    <div
      v-if="showSolutionConfirmDialog"
      class="fixed inset-0 z-50 grid place-items-center p-4"
      :style="{ background: 'color-mix(in srgb, #000 60%, transparent)' }"
    >
      <div class="card w-full max-w-sm p-6" :style="{ background: 'var(--color-bg-elev)' }">
        <h3 class="font-serif text-xl mb-2">要顯示解答嗎？</h3>
        <p class="text-sm mb-5 leading-relaxed" :style="{ color: 'var(--color-text-soft)' }">
          確認後會直接顯示完整答案，遊戲樂趣會少一半喔。
        </p>
        <div class="flex gap-2">
          <button
            @click="cancelShowSolution"
            class="flex-1 py-2.5 rounded-lg text-sm border transition"
            :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-soft)' }"
          >
            取消
          </button>
          <button
            @click="confirmShowSolution"
            class="flex-1 py-2.5 rounded-lg text-sm font-medium transition hover:opacity-90"
            :style="{ background: 'var(--color-accent)', color: '#0b0d10' }"
          >
            顯示解答
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- 完成提示 -->
  <transition name="fade">
    <div
      v-if="showCompleteDialog"
      class="fixed inset-0 z-50 grid place-items-center p-4"
      :style="{ background: 'color-mix(in srgb, #000 60%, transparent)' }"
    >
      <div class="card w-full max-w-sm p-6 text-center" :style="{ background: 'var(--color-bg-elev)' }">
        <div class="text-4xl mb-2">🎉</div>
        <h3 class="font-serif text-xl mb-1">完成！</h3>
        <p class="text-sm mb-5" :style="{ color: 'var(--color-text-soft)' }">
          難度：{{ DIFF_LABEL[difficulty] }}・用時 {{ timeText }}
        </p>
        <div class="flex gap-2">
          <button
            @click="showCompleteDialog = false"
            class="flex-1 py-2.5 rounded-lg text-sm border transition"
            :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-soft)' }"
          >
            關閉
          </button>
          <button
            @click="(showCompleteDialog = false), openNewGameDialog()"
            class="flex-1 py-2.5 rounded-lg text-sm font-medium transition hover:opacity-90"
            :style="{ background: 'var(--color-accent)', color: '#0b0d10' }"
          >
            再來一局
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.sudoku-r {
  box-shadow: inset -1px 0 0 0 var(--color-text-mute);
}
.sudoku-b {
  box-shadow: inset 0 -1px 0 0 var(--color-text-mute);
}
.sudoku-r.sudoku-b {
  box-shadow:
    inset -1px 0 0 0 var(--color-text-mute),
    inset 0 -1px 0 0 var(--color-text-mute);
}
</style>
