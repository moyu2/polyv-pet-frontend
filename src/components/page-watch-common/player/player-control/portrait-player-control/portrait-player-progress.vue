<!-- @file 竖屏端播放器进度条 -->
<template>
  <div
    class="c-portrait-player-progress"
    :class="{ 'c-portrait-player-progress--capsule': isHorizontalScreenOrientation }"
  >
    <!-- 播放暂停按钮 -->
    <div
      v-if="playerControlPlayBtnVisible"
      class="c-portrait-player-progress__button g-img-contain"
      :class="{
        'c-portrait-player-progress__button--pause': playStatus === PlayStatus.Playing,
      }"
      @click="toTogglePlay"
    ></div>

    <!-- 当前播放时间 -->
    <div
      v-if="playbackTimeVisible"
      class="c-portrait-player-progress__time"
    >
      <span>{{ formatSeconds(currentTime, { segments: 3 }) }}</span>
    </div>

    <!-- 进度条 -->
    <div
      v-if="playerProgressVisible"
      class="c-portrait-player-progress__main"
    >
      <slider-bar
        wrap-slider-track-color="rgba(255, 255, 255, 0.4)"
        :slider-track-size="2"
        :slider-dot-size="12"
        :max="durationTime"
        :value="currentTime"
        :css-rotate-angle="portraitPlayerIsPageFullscreen ? 90 : 0"
        @drag-change="toSeekVideo"
      />
    </div>

    <!-- 总时长 -->
    <div
      v-if="playbackTimeVisible"
      class="c-portrait-player-progress__time"
    >
      <span>{{ formatSeconds(durationTime, { segments: 3 }) }}</span>
    </div>

    <!-- 退出全屏按钮 -->
    <portrait-player-fullscreen-button
      v-if="portraitPlayerIsPageFullscreen"
      class="c-portrait-player-progress__fullscreen-btn"
      :use-position="false"
    />
  </div>
</template>

<script setup lang="ts">
import SliderBar from '@/components/common-base/slider-bar/slider-bar.vue';
import PortraitPlayerFullscreenButton from './portrait-player-fullscreen-button.vue';
import { formatSeconds } from '@polyv/utils/date';
import { PlayStatus } from '@polyv/live-watch-sdk';
import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlayerAction } from '../../hooks/use-player-action';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { usePlayerControl } from '@/components/page-watch-common/player/hooks/use-player-control';
import { useLayoutStore } from '@/store/use-layout-store';

const { isHorizontalScreenOrientation } = storeDefinitionToRefs(useLayoutStore);

const { playStatus, currentTime, durationTime } = storeDefinitionToRefs(usePlayerStore);

const { portraitPlayerIsPageFullscreen } = storeDefinitionToRefs(usePortraitLayoutStore);

const { toSeekVideo, toTogglePlay } = usePlayerAction();

const { playbackTimeVisible, playerProgressVisible, playerControlPlayBtnVisible } =
  usePlayerControl();
</script>

<style lang="scss">
.c-portrait-player-progress {
  display: flex;
  align-items: center;
  height: 32px;
}

.c-portrait-player-progress--capsule {
  padding: 0 12px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 32px;
}

.c-portrait-player-progress__button {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-right: 16px;
  background-image: url(../../imgs/icon-play.png);
}
.c-portrait-player-progress__button--pause {
  background-image: url(../../imgs/icon-pause.png);
}
.c-portrait-player-progress__time {
  white-space: nowrap;
}
.c-portrait-player-progress__main {
  flex: 1;
  margin-right: 16px;
  margin-left: 16px;
}
.c-portrait-player-progress__fullscreen-btn {
  margin-left: 8px;
}
</style>
