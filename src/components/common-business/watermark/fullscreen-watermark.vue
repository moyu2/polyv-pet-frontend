<!-- @file 水印层组件 -->
<template>
  <div
    class="c-fullscreen-watermark"
    :class="{
      'c-fullscreen-watermark--mobile-fullscreen': isMobileFullscreen,
    }"
    ref="fullscreenWatermark"
    v-show="isFullscreenWatermarkVisible"
  ></div>
</template>

<script setup lang="ts">
import { WatermarkTarget } from '@polyv/live-watch-sdk';
import { useGlobalInject } from '@/app/use-global-inject';
import { onMounted, onUnmounted } from 'vue';
import { useFullscreenWatermark } from './use-fullscreen-watermark';

const {
  fullscreenWatermark,
  getFullscreenWatermarkEnabled,
  isFullscreenWatermarkVisible,
  isMobileFullscreen,
} = useFullscreenWatermark();

const { getWatchCore } = useGlobalInject();

let watermarkTarget: WatermarkTarget | null = null;

const watchCore = getWatchCore();

function createWatermark() {
  const isEnabled = getFullscreenWatermarkEnabled();

  if (isEnabled && fullscreenWatermark.value) {
    watermarkTarget = watchCore.watermark.createWatermark({
      container: fullscreenWatermark.value,
    });
  }
}

onMounted(() => {
  createWatermark();
});

onUnmounted(() => {
  if (watermarkTarget) {
    watermarkTarget.destroyTarget();
    watermarkTarget = null;
  }
});
</script>

<style lang="scss">
.c-fullscreen-watermark {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 301;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.c-fullscreen-watermark--mobile-fullscreen {
  z-index: 1001;
}
</style>
