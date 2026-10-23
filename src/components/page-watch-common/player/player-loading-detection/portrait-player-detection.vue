<!-- @file 竖屏移动端播放缓冲提示切换线路或降低清晰度 -->
<template>
  <div
    v-if="visible"
    :class="[
      'c-loading-detection',
      `c-loading-detection--${tipsType}`,
      isMobileWebPageFullscreen && 'c-loading-detection--mobile-fullscreen',
    ]"
  >
    <!-- 提示文案 -->
    <div class="c-loading-detection__text">
      <template v-if="tipsType === LoadingDetectionTipsType.WAIT_TO_SWITCH">
        <span>{{ switchSuggestionText }}</span>
      </template>

      <template v-else-if="tipsType === LoadingDetectionTipsType.SWITCHING">
        <span>{{ $lang('player.loading.detection.switching') }} </span>
      </template>

      <template v-else>
        <span>{{ $lang('player.loading.detection.success') }}</span>
        <span class="c-loading-detection__text-highlight">{{ currentSuggestionText }}</span>
      </template>
    </div>

    <div
      class="c-loading-detection__button"
      @click="executeLoadingDetection"
    >
      {{ $lang('player.loading.detection.button') }}
    </div>

    <mobile-icon-close
      class="c-loading-detection__close"
      @click="visible = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { MobileIconClose } from '@/components/component-icons/mobile/map';

import { useLoadingDetection, LoadingDetectionTipsType } from './use-loading-detection';

const {
  visible,
  isMobileWebPageFullscreen,
  tipsType,
  switchSuggestionText,
  currentSuggestionText,
  executeLoadingDetection,
} = useLoadingDetection();
</script>

<style lang="scss">
.c-loading-detection {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  color: #fff;
  white-space: nowrap;
  background: rgba(#000, 0.8);
  border-radius: 8px;
}

.c-loading-detection__button {
  color: #85a6f7;
  cursor: pointer;
}

.c-loading-detection--switching {
  .c-loading-detection__button {
    display: none;
  }
}

.c-loading-detection__text-highlight {
  margin: 0 2px;
  color: #85a6f7;
}

@keyframes hideAfter3s {
  0% {
    visibility: visible;
    opacity: 1;
  }
  90% {
    visibility: visible;
    opacity: 1;
  }
  100% {
    visibility: hidden;
    opacity: 0;
  }
}

.c-loading-detection--success {
  animation: hideAfter3s 3s ease-out forwards;

  .c-loading-detection__button {
    display: none;
  }

  .c-loading-detection__close {
    display: none;
  }
}
</style>
