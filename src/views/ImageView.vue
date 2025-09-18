<template>
  <div class="ipad-air">
    <img src="@/assets/e82b8ea2-6254-481b-8094-ccec59daba5c.png" alt="可愛圖片" />
  </div>
</template>

<script setup>
// 這裡暫時不需要邏輯
</script>

<style scoped>
.ipad-air {
  width: 2360px;   /* iPad Air 6 寬度 */
  height: 1640px;  /* iPad Air 6 高度 */
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000; /* 黑底讓圖片突顯，可以改成白色 */
  overflow: hidden;
}

.ipad-air img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* 確保圖片完整顯示，不會變形 */
}
</style>
