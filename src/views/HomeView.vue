<!-- src/views/HomeView.vue -->
<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

function goInteract () {
  router.push('/chat')   // 或 '/start'
}
function logout () {
  localStorage.removeItem('access_token')
  router.replace('/login')
}
</script>

<template>
  <!-- 置頂導覽列 -->
   <header class="topbar">
    <div class="brand">👵 長者端</div>
    <nav class="nav-actions">
      <button class="btn ghost" @click="logout" aria-label="登出">登出</button>
    </nav>
  </header> 

  <!-- 注意：改成 viewport-center 這個全新 class，避免被舊的 .main 覆蓋 -->
  <main class="home-shell">
    <section class="card home-card" role="region" aria-labelledby="home-title">
      <h1 id="home-title" class="title">哈囉 ~</h1>
      <p class="subtitle">
        按下下面的按鈕，將前往「互動頁面」，並在那裡請求麥克風權限開始聊天。
      </p>

      <button class="cute-big-btn" @click="goInteract">
        <span class="icon" aria-hidden="true">💬</span>
        開始使用
        <span class="sparkle" aria-hidden="true">✨</span>
      </button>

      <p class="note">首次使用時，瀏覽器會跳出「允許麥克風」，請點選允許。</p>
    </section>
  </main>
</template>

<style scoped>


/* 置頂導覽列（滿版） */
.topbar{
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 64px;
  z-index: 100;
  display:flex; align-items:center; justify-content:space-between;
  padding: 0 16px;
  background: rgba(17,24,39,.82);
  border-bottom: 1px solid #1f2937;
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  color:#e5e7eb;
}
.btn.ghost{
  background: transparent;
  border: 1px solid #334155;
  color: #e5e7eb;
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}


/* :root{ --headerH: 64px; } */


.home-shell{
  margin-top: calc(var(--headerH) + env(safe-area-inset-top, 0px)) !important;
  display: grid !important;
  place-items: center !important;
  width: 100% !important;
  max-width: none !important;
  padding: 24px 16px env(safe-area-inset-bottom, 0px);
  box-sizing: border-box;
  margin-left: 140px;
}


.card{
  text-align:center;
  border: 1px solid #1f2937;
  background:#ffffff;
  border:0px solid #1f2937; border-radius:28px;
  box-shadow: 0 24px 60px rgba(0,0,0,.25);
  padding: clamp(24px, 4vw, 40px);
  width: min(800px, 92vw);
  height: 350px;
}


/* .title{ 
    margin:0 0 10px; 
    font-size: clamp(24px, 3vw, 36px); 
    font-weight: 900; 
} */
.subtitle{ 
    margin:6px 0 20px; 
    color:#3a3a3a; 
    font-size: clamp(15px, 1.8vw, 18px); 
}
.note{ 
    color:#3a3a3a; 
    font-size:14px; 
    margin-top:12px 
}

.cute-big-btn{
  display: inline-flex; align-items:center; justify-content:center; gap:10px;
  width: min(520px, 95%);
  padding: clamp(20px, 3.2vw, 26px) clamp(28px, 4vw, 40px);
  border:none; border-radius:999px;
  background:  #4f8ebe;
  color:#ffffff; font-weight:900; font-size: clamp(20px, 2.6vw, 28px);
  letter-spacing:.02em; cursor:pointer;
  transition: transform .08s ease, filter .2s ease, box-shadow .2s ease;
}
.cute-big-btn:hover{ filter:brightness(1.03); transform: translateY(-1px); }
.cute-big-btn:active{ transform: translateY(0); box-shadow: 0 12px 28px rgba(34,211,238,.22), 0 4px 12px rgba(0,0,0,.16); }
.cute-big-btn .icon{ font-size:1.1em; }
.cute-big-btn .sparkle{ font-size:1em; transform: translateY(-2px); } 
</style>
