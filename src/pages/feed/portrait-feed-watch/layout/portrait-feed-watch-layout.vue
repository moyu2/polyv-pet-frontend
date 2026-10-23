<!-- @file 竖屏端页面布局 -->
<template>
  <div
    ref="portraitLayout"
    class="c-portrait-watch-layout"
  >
    <!-- 播放器 -->
    <div
      class="c-portrait-watch-layout__player-wrap"
      :class="{
        'c-portrait-watch-layout__player-wrap__fullscreen': portraitPlayerIsPageFullscreen,
      }"
    >
      <portrait-connect-mic-container
        v-if="masterMicItem"
        ref="portraitMicContainer"
        :style="{
          paddingTop: `${portraitDocWrapHeight}px`,
        }"
      />
      <portrait-player-main v-if="canRenderPlayer" />
    </div>

    <!-- 文档 -->
    <div
      v-if="canRenderDoc"
      class="c-portrait-watch-layout__doc-wrap"
      :style="{
        height: `${portraitDocWrapHeight}px`,
      }"
    >
      <div
        class="c-portrait-watch-layout__doc-content"
        :style="{
          height: `${portraitDocContentHeight}px`,
        }"
      >
        <portrait-doc-main />
      </div>
    </div>

    <!-- 轮播屏 -->
    <div
      v-show="!isSmallWindow"
      class="c-portrait-watch-layout__carousel-wrap"
      :class="{
        'c-portrait-watch-layout__carousel-wrap__fullscreen': portraitPlayerIsPageFullscreen,
      }"
      :style="carouselStyle"
      ref="portraitWrap"
    >
      <portrait-feed-watch-layout-carousel />
    </div>

    <!-- 播放器提示 -->
    <player-tips class="c-portrait-watch-layout__player-tips"></player-tips>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import PortraitPlayerMain from '@/components/page-watch-common/player/player-main/portrait-player-main/portrait-player-main.vue';
import PortraitDocMain from '@/components/page-watch-common/doc/portrait-doc.vue';
import PortraitConnectMicContainer from '@/components/page-watch-common/connect-mic/portrait-connect-mic/portrait-connect-mic-container.vue';
import PlayerTips from '@/components/page-watch-common/player/player-control/player-tips/player-tips.vue';

import portraitFeedWatchLayoutCarousel from './portrait-feed-watch-layout-carousel.vue';

import { useDocStore } from '@/store/use-doc-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { usePlayerStore } from '@/store/use-player-store';
import { useLayoutStore } from '@/store/use-layout-store';

import { CSSProperties } from 'vue/types/jsx';
import { useResizeObserver } from '@/hooks/tools/use-resize-observer';

const { isVerticalScreenOrientation } = storeDefinitionToRefs(useLayoutStore);

const portraitLayoutStore = usePortraitLayoutStore();
const { portraitDocWrapHeight, portraitDocContentHeight, portraitPlayerIsPageFullscreen } =
  storeDefinitionToRefs(usePortraitLayoutStore);

const { canRenderPlayer } = storeDefinitionToRefs(usePlayerStore);

const { canRenderDoc } = storeDefinitionToRefs(useDocStore);

const { masterMicItem } = storeDefinitionToRefs(useConnectMicStore);

const { isSmallWindow } = storeDefinitionToRefs(useWebviewStore);

const portraitLayout = ref<HTMLElement>();
const portraitWrap = ref<HTMLElement>();
const portraitMicContainer = ref();

useResizeObserver(portraitLayout, () => {
  portraitLayoutStore.$patch({
    portraitWatchLayoutHeight: portraitLayout.value?.clientHeight || 0,
  });
});

const micTouchStart = (e: TouchEvent) => {
  const ev = e.target as HTMLElement;
  if (
    e &&
    portraitMicContainer.value &&
    ev.classList.contains('c-portrait-carousel-page-container')
  ) {
    portraitMicContainer.value.onTouchStart(e.targetTouches[0].pageY);
  }
};
const micTouchMove = (e: TouchEvent) => {
  if (e && portraitMicContainer.value) {
    portraitMicContainer.value.calcTransform(e.targetTouches[0].pageY);
  }
};
const micTouchEnd = (e: TouchEvent) => {
  if (e && portraitMicContainer.value) {
    portraitMicContainer.value.onTouchEnd(e.changedTouches[0].pageY);
  }
};

const carouselStyle = computed<CSSProperties>(() => {
  if (isVerticalScreenOrientation.value) {
    return {
      paddingTop: `${portraitDocWrapHeight.value}px`,
    };
  } else {
    return {};
  }
});

watch(
  () => masterMicItem.value,
  val => {
    if (val) {
      if (portraitWrap.value) {
        portraitWrap.value.addEventListener('touchstart', micTouchStart);
        portraitWrap.value.addEventListener('touchmove', micTouchMove);
        portraitWrap.value.addEventListener('touchend', micTouchEnd);
      }
    } else {
      if (portraitWrap.value) {
        portraitWrap.value.removeEventListener('touchstart', micTouchStart);
        portraitWrap.value.removeEventListener('touchmove', micTouchMove);
        portraitWrap.value.removeEventListener('touchend', micTouchEnd);
      }
    }
  },
);
</script>

<style lang="scss">
.c-portrait-watch-layout {
  position: relative;
  width: 100%;
  height: 100%;
}
.c-portrait-watch-layout__player-wrap {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  -webkit-overflow-scrolling: unset;
}

.c-portrait-watch-layout__player-wrap__fullscreen {
  @include force-page-fullscreen;
  // ios 兼容处理
  .c-portrait-player-main__container {
    z-index: -1;
  }
  .plvideo {
    z-index: -1;
  }
}

.c-portrait-watch-layout__doc-wrap {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 15;
  width: 100%;
  overflow: hidden;
  -webkit-overflow-scrolling: unset;
  transform: translate3d(0, 0, 0);
}

.c-portrait-watch-layout__carousel-wrap {
  position: relative;
  z-index: 20;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  pointer-events: none;
  -webkit-overflow-scrolling: unset;
}

.c-portrait-watch-layout__carousel-wrap__fullscreen {
  @include force-page-fullscreen;
}

.c-portrait-watch-layout__player-tips {
  position: absolute;
  top: 70px;
  left: 50%;
  z-index: 2300;
  transform: translateX(-50%);
}
</style>
