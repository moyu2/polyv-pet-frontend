<template>
  <div
    v-show="!portraitPlayerIsPageFullscreen"
    class="c-portrait-carousel-main-screen__bottom__item c-portrait-carousel-main-screen__bottom__item--padding c-portrait-carousel-main-screen__bottom__item--pointer-event"
    @click="onClickPlayerRegion"
  >
    <div
      class="c-portrait-chat-wrap"
      :class="{
        'has-product-bubble': productBubbleVisible,
      }"
    >
      <div
        class="c-portrait-chat-wrap__inner"
        :style="{
          height: `${swiperHeight}px`,
        }"
      >
        <chat-msg-list />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { appEvents, useEventBusEmitter } from '@/app/app-events';
import ChatMsgList from '@/components/page-watch-common/chat-v2/chat-msg-list/index.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { useWindowResizeListener } from '@polyv/vue-components';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

const webViewStore = useWebviewStore();
const { productBubbleVisible } = storeDefinitionToRefs(useInteractReceiveStore);

const portraitLayoutStore = usePortraitLayoutStore();
const { portraitPlayerIsPageFullscreen } = storeToRefs(portraitLayoutStore);

const { emitEvent: onClickPlayerRegion } = useEventBusEmitter(appEvents.portrait.ClickPlayerRegion);

const swiperHeight = ref(getSwiperHeight());

/**
 * 获取轮播区域高度
 */
function getSwiperHeight() {
  return document.documentElement.clientHeight * 0.24;
}

function resetSwiperHeight() {
  // 延迟 300 毫秒，确保页面布局已更新
  setTimeout(() => {
    swiperHeight.value = getSwiperHeight();
  }, 300);
}

useWindowResizeListener(() => {
  resetSwiperHeight();
});

if (webViewStore.isPlvWebview) {
  watch(
    () => webViewStore.isSmallWindow,
    () => {
      if (!webViewStore.isSmallWindow) {
        resetSwiperHeight();
      }
    },
  );
}
</script>

<style lang="scss">
.c-portrait-chat-wrap {
  box-sizing: border-box;
  width: 100%;
  padding-right: 54px;

  &.has-product-bubble {
    padding-right: 120px;
  }
}

.c-portrait-chat-wrap__inner {
  width: 100%;
  height: 208px;
  pointer-events: initial;
}
</style>
