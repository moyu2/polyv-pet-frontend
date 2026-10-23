<!-- 移动端横屏-播放器进度条 -->
<template>
  <div class="c-mobile-player-progress-bar">
    <slider-bar
      wrap-slider-track-color="rgba(255, 255, 255, 0.3)"
      :slider-track-size="2"
      :slider-dot-size="12"
      :max="durationTime"
      :value="currentTime"
      :css-rotate-angle="!isHorizontalScreenOrientation ? 90 : 0"
      @drag-change="toSeekVideo"
    >
      <template #markPoint="{ sliderBarContainer }">
        <mobile-player-time-axis-mark-point
          :top-dot-visible="isPageFullscreenOrHorizontalScreen"
          :container-el="sliderBarContainer"
        />
      </template>
    </slider-bar>
  </div>
</template>

<script lang="ts" setup>
import SliderBar from '@/components/common-base/slider-bar/slider-bar.vue';
import MobilePlayerTimeAxisMarkPoint from '../player-time-axis-mark/mobile-player-time-axis-mark-point.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlayerStore } from '@/store/use-player-store';

import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { useLayoutStore } from '@/store/use-layout-store';

const { isPageFullscreenOrHorizontalScreen, isHorizontalScreenOrientation } =
  storeDefinitionToRefs(useLayoutStore);
const { currentTime, durationTime } = storeDefinitionToRefs(usePlayerStore);

const { toSeekVideo } = usePlayerAction();
</script>

<style lang="scss">
.c-mobile-player-progress-bar {
  width: 100%;
  height: 100%;
}
</style>
