<!-- PC 端-播放器进度条 -->

<template>
  <div class="c-pc-player-progress-bar">
    <slider-bar
      wrap-slider-track-color="rgba(255, 255, 255, 0.3)"
      :slider-track-size="4"
      slider-track-radius-hide
      hover-to-zoom
      :max="durationTime"
      :value="currentTime"
      :tooltips="slideBarTooltipVisible"
      @drag-change="toSeekVideo"
    >
      <template #tooltips="{ content }">
        {{ formatSeconds(content, { segments: 3 }) }}
      </template>
      <template #markPoint="{ sliderBarHover, sliderBarContainer }">
        <pc-player-time-axis-mark-point
          v-if="sliderBarContainer"
          :force-hover="sliderBarHover"
          :container-el="sliderBarContainer"
          @mark-point-hover="updateSlideBarTooltipVisible"
        />
      </template>
    </slider-bar>
  </div>
</template>

<script lang="ts" setup>
import { formatSeconds } from '@polyv/utils/date';

import SliderBar from '@/components/common-base/slider-bar/slider-bar.vue';
import PcPlayerTimeAxisMarkPoint from '../player-time-axis-mark/pc-player-time-axis-mark-point.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlayerStore } from '@/store/use-player-store';

import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { ref } from 'vue';
const { currentTime, durationTime } = storeDefinitionToRefs(usePlayerStore);

const slideBarTooltipVisible = ref(true);

function updateSlideBarTooltipVisible(isMarkPointHover: boolean) {
  slideBarTooltipVisible.value = !isMarkPointHover;
}

const { toSeekVideo } = usePlayerAction();
</script>

<style lang="scss">
.c-pc-player-progress-bar {
  width: 100%;
  height: 100%;
}
</style>
