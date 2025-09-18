<!-- src/views/ChatView.vue -->
<template>
  <!-- 置頂導覽列 -->
  <header class="topbar">
    <nav class="nav-actions">
      <button class="btn ghost" @click="logout" aria-label="登出">登出</button>
    </nav>
  </header>

  <!-- 全螢幕影片（在導覽列下方鋪滿） -->
  <div class="chat-video">
    <video autoplay muted loop playsinline class="bg-video">
      <source :src="videoSrc" type="video/mp4" />
      你的瀏覽器不支援影片播放
    </video>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import videoFile from '@/assets/image/bg.mp4'

/* ========= 參數（可依需求微調） ========= */
const MAX_RECORD_MS   = 7000   // 最長錄音時間（毫秒）
const SILENCE_DB      = -50    // 靜音門檻（dB，值越小越嚴格）
const SILENCE_HOLD_MS = 1200   // 連續靜音多久視為結束（毫秒）
const CHECK_INTERVAL  = 100    // 音量偵測頻率（毫秒）
const TRANSCRIBE_URL  = '/api/audio/transcribe' // 上傳端點

/* ========= 狀態 ========= */
const videoSrc = videoFile
let stream, mediaRecorder, chunks = []
let stopTimer = null
let audioCtx, analyser, dataArray, rafId = null
let silenceAccum = 0
let startedAt = 0

/* ========= 登出（沿用你的做法） ========= */
function logout(){
  localStorage.removeItem('access_token')
  location.replace('/elder/login') // 或 router.replace('/login')
}

/* ========= 音量偵測（Web Audio API） ========= */
function setupAnalyser(s) {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  const source = audioCtx.createMediaStreamSource(s)
  analyser = audioCtx.createAnalyser()
  analyser.fftSize = 512
  dataArray = new Uint8Array(analyser.frequencyBinCount)
  source.connect(analyser)
}

/* 將 0~255 頻譜估計為 dB 簡易值（非嚴謹，但足夠判斷靜音） */
function estimateDb() {
  analyser.getByteFrequencyData(dataArray)
  let sum = 0
  for (let i = 0; i < dataArray.length; i++) sum += dataArray[i] * dataArray[i]
  const rms = Math.sqrt(sum / dataArray.length) || 0.00001
  // 映射成近似 dB；常數 255 只是正規化用
  const db = 20 * Math.log10(rms / 255)
  return db
}

function watchSilence() {
  const loop = () => {
    const db = estimateDb()
    // 低於門檻就累加靜音時間，反之歸零
    if (db < SILENCE_DB) {
      silenceAccum += CHECK_INTERVAL
    } else {
      silenceAccum = 0
    }
    const elapsed = performance.now() - startedAt
    // 連續靜音 or 超時 → 停止錄音
    if ((silenceAccum >= SILENCE_HOLD_MS && elapsed > 1000) || elapsed >= MAX_RECORD_MS) {
      safeStop()
      return
    }
    rafId = setTimeout(loop, CHECK_INTERVAL)
  }
  rafId = setTimeout(loop, CHECK_INTERVAL)
}

/* ========= 錄音流程 ========= */
async function startRecording() {
  // 1) 取得麥克風
  stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  setupAnalyser(stream)

  // 2) 建立 MediaRecorder
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
  chunks = []
  silenceAccum = 0
  startedAt = performance.now()

  mediaRecorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }

  mediaRecorder.onstop = async () => {
    try {
      // 清除計時與監聽
      if (stopTimer) clearTimeout(stopTimer)
      if (rafId) clearTimeout(rafId)

      // 3) 組成音檔並上傳到 /audio/transcribe
      const blob = new Blob(chunks, { type: 'audio/webm' })
      const fd = new FormData()
      fd.append('file', blob, 'speech.webm')

      await axios.post(TRANSCRIBE_URL, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      // ↑ 成功就代表你的需求「錄音結束 → 自動上傳」已完成
      // 如需收到文字可用： const text = res.data?.text

      // 若要自動下一輪，可在此再呼叫 startRecording()
      // setTimeout(() => startRecording(), 600)
    } catch (err) {
      console.error('上傳轉寫失敗：', err)
    }
  }

  mediaRecorder.start()
  // 4) 啟動靜音監測與最長時間保險
  watchSilence()
  stopTimer = setTimeout(safeStop, MAX_RECORD_MS + 200)
}

function safeStop() {
  try {
    if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop()
  } catch (_) {}
}

/* ========= 生命週期 ========= */
onMounted(async () => {
  try {
    await startRecording()  // 進頁就請求麥克風並開始錄音
  } catch (e) {
    console.error('麥克風權限失敗：', e)
  }
})

onBeforeUnmount(() => {
  safeStop()
  if (stopTimer) clearTimeout(stopTimer)
  if (rafId) clearTimeout(rafId)
  if (audioCtx) audioCtx.close().catch(()=>{})
  if (stream) stream.getTracks().forEach(t => t.stop())
})
</script>

<style scoped>
/* 關掉全域雙欄/置中（避免影片被擠到上方或左側） */
:global(body),
:global(#app){
  display: block !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* 置頂導覽列 */
.topbar{
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 64px;
  z-index: 1000;
  display:flex; align-items:center; justify-content: flex-end;
  padding: 0 16px;
  background: rgba(255,255,255,.82);
  border-bottom: 1px solid #363636;
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
}
.btn.ghost{
  background: transparent;
  border: 1px solid #334155;
  color: #1d418a;
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* 影片容器：鋪滿 header 下方整個視窗 */
.chat-video{
  position: fixed;
  top: 64px; left: 0; right: 0; bottom: 0;  /* 扣掉導覽列 */
  overflow: hidden;
  background: #000;
  z-index: 0;
}
.bg-video{
  display:block;       /* 移除 inline 底部空隙 */
  width: 100%;
  height: 100%;
  object-fit: cover;   /* 滿版裁切 */
  object-position: center;
}
</style>
