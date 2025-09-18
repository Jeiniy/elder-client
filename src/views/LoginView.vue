<script setup>
import { login } from '@/api'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const email = ref('')
const password = ref('')
const err = ref('')
const loading = ref(false)

async function onLogin () {
  if (loading.value) return
  err.value = ''; loading.value = true
  try {
    const { data } = await login({ email: email.value.trim(), password: password.value })
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('userName', data.user?.name || '')
    // 登入成功後轉到長者端的首頁
    router.push('/image')
  } catch (e) {
    err.value = e?.response?.data?.detail || '帳號或密碼錯誤'
  } finally {
    loading.value = false
  }
}
</script>


<template>
  <div class="page">
    <main class="card">
      <h1 class="title">登入</h1>

      <!-- 用 form 搭配 @submit.prevent，自動支援 Enter -->
      <form @submit.prevent="onLogin" style="display:grid;gap:14px">
        <label class="label" for="email">帳號（Email）</label>
        <input
          id="email"
          v-model="email"
          class="input"
          type="email"
          autocomplete="username"
          placeholder="請輸入 Email"
        />

        <label class="label" for="pass">密碼</label>
        <input
          id="pass"
          v-model="password"
          class="input"
          type="password"
          autocomplete="current-password"
          placeholder="請輸入密碼"
        />

        <button class="btn" type="submit" :disabled="loading">
          {{ loading ? '登入中…' : '登入' }}
        </button>
      </form>

      <p v-if="err" class="err">{{ err }}</p>
    </main>

    <footer class="footer">
      <small>© Elder Care System</small>
    </footer>
  </div>
</template>

<style scoped>
/* ---------- 基礎色系（高對比、弱視亦清楚） ---------- */
:root {
  --bg: #0f172a;        /* 深藍灰背景 */
  --card: #111827;      /* 卡片底 */
  --text: #e5e7eb;      /* 文字 */
  --muted: #9ca3af;     /* 次要文字 */
  --accent: #22d3ee;    /* 重點色（按鈕邊/聚焦） */
  --input: #1f2937;     /* 輸入框底 */
  --input-border: #334155;
  --err: #ef4444;
}

/* ---------- 版面：iPad 橫向置中 + 大按鈕 ---------- */
.page {
  min-height: 100svh;
  padding: max(24px, env(safe-area-inset-top)) max(24px, env(safe-area-inset-right))
           max(24px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left));
  background: radial-gradient(1200px 800px at 80% -10%, #1e293b 0%, var(--bg) 60%);
  display: grid;
  grid-template-rows: 1fr auto;
  place-items: center;
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans,
    'Microsoft JhengHei', sans-serif;
}

.card {
  width: min(560px, 92vw);              /* iPad 橫向目標 420–560px */
  background: color-mix(in oklab, var(--card) 92%, black);
  border: 1px solid #1f2937;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,.35);
  padding: clamp(20px, 4vw, 40px);
  display: grid;
  gap: 14px;
}

/* ---------- 文字大小：用 clamp 配合不同尺寸 ---------- */
.title {
  margin: 4px 0 10px;
  font-weight: 700;
  font-size: clamp(22px, 3.2vw, 34px);
  letter-spacing: .02em;
  text-align: center;
}

.label {
  color: var(--muted);
  font-size: clamp(12px, 1.4vw, 14px);
}

.input {
  appearance: none;
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--input);
  border: 1px solid var(--input-border);
  color: var(--text);
  font-size: clamp(16px, 2vw, 18px);
  outline: none;
}
.input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 25%, transparent);
}

/* ---------- 大按鈕：好點、好按 ---------- */
.btn {
  margin-top: 6px;
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  background: linear-gradient(180deg, #06b6d4, #0891b2);
  color: white;
  font-weight: 700;
  font-size: clamp(16px, 2vw, 18px);
  border: none;
  cursor: pointer;
  transition: transform .05s ease, filter .2s;
}
.btn:hover { filter: brightness(1.03); }
.btn:active { transform: translateY(1px); }
.btn:disabled { opacity: .6; cursor: not-allowed; }

.err { color: var(--err); margin-top: 6px; font-size: 14px; }

/* ---------- iPad 橫向／4:3 優化 ---------- */
@media (orientation: landscape) and (min-width: 1024px) {
  .card { gap: 16px; }
}

/* ---------- 極小畫面（手機）也能美觀 ---------- */
@media (max-width: 420px) {
  .card { border-radius: 16px; padding: 20px; }
}

.footer {
  margin-top: 18px;
  color: var(--muted);
}
</style>
