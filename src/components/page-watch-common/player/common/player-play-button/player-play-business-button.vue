<!-- @file 播放器业务按钮组件/ PC 端、移动端竖屏、移动端横屏 / 正常延迟和无延迟 -->
<template>
  <player-play-button
    v-if="playerBusinessBtnVisible"
    :mode="playerBtnMode"
  >
    <template #btn-before>
      <slot name="btn-before"></slot>
    </template>

    <template #btn-after>
      <slot name="btn-after"></slot>
    </template>
  </player-play-button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePlayerControl } from '@/components/page-watch-common/player/hooks/use-player-control';
import { usePlayerStore } from '@/store/use-player-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import PlayerPlayButton from './player-play-button.vue';
import { PlayButtonMode } from './use-player-play-button';
import { PlayStatus } from '@polyv/live-watch-sdk';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { useFeedInjectStore } from '@/store/use-feed-inject-store';

const {
  normalPlayButtonVisible,

  needBigPlayerBtnForWarmup,
} = usePlayerControl();

const {
  isPlayStarted,
  playStatus,

  onceHiddenPlayButton,
  newPlayerPauseStyleEnabled,
} = storeDefinitionToRefs(usePlayerStore);

const { isSmallWindow } = storeDefinitionToRefs(useWebviewStore);

const feedInjectStore = useFeedInjectStore();

const playerBusinessBtnVisible = computed(() => {
  // 小窗场景不展示这个组件上的播放按钮，由小窗单独处理
  if (isSmallWindow.value) return false;

  // 如果已经在播放中，则不展示，杜绝播放状态不一致的场景
  if (playStatus.value === PlayStatus.Playing) return false;

  // 信息流预加载时隐藏播放按钮
  if (onceHiddenPlayButton.value) {
    return false;
  }

  // 信息流第一层隐藏播放按钮
  if (isBuildForFeedMainMode() && feedInjectStore.inFirstFeedLayout) {
    return false;
  }

  // 暖场场景下优先处理
  if (needBigPlayerBtnForWarmup.value) return true;

  // 处理正常直播和回放的场景
  return normalPlayButtonVisible.value;
});

const playerBtnMode = computed(() => {
  if (!isPlayStarted.value) {
    return PlayButtonMode.Text;
  }

  return newPlayerPauseStyleEnabled.value ? PlayButtonMode.DefaultNewSkin : PlayButtonMode.Default;
});
</script>
