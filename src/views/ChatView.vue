<!-- src/views/ChatView.vue -->
<template>
  <header class="topbar">
    <nav class="nav-actions">
      <button class="btn ghost" @click="logout" aria-label="登出">登出</button>
    </nav>
  </header>

  <div class="media-wrap">
    <img v-if="!showVideo" :src="idleImg" class="face" alt="idle face" />
    <video
      v-else
      ref="videoEl"
      :src="speakingVideo"
      class="face"
      playsinline
      muted
      autoplay
      loop
    ></video>
  </div>

  <div class="status-pill" :class="isBusy ? 'busy' : 'idle'">
    {{ isBusy ? '處理中…' : '可對我說話' }}
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { transcribe, chat } from '@/api'

// 靜態資源
import idleImg from '@/assets/image/12.png'
import speakingVideo from '@/assets/image/bg.mp4'

// 路由 & 登出
const router = useRouter()
function logout () {
  localStorage.removeItem('access_token')
  router.replace('/')
}

// 狀態：圖片 ↔ 影片
const showVideo = ref(false)
const videoEl = ref(null)
function handleTTSStart () {
  showVideo.value = true
  try { videoEl.value?.play?.() } catch {}
}
function handleTTSEnd () {
  showVideo.value = false
  if (videoEl.value) {
    try { videoEl.value.pause?.(); videoEl.value.currentTime = 0 } catch {}
  }
}

// VAD + 錄音
let stream, audioCtx, analyser, source, rafId
let mediaRecorder, chunks = []
let speaking = false, lastVoiceTs = 0
const START_THRESHOLD = 0.02
const STOP_THRESHOLD = 0.01
const SILENCE_HANG_MS = 700
const isBusy = ref(false)

async function initMic () {
  stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  audioCtx = new AudioContext()
  analyser = audioCtx.createAnalyser()
  analyser.fftSize = 2048
  source = audioCtx.createMediaStreamSource(stream)
  source.connect(analyser)

  mediaRecorder = new MediaRecorder(stream)
  mediaRecorder.ondataavailable = e => chunks.push(e.data)
  mediaRecorder.onstop = onUtteranceEnd

  loopVAD()
}

function loopVAD () {
  const buf = new Uint8Array(analyser.fftSize)
  analyser.getByteTimeDomainData(buf)

  let sum = 0
  for (let i = 0; i < buf.length; i++) {
    const v = (buf[i] - 128) / 128
    sum += v * v
  }
  const rms = Math.sqrt(sum / buf.length)

  const now = performance.now()
  if (!speaking && rms > START_THRESHOLD) {
    speaking = true
    lastVoiceTs = now
    startRecording()
  } else if (speaking) {
    if (rms > STOP_THRESHOLD) {
      lastVoiceTs = now
    } else if (now - lastVoiceTs > SILENCE_HANG_MS) {
      speaking = false
      stopRecording()
    }
  }
  rafId = requestAnimationFrame(loopVAD)
}

function startRecording () {
  chunks = []
  mediaRecorder?.start()
}
function stopRecording () {
  if (mediaRecorder?.state === 'recording') mediaRecorder.stop()
}

// 完成一句話 → STT → Chat → TTS
async function onUtteranceEnd () {
  const blob = new Blob(chunks, { type: 'audio/webm' })
  chunks = []
  if (!blob.size) return

  try {
    isBusy.value = true

    // STT
    const { data: sttData } = await transcribe(blob)
    const userText = sttData?.text || ''
    console.log('[STT]', userText)
    if (!userText) return

    // Chat（直接取得回覆和語音 base64）
    const token = localStorage.getItem('access_token')
    console.log('[Token]', token) // 新增這行
    const { data: chatData } = await chat(userText, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const replyText = chatData?.reply || chatData?.text || ''
    const audioBase64 = chatData?.audio_base64
    console.log('[Chat reply]', replyText)
    console.log('[Chat audio_base64]', audioBase64?.slice(0, 40)) // 顯示前40字元
    let audioUrl = ''
    if (audioBase64) {
      const mime = 'audio/mp3'
      const bin = atob(audioBase64)
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      const blobUrl = new Blob([bytes], { type: mime })
      audioUrl = URL.createObjectURL(blobUrl)
      console.log('[Audio URL]', audioUrl)
    }

    if (audioUrl) {
      await playTTS(audioUrl)
      console.log('[TTS] 播放完成')
    } else {
      console.warn('[TTS] 沒有語音資料')
    }
  } catch (e) {
    console.error('[voice-flow error]', e)
    handleTTSEnd()
  } finally {
    isBusy.value = false
  }
}

function playTTS (url) {
  return new Promise((resolve) => {
    const audio = new Audio(url)
    audio.addEventListener('play', () => handleTTSStart(), { once: true })
    audio.addEventListener('ended', () => { handleTTSEnd(); resolve() }, { once: true })
    audio.addEventListener('error', () => { handleTTSEnd(); resolve() }, { once: true })
    audio.play().catch(() => { handleTTSEnd(); resolve() })
  })
}

// 生命週期
onMounted(() => { initMic().catch(console.error) })
onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
  mediaRecorder?.stop()
  source?.disconnect()
  analyser?.disconnect()
  stream?.getTracks()?.forEach(t => t.stop())
})
</script>

<style scoped>
.topbar {
  position: fixed; top: 0; left: 0; right: 0;
  height: 64px; z-index: 100;
  display: flex; justify-content: flex-end; align-items: center;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.82);
  border-bottom: 1px solid #363636;
  backdrop-filter: blur(10px);
}
.btn.ghost {
  background: transparent; border: 1px solid #334155;
  color: #1d418a; padding: 10px 14px;
  border-radius: 12px; font-weight: 700; cursor: pointer;
}
.media-wrap {
  position: fixed; inset: 64px 0 0 0;
  background: #000; display: grid; place-items: center;
}
.face {
  width: 100%; height: 100%;
  object-fit: contain;
  user-select: none; pointer-events: none;
}
.status-pill {
  position: fixed; left: 12px; bottom: 12px;
  padding: 8px 12px; border-radius: 999px;
  font-weight: 700; color: #fff; z-index: 200;
}
.status-pill.idle { background:#16a34a; }
.status-pill.busy { background:#2563eb; }
</style>

