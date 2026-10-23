<!-- @file 连麦申请中的长条波动动效 -->
<template>
  <div class="c-connect-mic-wave-loading">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss">
.c-connect-mic-wave-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 12px;

  span {
    width: 4px;
    height: 4px;
    margin: 0 2px;
    background-color: $--color-white;
    border-radius: 2px;
    animation: c-connect-mic-wave-loading-bar 1s infinite ease-in-out;
  }

  span:nth-child(1) {
    animation-delay: 0.3s;
  }
  span:nth-child(2) {
    animation-delay: 0s;
  }
  span:nth-child(3) {
    animation-delay: 0.15s;
  }
  span:nth-child(4) {
    animation-delay: 0.45s;
  }
}

@keyframes c-connect-mic-wave-loading-bar {
  0%,
  100% {
    height: 4px;
  }
  50% {
    height: 12px;
  }
}
</style>
