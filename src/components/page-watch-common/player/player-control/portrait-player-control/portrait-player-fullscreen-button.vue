<!-- @file 移动端竖屏-全屏按钮 -->

<template>
  <div
    v-show="isShowFullscreenButton"
    class="c-portrait-player-fullscreen-button"
    :class="{
      'c-portrait-player-fullscreen-button--fullscreen': !portraitPlayerIsPageFullscreen,
      'c-portrait-player-fullscreen-button--fullscreen-exit': portraitPlayerIsPageFullscreen,
      'c-portrait-player-fullscreen-button--position': usePosition,
    }"
    :style="usePosition ? portraitPlayerFullscreenBtnStyle : {}"
    data-testid="plv-player-fullscreen-toggle-btn"
    @click="togglePortraitPlayerFullscreen"
  ></div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { FullScreenMode } from '@polyv/live-watch-sdk';

import { appEvents, useEventBusEmitter } from '@/app/app-events';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';

import { usePortraitPlayerSize } from '@/components/page-watch-common/player/player-main/portrait-player-main/use-portrait-player-size';
import { PropUtils } from '@polyv/vue-components';
import { useGlobalInject } from '@/app/use-global-inject';

defineProps({
  /** 是否使用定位按钮 */
  usePosition: PropUtils.bool.def(true),
});

const { getWatchCore } = useGlobalInject();

const isShowFullscreenButton = ref(true);

const { portraitPlayerFullscreenBtnStyle } = usePortraitPlayerSize();

const layoutStore = useLayoutStore();
const portraitLayoutStore = usePortraitLayoutStore();
const { portraitPlayerIsPageFullscreen } = storeDefinitionToRefs(usePortraitLayoutStore);

watch(
  () => layoutStore.isHorizontalScreenOrientation,
  isHorizontal => {
    if (!isSystemFullscreenMode()) {
      isShowFullscreenButton.value = !isHorizontal;
      // 屏幕横屏时，如果页面全屏，则需要退出页面全屏
      if (isHorizontal && portraitPlayerIsPageFullscreen.value) {
        togglePortraitPlayerFullscreen();
      }
    }
  },
  { immediate: true },
);

const { emitEvent: setPortraitPlayerSystemFullscreen } = useEventBusEmitter(
  appEvents.portrait.PlayerSystemFullscreen,
);

function togglePortraitPlayerFullscreen() {
  // 处理系统全屏
  if (isSystemFullscreenMode()) {
    setPortraitPlayerSystemFullscreen();
    return;
  }

  // 处理页面全屏
  const isFullscreen = !portraitPlayerIsPageFullscreen.value;
  portraitLayoutStore.$patch({
    portraitPlayerIsPageFullscreen: isFullscreen,
  });
  layoutStore.$patch({
    mobilePlayerIsPageFullscreen: isFullscreen,
  });

  /**
   * 低延迟iOS软解，网页全屏需要调用 resizeScreen 重新渲染画面。由于竖屏页面全屏非播放器触发，播放器内部不知道网页全屏了，内部的resizeObserver的resize不知道是网页全屏了（并且可能导致画面比例异常），所以需要延迟调用一下resizeScreen
   */
  setTimeout(() => {
    const watchCore = getWatchCore();
    watchCore.player.resizeScreen(0, isFullscreen ? 90 : 0);
  }, 0);
}

function isSystemFullscreenMode() {
  const watchCore = getWatchCore();
  const { fullScreenMode } = watchCore.player.getPlayerSetting();
  return fullScreenMode === FullScreenMode.System;
}
</script>

<style lang="scss">
.c-portrait-player-fullscreen-button {
  display: flex;
  width: 32px;
  height: 32px;
  font-size: 32px;
  pointer-events: initial;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.c-portrait-player-fullscreen-button--position {
  position: absolute;
  right: 2px;
}

.c-portrait-player-fullscreen-button--fullscreen {
  background-image: url(./imgs/portrait-player-ui-fullscreen.png);
}
.c-portrait-player-fullscreen-button--fullscreen-exit {
  background-image: url(./imgs/portrait-player-ui-fullscreen-exit.png);
}
</style>
