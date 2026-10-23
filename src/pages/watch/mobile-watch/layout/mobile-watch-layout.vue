<!-- @file 移动端观看页主体布局 -->
<template>
  <div
    ref="layoutWrapRef"
    class="c-mobile-watch-layout pws-main-tab-body pws-theme-mask-bg"
  >
    <div
      class="c-mobile-watch-layout__page-notices"
      :class="{
        'c-mobile-watch-layout__page-notices--page-fullscreen':
          mobilePlayerIsPageFullscreen && !isHorizontalScreenOrientation,
      }"
    >
      <!-- 聊天室连接异常提示 -->
      <mobile-chat-connect-error-tips />

      <!-- 发起转播频道被踢出提示 -->
      <mobile-page-notice
        v-if="chatExited"
        :tips="$lang('chat.transformTip')"
      />

      <!-- 聊天消息重放提示 -->
      <mobile-chat-msg-replay-tips />

      <!-- RTC 流播放失败提示 -->
      <connect-mic-play-failed-tips class="c-mobile-watch-layout__page-notices__item--clickable" />
    </div>

    <!-- 顶部占位 -->
    <div
      ref="layoutTopRef"
      class="c-mobile-watch-layout__top"
    ></div>

    <!-- 会议模式：没有播放器区域，倒计时 + 预约以顶部条形式展示 -->
    <mobile-live-count-down-bar
      v-if="countDownBarVisible"
      class="c-mobile-watch-layout__count-down-bar"
    />

    <!-- 播放器 -->
    <div
      class="c-mobile-watch-layout__player"
      :class="{
        'c-mobile-watch-layout__player--hide': !(
          mainScreen === MainScreenContent.Player ||
          mobileMenuCurrentName === TAB_NAME_DOC_OR_VIDEO ||
          isSmallWindow
        ),
        'c-mobile-watch-layout__player--sub-screen': mainScreen !== MainScreenContent.Player,
        'c-mobile-watch-layout__pip': isSmallWindow,
      }"
      :style="getScreenStyles(MainScreenContent.Player)"
    >
      <div class="c-mobile-watch-layout__player__content">
        <div class="c-mobile-watch-layout__player__content__inner">
          <!-- 第一画面（连麦或小班课讲师流） -->
          <mobile-connect-mic-user-item
            v-if="masterMicItem"
            :key="`master-stream-${masterMicItem.streamId}`"
            :mic-item="masterMicItem"
            :fit-type="connectMicFitType"
          />
          <!-- 小班课播放按钮 -->
          <player-play-button
            class="c-mobile-watch-layout__small-class-play-btn"
            v-if="shouldShowPlayButton"
            :mode="PlayButtonMode.Text"
            @click="onPlayClick"
          />
          <!-- 连麦暂停播放按钮 -->
          <player-play-button
            class="c-mobile-watch-layout__player__content__inner__mic-btn"
            v-else-if="isConnectMicPaused && masterMicItem"
            :mode="PlayButtonMode.Text"
          />
          <!-- 常规播放器：只在没有第一画面时显示 -->
          <mobile-player-main v-else-if="canRenderPlayer" />
        </div>
      </div>
      <!-- webview 小窗下的控制栏 -->
      <small-window-control v-if="isSmallWindow" />
    </div>

    <!-- 文档 -->
    <div
      v-if="canRenderDoc"
      class="c-mobile-watch-layout__doc pws-mobile-doc-container"
      :class="{
        'c-mobile-watch-layout__doc--hide': !(
          mainScreen === MainScreenContent.Doc || mobileMenuCurrentName === TAB_NAME_DOC_OR_VIDEO
        ),
        'c-mobile-watch-layout__doc--sub-screen': mainScreen !== MainScreenContent.Doc,
        'c-mobile-watch-layout__doc--page-fullscreen': mobileDocIsPageFullscreen,
        'c-mobile-watch-layout__doc--page-fullscreen--hide-watermark': isFullscreenWatermarkVisible,
      }"
      :style="getScreenStyles(MainScreenContent.Doc)"
    >
      <mobile-doc />
    </div>

    <!-- 直播倒计时 + 直播预约层 -->
    <div
      class="c-mobile-watch-layout__top-layer"
      :class="{
        'c-mobile-watch-layout__top-layer--count-down': countDownLayerVisible,
      }"
      :style="mainScreenStyles"
    >
      <mobile-count-down-layer />

      <div class="c-mobile-watch-layout__top__controls">
        <div class="c-mobile-watch-layout__top__controls__right">
          <!-- 直播广场 -->
          <live-square class="c-mobile-watch-layout__top-layer__live-square" />
        </div>
      </div>
    </div>

    <!-- 连麦区 -->
    <div
      v-if="filterConnectMicList.length"
      class="c-mobile-watch-layout__connect-mic"
    >
      <mobile-connect-mic-user-list />
    </div>

    <!-- 流多轨切换 -->
    <mobile-player-stream-track v-if="supportMultiStreamTrack" />

    <!-- 页面广告 -->
    <mobile-page-advert v-if="!isPlaybackWatchUrl" />

    <!-- 多会场（横向布局） -->
    <mobile-multi-meeting-horizontal
      v-if="
        !isPlaybackWatchUrl &&
        multiMeetingEnabled &&
        multiMeetingListLayout === MultiMeetingListLayout.Horizontal
      "
    />

    <!-- 评论上墙 -->
    <chat-loader-helper>
      <toping-msg
        class="c-mobile-watch-layout__speak-to-top c-mobile-watch-layout__speak-to-top-v2"
      />
    </chat-loader-helper>

    <!-- 其他直播预约 -->
    <common-other-live-booking class="c-mobile-watch-layout__other-live-booking" />

    <!-- 底部区域 -->
    <div
      ref="layoutBottomRef"
      class="c-mobile-watch-layout__bottom"
    >
      <!-- 快速答题卡 -->
      <quick-answer-card v-if="iarSdkLoaded && !notNeedIar" />

      <!-- 菜单栏 -->
      <mobile-watch-menu />
    </div>

    <!-- 显示在底部的播放器提示 -->
    <player-tips
      :is-normal-mobile-layout="true"
      class="c-mobile-watch-layout__player-tips"
    ></player-tips>

    <fullscreen-watermark></fullscreen-watermark>
  </div>
</template>

<script setup lang="ts">
import { CSSProperties, computed, defineAsyncComponent, nextTick, ref, unref, watch } from 'vue';

import MobilePageNotice from '@/components/common-base/page-notice/mobile-page-notice.vue';
import CommonOtherLiveBooking from '@/components/common-business/live-booking/common-other-live-booking/common-other-live-booking.vue';
import MobileLiveCountDownBar from '@/components/common-business/live-count-down/mobile-live-count-down-bar.vue';
import { ChatLoaderHelper } from '@/components/page-watch-common/chat-v2/chat-loader-helper';
import TopingMsg from '@/components/page-watch-common/chat-v2/toping-msg/index.vue';
import MobileChatConnectErrorTips from '@/components/page-watch-common/chat/chat-connect-error/chat-connect-error-tips/mobile-chat-connect-error-tips.vue';
import MobileChatMsgReplayTips from '@/components/page-watch-common/chat/chat-msg-replay-tips/mobile-chat-msg-replay-tips.vue';
import ConnectMicPlayFailedTips from '@/components/page-watch-common/connect-mic/common/connect-mic-play-failed-tips.vue';
import MobileConnectMicUserItem from '@/components/page-watch-common/connect-mic/mobile-connect-mic/mobile-connect-mic-user-item.vue';
import MobileConnectMicUserList from '@/components/page-watch-common/connect-mic/mobile-connect-mic/mobile-connect-mic-user-list.vue';
import MobileCountDownLayer from '@/components/page-watch-common/count-down-layer/mobile-count-down-layer.vue';
import MobileDoc from '@/components/page-watch-common/doc/mobile-doc.vue';
import QuickAnswerCard from '@/components/page-watch-common/interactive-receive-v2/answer-card-v2/quick-answer-card/quick-answer-card.vue';
import MobileMultiMeetingHorizontal from '@/components/page-watch-common/multi-meeting/mobile-multi-meeting/mobile-multi-meeting-horizontal.vue';
import MobilePageAdvert from '@/components/page-watch-common/page-advert/mobile-page-advert.vue';
import PlayerPlayButton from '@/components/page-watch-common/player/common/player-play-button/player-play-button.vue';
import PlayerTips from '@/components/page-watch-common/player/player-control/player-tips/player-tips.vue';
import MobilePlayerMain from '@/components/page-watch-common/player/player-main/mobile-player-main/mobile-player-main.vue';
import MobilePlayerStreamTrack from '@/components/page-watch-common/player/player-stream-track/mobile-player-stream-track.vue';

import { TAB_NAME_CHAT, TAB_NAME_DOC_OR_VIDEO } from '@/assets/constants/tab-name';
import { useWindowResizeListener } from '@/hooks/core/use-window-resize-listener';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useDocStore } from '@/store/use-doc-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

import { appEvents, useEventBusListener } from '@/app/app-events';
import FullscreenWatermark from '@/components/common-business/watermark/fullscreen-watermark.vue';
import { useFullscreenWatermark } from '@/components/common-business/watermark/use-fullscreen-watermark';
import { useSmallClassPlay } from '@/components/page-watch-common/connect-mic/hooks/use-small-class-play';
import liveSquare from '@/components/page-watch-common/live-square/live-square.vue';
import { PlayButtonMode } from '@/components/page-watch-common/player/common/player-play-button/use-player-play-button';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import SmallWindowControl from '@/components/page-watch-common/player/player-control/common-player-control/small-window-control.vue';
import { useScreenOrientHook } from '@/hooks/core/use-screen-orient';
import { useResizeObserver } from '@/hooks/tools/use-resize-observer';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useChatStore } from '@/store/use-chat-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useMultiMeetingStore } from '@/store/use-multi-meeting-store';
import { usePageStore } from '@/store/use-page-store';
import { usePlayerStore } from '@/store/use-player-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { MainScreenContent, MultiMeetingListLayout } from '@polyv/live-watch-sdk';

const MobileWatchMenu = defineAsyncComponent(
  () => import(/* webpackChunkName: "mobile-watch-menu" */ './mobile-watch-menu.vue'),
);

const { notNeedIar, isPlaybackWatchUrl, meetingMode } = storeDefinitionToRefs(useWatchAppStore);

const { showLiveCountDown } = storeDefinitionToRefs(useChannelInfoStore);

/** 会议模式下的顶部倒计时条 */
const countDownBarVisible = computed(() => {
  return unref(meetingMode) && unref(showLiveCountDown);
});

/** 播放器区域的直播倒计时层是否显示（与 mobile-count-down-layer 的渲染条件保持一致） */
const countDownLayerVisible = computed(() => {
  return unref(showLiveCountDown) && !unref(meetingMode);
});

const { chatExited } = storeDefinitionToRefs(useChatStore);

const { supportMultiStreamTrack, isSmallClassChannel } = storeDefinitionToRefs(useChannelStore);

const { multiMeetingEnabled, multiMeetingListLayout } = storeDefinitionToRefs(useMultiMeetingStore);

const layoutStore = useLayoutStore();
const {
  isHorizontalScreenOrientation,
  isVerticalScreenOrientation,
  mainScreen,
  mobileMenuCurrentName,
  mobileMenuHeaderHeight,
  mobileLayoutTopHeight,
  mobileLayoutBottomHeight,
  mobileLayoutBottomTop,
  mobileDocIsPageFullscreen,
  mobilePlayerIsPageFullscreen,
  mobileKeyboardHeight,
  mobileInputFocusing,
} = storeDefinitionToRefs(useLayoutStore);

const { iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);

const { filterConnectMicList, masterMicItem, connectMicFitType, isConnectMicPaused } =
  storeDefinitionToRefs(useConnectMicStore);

const { canRenderPlayer } = storeDefinitionToRefs(usePlayerStore);
const { toTryPlay } = usePlayerAction();

const { canRenderDoc } = storeDefinitionToRefs(useDocStore);

const { isSmallWindow } = storeDefinitionToRefs(useWebviewStore);

const { pageClientWidth, pageClientHeight } = storeDefinitionToRefs(usePageStore);

const layoutWrapRef = ref<HTMLDivElement>();
const layoutTopRef = ref<HTMLDivElement>();
const layoutBottomRef = ref<HTMLDivElement>();

useResizeObserver(layoutWrapRef, () => {
  layoutStore.$patch({
    mobileWatchLayoutHeight: layoutWrapRef.value?.clientHeight || 0,
  });
});

const { isFullscreenWatermarkVisible } = useFullscreenWatermark();

const { shouldShowPlayButton, onPlayClick } = useSmallClassPlay();

const defaultLayoutTopDistance = computed(() => {
  if (isVerticalScreenOrientation.value) {
    // FIX：在折叠屏（如华为 Mate X5）上，屏幕展开后，播放器占比过高，当出现输入法的时候，会导致页面底部没有位置显示输入框
    // 这里处理在特定比例的页面上，播放器宽高比为 10:3，减少高度腾出位置给底部区域
    if (pageClientWidth.value > 500 && pageClientWidth.value / pageClientHeight.value > 0.8) {
      return '30%';
    }
    return '56.25%'; // 16:9
  }
  if (isHorizontalScreenOrientation.value) return `${document.documentElement.clientHeight}px`;
  return '56.25%'; // 16:9
});

// 顶部占位距离 => 决定 layoutTopElem.clientHeight => 决定播放器高度
const layoutTopDistance = computed(() => {
  // 小班课场景：有第一画面（讲师流）就按16:9比例（56.25%）显示
  if (isSmallClassChannel.value) {
    return defaultLayoutTopDistance.value;
  }

  // 常规场景：原有逻辑
  if (!canRenderPlayer.value) return '0';

  return defaultLayoutTopDistance.value;
});

/** 主屏的样式 */
const mainScreenStyles = computed(() => {
  const styles: CSSProperties = {
    height: `${unref(mobileLayoutTopHeight)}px`,
    top: 0,
  };

  if (unref(mobileInputFocusing)) {
    styles.transform = `translateY(${unref(mobileKeyboardHeight)}px)`;
    styles['z-index'] = 100;
  }

  return styles;
});

/** 副屏的样式 */
const subScreenStyles = computed(() => {
  return {
    height: `${unref(mobileLayoutBottomHeight) - unref(mobileMenuHeaderHeight)}px`,
    top: `${unref(mobileLayoutBottomTop) + unref(mobileMenuHeaderHeight)}px`,
  };
});

function getScreenStyles(content: MainScreenContent) {
  if (
    (content === MainScreenContent.Player && unref(mainScreen) === MainScreenContent.Player) ||
    (content === MainScreenContent.Doc && unref(mainScreen) === MainScreenContent.Doc)
  ) {
    return unref(mainScreenStyles);
  }
  return unref(subScreenStyles);
}

/** 计算布局数据 */
async function computedLayoutSize() {
  await nextTick();
  const layoutWrapElem = unref(layoutWrapRef);
  const layoutTopElem = unref(layoutTopRef);
  const layoutBottomElem = unref(layoutBottomRef);
  if (!layoutWrapElem || !layoutTopElem || !layoutBottomElem) return;

  const wrapHeight = layoutWrapElem.clientHeight;
  const topHeight = layoutTopElem.clientHeight;
  const bottomHeight = layoutBottomElem.clientHeight;

  mobileLayoutTopHeight.value = topHeight;
  mobileLayoutBottomHeight.value = bottomHeight;
  mobileLayoutBottomTop.value = wrapHeight - bottomHeight;
}

function onClickPlayerRegion() {
  toTryPlay();
}

watch(
  () => [unref(filterConnectMicList).length],
  () => {
    computedLayoutSize();
  },
);

// 顶部倒计时条会占用布局高度，显隐变化后需要重新计算布局
watch(countDownBarVisible, () => {
  computedLayoutSize();
});

const { updateScreenOrientationModeManually, screenOrientationMode } = useScreenOrientHook({
  autoListen: true,
  autoListenCb: () => {
    computedLayoutSize();
  },
});

const forceComputedLayoutSize = () => {
  updateScreenOrientationModeManually();
  layoutStore.$patch({ screenOrientationMode: screenOrientationMode.value });
  computedLayoutSize();
};

watch(isSmallWindow, () => {
  setTimeout(() => {
    forceComputedLayoutSize();
  }, 300);
});

useEventBusListener(appEvents.global.MobileLayoutComputedSize, forceComputedLayoutSize);

// 小窗播放按钮点击处理
useEventBusListener(appEvents.portrait.ClickPlayerRegion, onClickPlayerRegion);

useWindowResizeListener(
  () => {
    forceComputedLayoutSize();
  },
  {
    autoListen: true,
    immediately: true,
  },
);

const $stopWatch = watch(mobileMenuCurrentName, () => {
  if (mobileMenuCurrentName.value === TAB_NAME_CHAT) {
    layoutStore.$patch({
      mobileChatTabHasBeenShowed: true,
    });
    $stopWatch();
  }
});
</script>

<style lang="scss">
.c-mobile-watch-layout {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

.c-mobile-watch-layout__page-notices {
  position: absolute;
  top: 18px;
  right: 28px;
  left: 28px;
  z-index: $--zIndex-dialog-base;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  pointer-events: none;
}

.c-mobile-watch-layout__page-notices__item--clickable {
  pointer-events: auto;
}

.c-mobile-watch-layout__page-notices--page-fullscreen {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  justify-content: flex-start;
  width: 100vh;
  max-width: 100vh;
  height: 100vw;
  max-height: 100vw;
  margin: auto;
  transform: translate(-50vw) rotate(90deg);
  transform-origin: center;
}

.c-mobile-watch-layout__top {
  pointer-events: none;
  &::after {
    display: block;
    width: 100%;
    height: 0;
    /* stylelint-disable-next-line value-keyword-case */
    padding-bottom: v-bind(layoutTopDistance);
    pointer-events: none;
    content: '';
  }
}

// 会议模式下的倒计时条贴住顶部和两边，不留边距和圆角
.c-mobile-watch-layout__count-down-bar.c-mobile-live-count-down-bar {
  flex-shrink: 0;
  border-radius: 0;
}

.c-mobile-watch-layout__bottom {
  position: relative;
  flex: 1;
  width: 100%;
  overflow: hidden;
}

.c-mobile-watch-layout__player,
.c-mobile-watch-layout__doc {
  position: absolute;
  left: 0;
  width: 100%;
}

.c-mobile-watch-layout__doc {
  background: #202127;
}

.c-mobile-watch-layout__player__content,
.c-mobile-watch-layout__player__content__inner {
  width: 100%;
  height: 100%;
  background: #000;
}

.c-mobile-watch-layout__player--sub-screen {
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  .c-mobile-watch-layout__player__content {
    position: relative;
    flex-shrink: 0;
    height: 0;
    padding-bottom: 56.25%;
  }
  .c-mobile-watch-layout__player__content__inner {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
  .c-mobile-player-main--page-fullscreen {
    top: -54px !important;
  }
}

.c-mobile-watch-layout__player--hide,
.c-mobile-watch-layout__doc--hide {
  z-index: -1 !important;
  pointer-events: none;
  opacity: 0;
}

.c-mobile-watch-layout__player--page-fullscreen {
  position: fixed;
  top: 50% !important;
  left: 50% !important;
  z-index: 2000 !important;
  width: 100vh !important;
  height: 100vw !important;
  transform: rotate(90deg);
  transform-origin: center center;
}

.c-mobile-watch-layout__top-layer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 260;
  width: 100%;
  pointer-events: none;
}

// 倒计时层显示时需要盖住播放器区域内的层级（如暂无直播占位面板 z-index: 309）。
// 播放器容器不产生层叠上下文，其内部层级是直接跟本层比较的，故这里要抬到 310 之上；
// 仅在倒计时显示时抬高，避免影响常态下直播广场入口与播放器控制栏的层级关系
.c-mobile-watch-layout__top-layer--count-down {
  z-index: 320;
}

.c-mobile-watch-layout__doc--page-fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  z-index: 999;
  width: 100% !important;
  height: 100% !important;
}

.c-mobile-watch-layout__speak-to-top {
  z-index: 2300;
}
.c-mobile-watch-layout__speak-to-top-v2 {
  position: absolute;
  top: 16px;
  left: 50%;
  width: 335px;
  pointer-events: initial;
  transform: translateX(-50%);
}

.c-mobile-watch-layout__other-live-booking {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 2200;
}

.c-mobile-watch-layout__player-tips {
  position: absolute;
  top: 12px;
  left: 50%;
  z-index: 3000;
  transform: translateX(-50%);
}

.c-mobile-watch-layout__pip {
  top: 0 !important;
  z-index: 4001;
  height: 100% !important;
  .c-mobile-watch-layout__player__content {
    height: 100% !important;
  }
  .plwrap {
    > div:not(.plvideo, .plv-live-watermark) {
      display: none !important;
    }
  }

  .plv-player-container {
    > div:not(.plv-player-video__wrap, .plv-player-cover) {
      display: none !important;
    }
  }
}

.c-mobile-watch-layout__top__controls {
  display: flex;
  align-items: center;
  height: 30px;
  margin-top: 12px;
  pointer-events: none;

  .c-mobile-watch-layout__top__controls__right {
    margin-left: auto;
  }

  .c-mobile-watch-layout__top-layer__live-square {
    margin-right: 12px;
    pointer-events: initial;
  }
}

.c-mobile-watch-layout__doc--page-fullscreen--hide-watermark {
  & #pptAndPaintDiv [data-type='watermark'] {
    display: none;
  }
}

.c-mobile-watch-layout__player__content__inner__mic-btn {
  pointer-events: auto !important;
}

.c-mobile-watch-layout__small-class-play-btn {
  pointer-events: auto !important;
  .c-player-play-button__mode--text {
    pointer-events: auto;
  }
}
</style>
