<!-- webview 小窗在的播放器控制栏 -->
<template>
  <div
    class="c-player-small-window-control"
    @click="onClickWrap"
  >
    <div class="c-player-small-window-control__header">
      <mobile-icon-arrow-left
        class="c-player-small-window-control__back"
        @click.stop="onClickBack"
      />
      <mobile-icon-close
        class="c-player-small-window-control__close"
        @click.stop="onClickClose"
      />
    </div>

    <div
      v-if="normalPlayButtonVisible"
      class="c-player-small-window-control__btn g-img-cover"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { MobileIconArrowLeft, MobileIconClose } from '@/components/component-icons/mobile/map';
import { useWebviewStore } from '@/store/use-webview-store';
import { storeToRefs } from 'pinia';
import { unref } from 'vue';
import { usePlayerControl } from '../../hooks/use-player-control';

const webviewStore = useWebviewStore();
const { isSmallWindow } = storeToRefs(webviewStore);

const { normalPlayButtonVisible } = usePlayerControl();

const { getEmitter } = useGlobalInject();

function onClickWrap(event: MouseEvent) {
  // 小窗下没有显示暂停按钮时，恢复正常窗口
  if (unref(isSmallWindow) && !unref(normalPlayButtonVisible)) {
    webviewStore.toNormalWindow();
  }

  getEmitter().emit(appEvents.portrait.ClickPlayerRegion, event);
}

function onClickBack() {
  webviewStore.toNormalWindow();
}

function onClickClose() {
  webviewStore.closeWindow();
}
</script>

<style lang="scss">
.c-player-small-window-control {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
}

.c-player-small-window-control__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.c-player-small-window-control__back,
.c-player-small-window-control__close {
  display: flex;
  font-size: 22px;
  color: #fff;
}

.c-player-small-window-control__btn {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 999;
  width: 32px;
  height: 32px;
  background-image: url(./imgs/play-btn.png);
  transform: translate(-50%, -50%);
}
</style>
