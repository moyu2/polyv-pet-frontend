<!-- @file PC 端播放器封面图 -->
<template>
  <div
    class="c-pc-player-cover-img"
    :class="{
      'c-pc-player-cover-img__prevent-player-click': preventPlayerClick,
    }"
  >
    <!-- 暖场图/播放器封面图 -->
    <div
      v-if="warmUpRenderCover"
      v-show="showWarmUpImg"
      class="c-pc-player-cover-img__warm-up-img"
    >
      <channel-splash-img :cover-img="warmUpRenderCover" />
    </div>
    <!-- 音频直播下占位图-直播封面图 -->
    <player-audio-live-placeholder
      v-show="showAudioLivePlaceholder"
      class="c-pc-player-cover-img__audio-cover-img"
      use-splash-img
    />
    <!-- 研讨会频道-主持进入分组讨论占位图 -->
    <div
      v-show="isSeminarHostInGroup"
      class="c-pc-player-cover-img__seminar__hostInGroup"
      :class="{
        'c-pc-player-cover-img__seminar__hostInGroup__right': mainScreen === MainScreenContent.Doc,
      }"
    >
      <p>{{ $lang('seminar.hostInGroup') }}</p>
    </div>
    <!-- 多皮肤主题默认图 -->
    <div
      v-if="!warmUpRenderCover && watchThemeStyleConfig && !isPlayStarted"
      class="c-pc-player-cover-img__warm-up-img"
    >
      <channel-splash-img />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ChannelSplashImg from '@/components/common-business/channel-splash-img/index.vue';
import PlayerAudioLivePlaceholder from '@/components/common-business/player/player-audio-live-placeholder.vue';

import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { MainScreenContent } from '@polyv/live-watch-sdk';
import { useThemeStore } from '@/store/use-theme-store';

const {
  showWarmUpImg,
  warmUpRenderCover,

  showAudioLivePlaceholder,
  isPlayStarted,
} = storeDefinitionToRefs(usePlayerStore);

const { watchThemeStyleConfig } = storeDefinitionToRefs(useThemeStore);

const { isSeminarHostInGroup } = storeDefinitionToRefs(useChannelStore);
const { mainScreen } = storeDefinitionToRefs(useLayoutStore);

const preventPlayerClick = computed(() => {
  if (isSeminarHostInGroup.value) return true;

  return false;
});
</script>

<style lang="scss">
.c-pc-player-cover-img {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 8;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.c-pc-player-cover-img__prevent-player-click {
  pointer-events: visible;
}

.c-pc-player-cover-img__warm-up-img {
  position: absolute;
  width: 100%;
  height: 100%;
}

.c-pc-player-cover-img__audio-cover-img {
  position: absolute;
  width: 100%;
  height: 100%;
}

.c-pc-player-cover-img__seminar__hostInGroup {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
  font-size: 18px;
  color: rgba(#fff, 0.6);
  text-align: center;

  cursor: default;
  user-select: none;
  background: #272832;
}
.c-pc-player-cover-img__seminar__hostInGroup__right {
  font-size: 14px;
}
</style>
