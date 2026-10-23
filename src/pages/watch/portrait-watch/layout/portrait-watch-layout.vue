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
      :style="playerWrapStyle"
    >
      <portrait-connect-mic-container
        v-if="connectMicList.length"
        ref="portraitMicContainer"
        :style="{
          paddingTop: `${portraitDocWrapHeight}px`,
        }"
      />
      <player-play-button
        v-if="shouldShowPlayButton"
        :mode="PlayButtonMode.Text"
        @click="onPlayClick"
      />
      <portrait-player-main v-if="canRenderPlayer" />
    </div>

    <!-- 文档 -->
    <div
      v-if="canRenderDoc"
      class="c-portrait-watch-layout__doc-wrap"
      :class="{
        'c-portrait-watch-layout__doc-wrap__main': isDocMainScreen,
      }"
      :style="docStyle"
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
        'c-portrait-watch-layout__carousel-wrap__hide': hideCarousel,
      }"
      :style="carouselStyleRender"
      ref="portraitWrap"
    >
      <portrait-watch-layout-carousel />
    </div>

    <!-- 播放器提示 -->
    <player-tips class="c-portrait-watch-layout__player-tips"></player-tips>

    <!-- 字幕管理 -->
    <portrait-subtitle-manager />
  </div>
</template>

<script setup lang="ts">
import PortraitConnectMicContainer from '@/components/page-watch-common/connect-mic/portrait-connect-mic/portrait-connect-mic-container.vue';
import PortraitDocMain from '@/components/page-watch-common/doc/portrait-doc.vue';
import PlayerPlayButton from '@/components/page-watch-common/player/common/player-play-button/player-play-button.vue';
import PlayerTips from '@/components/page-watch-common/player/player-control/player-tips/player-tips.vue';
import PortraitPlayerMain from '@/components/page-watch-common/player/player-main/portrait-player-main/portrait-player-main.vue';
import PortraitSubtitleManager from '@/components/page-watch-common/subtitle/portrait-subtitle-manager/portrait-subtitle-manager.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { computed, nextTick, ref, watch } from 'vue';
import PortraitWatchLayoutCarousel from './portrait-watch-layout-carousel.vue';

import { PlayButtonMode } from '@/components/page-watch-common/player/common/player-play-button/use-player-play-button';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useDocStore } from '@/store/use-doc-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { usePlayerStore } from '@/store/use-player-store';
import { useWebviewStore } from '@/store/use-webview-store';

import { useSmallClassPlay } from '@/components/page-watch-common/connect-mic/hooks/use-small-class-play';
import { useResizeObserver } from '@/hooks/tools/use-resize-observer';
import { MainScreenContent } from '@polyv/live-watch-sdk';
import { CSSProperties } from 'vue/types/jsx';
import { isAndroid } from '@/assets/utils/browser';
import { usePageStore } from '@/store/use-page-store';

const { isVerticalScreenOrientation, mainScreen, mobileInputFocusing, mobileKeyboardHeight } =
  storeDefinitionToRefs(useLayoutStore);

const portraitLayoutStore = usePortraitLayoutStore();
const { portraitDocWrapHeight, portraitDocContentHeight, portraitPlayerIsPageFullscreen } =
  storeDefinitionToRefs(usePortraitLayoutStore);

const { canRenderPlayer } = storeDefinitionToRefs(usePlayerStore);

const { canRenderDoc, documentSwitch } = storeDefinitionToRefs(useDocStore);

const { masterMicItem, connectMicList } = storeDefinitionToRefs(useConnectMicStore);

const { isSmallWindow } = storeDefinitionToRefs(useWebviewStore);

const { pageClientHeight } = storeDefinitionToRefs(usePageStore);

const { shouldShowPlayButton, onPlayClick, addPortraitClickEvent } = useSmallClassPlay();

const portraitLayout = ref<HTMLElement>();
const portraitWrap = ref<HTMLElement>();
const portraitMicContainer = ref();

addPortraitClickEvent();

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

const isDocMainScreen = computed(() => {
  return (
    mainScreen.value === MainScreenContent.Doc &&
    portraitLayoutStore.portraitDocSideSwitchVisible &&
    !masterMicItem.value
  );
});

const carouselStyle = computed<CSSProperties>(() => {
  if (isVerticalScreenOrientation.value) {
    return {
      paddingTop: `${portraitDocWrapHeight.value * (isDocMainScreen.value ? 2 : 1)}px`,
    };
  } else {
    return {};
  }
});

const carouselStyleRender = ref<CSSProperties>({});

// 是否暂时隐藏轮播屏
const hideCarousel = ref(false);

// 是否正在全屏或退出播放器预览
const documentSwitchChanging = ref(false);

const docStyle = computed<CSSProperties>(() => {
  if (isDocMainScreen.value) {
    return {
      height: `${portraitDocWrapHeight.value}px`,
      top: `${portraitDocWrapHeight.value}px`,
      overflow: portraitDocWrapHeight.value === 0 ? 'hidden' : 'visible',
    };
  } else {
    return {
      height: `${portraitDocWrapHeight.value}px`,
    };
  }
});

watch(
  () => documentSwitch.value,
  () => {
    documentSwitchChanging.value = true;
    nextTick(() => {
      documentSwitchChanging.value = false;
    });
  },
);

watch(
  carouselStyle,
  val => {
    if (documentSwitchChanging.value) {
      carouselStyleRender.value = val;
      return;
    }
    hideCarousel.value = true;
    carouselStyleRender.value = val;
    setTimeout(() => {
      hideCarousel.value = false;
    }, 48);
  },
  {
    immediate: true,
  },
);

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

const playerWrapStyle = computed(() => {
  const styles: CSSProperties = {};

  if (mobileInputFocusing.value) {
    let transformHeight = mobileKeyboardHeight.value;

    if (portraitDocWrapHeight.value === 0) {
      transformHeight = mobileKeyboardHeight.value / 1.5;
    } else if (mainScreen.value === MainScreenContent.Player) {
      transformHeight = mobileKeyboardHeight.value / 3;
      /**
       * 针对安卓设备，键盘显示时页面高度减少
       * 如果播放器在下方，则往上偏移位置
       */
      if (isAndroid) {
        transformHeight = pageClientHeight.value * 0.3 * -1;
      }
    }

    styles.transform = `translateY(${transformHeight}px)`;
    styles['z-index'] = 100;
  }

  return styles;
});
</script>

<style lang="scss">
.c-portrait-watch-layout {
  position: relative;
  flex: 1;
  overflow: hidden;
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

  &.c-portrait-watch-layout__doc-wrap__main {
    z-index: 11;
    overflow: visible;
    .c-portrait-doc {
      overflow: visible;
    }
    .ppt-h5-setting-nav-mobile {
      top: 0;
      bottom: auto !important;
      background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0));

      .ppt-h5-setting-nav__ul {
        top: 0;
        bottom: auto !important;
      }
    }
  }
}

.c-portrait-watch-layout__carousel-wrap {
  position: relative;
  z-index: 20;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  pointer-events: none;
  -webkit-overflow-scrolling: unset;
  opacity: 1;
  &:not(.c-portrait-watch-layout__carousel-wrap__hide) {
    transition: opacity 0.3s ease-in-out;
  }
}

.c-portrait-watch-layout__carousel-wrap__hide {
  opacity: 0;
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

.c-portrait-watch-layout__speak-to-top {
  z-index: 2200;
  transition: all 0.3s ease-in-out;
}
</style>
