<template>
  <div class="c-signal-container">
    <div
      class="c-signal-bar"
      v-for="n in barCount"
      :key="n"
      :style="{
        background,
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { PropUtils } from '@polyv/vue-components';

defineProps({
  barCount: PropUtils.number.def(5),
  background: PropUtils.string.def('#fff'),
});
</script>

<style lang="scss">
.c-signal-container {
  box-sizing: border-box;
  display: inline-flex;
  align-items: flex-end;
  justify-content: space-between;
  width: 11px;
  height: 12px;
  padding: 2px;
}

.c-signal-bar {
  display: flex;
  overflow: hidden;
  background: #fff;
  border-radius: 1px;
  animation: live-pulse 1.2s infinite ease-in-out;
}

.c-signal-bar:nth-child(2n + 1) {
  width: 1px;
}

.c-signal-bar:nth-child(2n) {
  width: 2px;
  background: transparent !important;
}
/* 定义动画关键帧 */
@keyframes live-pulse {
  0%,
  100% {
    height: 30%; /* 最低高度 */
  }
  50% {
    height: 90%; /* 最高高度 */
  }
}

/* 设置每个信号条的动画延迟，以错开每根信号条的动画 */
.c-signal-bar:nth-child(1) {
  animation-delay: 0s;
}

.c-signal-bar:nth-child(2) {
  animation-delay: 0.9s;
}

.c-signal-bar:nth-child(3) {
  animation-delay: 0.6s;
}
</style>
