<!-- @file 移动端横屏播放器 -->
<template>
  <div
    class="c-mobile-player-main"
    :class="{
      'c-mobile-player-main--page-fullscreen':
        (mobileNormalLatencyPlayerIsFullscreen || lowLatencyPlayerIsPageFullscreen) &&
        !isHorizontalScreenOrientation,
      'c-mobile-player-main--normal-player-fullscreen': mobileNormalLatencyPlayerIsFullscreen,
      'c-mobile-player-main--screen__horizontal': isHorizontalScreenOrientation,
      'c-mobile-player-main--hide-loading': isAndroid && isDingTalk,
      'c-mobile-player-main--hide': isConnectMicing,
      'c-mobile-player-main--none-live': noneLivePanelVisible,
      'c-mobile-player-main--hide-normal-player-btn': !isLowLatency,
      'c-mobile-player-main__hide-player-loading': initLoadingVisible,
    }"
    @click="onClickContainer"
  >
    <background-section
      :background-type="themeSetting.playerBackgroundType"
      :custom-url="playerBgUrl"
    />

    <!-- 播放器渲染容器 -->
    <div
      ref="playerContainer"
      class="c-mobile-player-main__container"
      :class="{
        'c-mobile-player-main__container--hide-watermark': isFullscreenWatermarkVisible,
      }"
      data-testid="plv-player-container"
    ></div>

    <!-- 外部授权试看覆盖层（倒计时/到期遮罩/引导跳转） -->
    <external-trial-overlay />

    <div
      v-if="playerSdkLoadError"
      class="c-mobile-player-main__player-sdk-load-error"
    >
      {{ $lang('player.error.sdkLoad') }}
    </div>

    <!-- 播放器 logo -->
    <mobile-player-logo v-if="isLowLatency && logoSetting.logoImage" />

    <!-- 播放器暖场/封面图  -->
    <mobile-player-cover-img />

    <!-- 播放器初始化 loading（解决 SDK 未挂载前的空白区域） -->
    <loading-overlay
      :visible="initLoadingVisible"
      :z-index="309"
      :show-text="false"
    />

    <!-- “点击播放”播放按钮，仅用来展示  -->
    <player-play-business-button class="c-mobile-player-main__play-btn">
      <template v-slot:btn-before>
        <mobile-icon-player-back
          v-if="fastForwardBackwardVisible"
          class="c-mobile-player-main__player-forward-btn"
          @click.stop="toBackOffVideoBuffered(15, true)"
        />
      </template>

      <template v-slot:btn-after>
        <mobile-icon-player-forward
          v-if="fastForwardBackwardVisible"
          class="c-mobile-player-main__player-forward-btn"
          @click.stop="toForwardVideoBuffered(15, true)"
        />
      </template>
    </player-play-business-button>

    <!-- 暂无直播占位面板 -->
    <mobile-none-live-panel v-if="noneLivePanelVisible" />

    <!-- 播放器顶部-左侧 访问次数 -->
    <div
      v-if="pvShowEnabled && pageViewCountLocation === PageViewShowLocation.Player"
      v-show="playerControlEnabled && (playerControlVisible || sdkPlayerUIControlVisible)"
      class="c-mobile-player-main__pv"
      :class="{
        'c-mobile-player-main__pv--landscape-fix': isLowLatency,
      }"
    >
      {{ shortNumber(pageViewCount) }} {{ $lang('watch.pvSuffix') }}
    </div>

    <!-- webview场景下网页全屏时的返回按钮 -->
    <div
      v-if="showWebviewBackButton"
      v-show="playerControlEnabled && (playerControlVisible || sdkPlayerUIControlVisible)"
      class="c-mobile-player-main__webview-back"
      :class="{
        'c-mobile-player-main__webview-back--lowLatency': isLowLatency,
      }"
      @click="exitFullscreen"
    >
      <mobile-icon-arrow-left />
    </div>

    <!-- 播放器顶部-右侧 延迟模式切换 -->
    <mobile-low-latency-switch
      v-show="
        playerControlEnabled &&
        latencyModeSettingVisible &&
        (playerControlVisible || sdkPlayerUIControlVisible)
      "
    />

    <!-- 播放器底部-右侧 直播时移和精彩看点入口 -->
    <transition name="slide">
      <mobile-player-time-axis-entrance
        v-if="isLowLatency"
        v-show="playerControlEnabled && playerControlVisible"
      />
    </transition>

    <!-- 播放器控制栏 -->
    <mobile-player-control
      v-if="isLowLatency && playerControlEnabled"
      class="c-mobile-player-main__control"
    />

    <!-- 播放器字幕区 -->
    <mobile-player-subtitle
      v-show="mainScreen === MainScreenContent.Player"
      selector=".c-mobile-player-main"
    />

    <!-- ========= 弹出层类型组件 Start ========= -->

    <!-- 播放器弹幕设置面板 -->
    <mobile-barrage-setting v-show="barrageMobileSettingVisible" />

    <!-- 精彩看点弹窗 -->
    <mobile-player-time-axis-mark-popup v-if="supportTimeAxisMark" />

    <!-- 回放字幕切换popup -->
    <mobile-subtitle-select
      v-model="pbSubtitleTranslateLanguage"
      :options="pbSubtitleOptions"
      ref="pbSubtitleSelectRef"
      class="c-mobile-player-playback-subtitle-select"
      @input="handleSelectSubtitle"
    ></mobile-subtitle-select>

    <!-- 弹层方式打开广告链接 -->
    <mobile-iframe-popup
      v-model="iframeVisible"
      :src="iframeUrl"
      :height="460"
    />

    <!-- ========= 弹出层类型组件 End ========= -->
  </div>
</template>

<script setup lang="ts">
import { computed, unref, ref, onBeforeUnmount } from 'vue';

import { appEvents, useEventBusListener } from '@/app/app-events';
import { useLayoutStore } from '@/store/use-layout-store';
import { usePlayerStore } from '@/store/use-player-store';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { usePlayerControl } from '../../hooks/use-player-control';
import { usePlayerMain } from '../../hooks/use-player-main';
import ExternalTrialOverlay from '@/components/page-watch-common/player/external-trial/external-trial-overlay.vue';
import { useConnectMicing } from '../../hooks/use-connect-micing';
import { useMobilePlaybackSubtitle } from '../../../subtitle/use-mobile-playback-subtitle';
import { usePlayerInitLoading } from '../../hooks/use-player-init-loading';

import PlayerPlayBusinessButton from '@/components/page-watch-common/player/common/player-play-button/player-play-business-button.vue';
import MobilePlayerCoverImg from '../../player-cover-img/mobile-player-cover-img.vue';
import MobileNoneLivePanel from '../../common/none-live-panel/mobile-none-live-panel.vue';
import { useNoneLivePanel } from '../../common/none-live-panel/use-none-live-panel';
import MobilePlayerControl from '../../player-control/mobile-player-control/mobile-player-control.vue';
import MobileLowLatencySwitch from '../../player-control/mobile-player-control/mobile-low-latency-switch.vue';
import MobilePlayerLogo from '@/components/page-watch-common/player/player-logo/mobile-player-logo.vue';
import MobileBarrageSetting from '../../player-control/mobile-player-control/mobile-barrage-setting.vue';
import MobilePlayerTimeAxisEntrance from '../../player-time-axis-mark/mobile-player-time-axis-entrance.vue';
import MobilePlayerTimeAxisMarkPopup from '../../player-time-axis-mark/mobile-player-time-axis-mark-popup.vue';
import MobilePlayerSubtitle from '@/components/page-watch-common/player/player-subtitle/mobile-player-subtitle.vue';
import MobileSubtitleSelect from '@/components/page-watch-common/subtitle/mobile-subtitle-select/mobile-subtitle-select.vue';
import BackgroundSection from '@/components/common-business/background-section/background-section.vue';
import MobileIframePopup from '@/components/common-base/iframe-popup/mobile-iframe-popup.vue';
import LoadingOverlay from '@/components/common-base/loading-overlay/loading-overlay.vue';

import { MainScreenContent, PageViewShowLocation } from '@polyv/live-watch-sdk';
import { usePlayerAction } from '../../hooks/use-player-action';
import { isAndroid, isDingTalk } from '@/assets/utils/browser';
import { ComponentInstance } from '@/hooks/core/use-vue';
import { useGlobalInject } from '@/app/use-global-inject';
import { FullscreenElement, useFullscreen } from '@/hooks/tools/use-fullscreen';
import { useShortNumber } from '@/hooks/business/use-short-number';
import { usePlayerStreamStopText } from '@/components/page-watch-common/player/hooks/use-player-stream-stop-text';
import { useThemeStore } from '@/store/use-theme-store';
import { usePlayerAdvert } from '@/components/page-watch-common/player/hooks/use-player-advert';
import { useFullscreenWatermark } from '@/components/common-business/watermark/use-fullscreen-watermark';
import {
  MobileIconArrowLeft,
  MobileIconPlayerBack,
  MobileIconPlayerForward,
} from '@/components/component-icons/mobile/map';

const { shortNumber } = useShortNumber();

const {
  mainScreen,
  mobilePlayerIsPageFullscreen,
  mobileNormalLatencyPlayerIsFullscreen,
  isHorizontalScreenOrientation,
} = storeDefinitionToRefs(useLayoutStore);

const lowLatencyPlayerIsPageFullscreen = computed(() => {
  return (
    mobilePlayerIsPageFullscreen.value &&
    !mobileNormalLatencyPlayerIsFullscreen.value &&
    !isHorizontalScreenOrientation.value
  );
});
// 全屏水印显示时，通过样式隐藏播放器水印
const { isFullscreenWatermarkVisible } = useFullscreenWatermark();

const { getStreamStopText, isEnableDirectPlayCutOff } = usePlayerStreamStopText();

const {
  playerSdkLoadError,
  isLowLatency,
  playerControlEnabled,
  playerControlVisible,
  sdkPlayerUIControlVisible,
  logoSetting,
  barrageMobileSettingVisible,
  supportTimeAxisMark,
} = storeDefinitionToRefs(usePlayerStore);

const { themeSetting, playerBgUrl } = storeDefinitionToRefs(useThemeStore);

const { noneLivePanelVisible } = useNoneLivePanel();

const { initLoadingVisible } = usePlayerInitLoading();

const { pvShowEnabled, pageViewCountLocation, pageViewCount } =
  storeDefinitionToRefs(useChannelInfoStore);

const { isPlvWebview } = storeDefinitionToRefs(useWebviewStore);

const { playerContainer } = usePlayerMain({
  initPlayerOptions: () => {
    return {
      showController: !unref(isLowLatency),
      skinConfig: {
        streamStopTxt: getStreamStopText(),
        bgColor: '#2B3045',
        streamPause: require('../../imgs/player-stop.png'),
        streamStop: require('../../imgs/player-no-live.png'),
        audioMode: require('../../imgs/player-audio-mode.png'),
      },
      directPlayCutOff: isEnableDirectPlayCutOff.value,
    };
  },
});

const { toggleFullscreen, supportFullscreen: supportFullscreenApi } = useFullscreen(() => {
  const videos =
    playerContainer.value?.querySelectorAll('video') || ([] as unknown as HTMLElement[]);

  let fullscreenElem: HTMLElement | undefined;
  videos.forEach(elem => {
    if (elem.clientWidth && elem.clientHeight) {
      fullscreenElem = elem;
    }
  });

  return fullscreenElem as FullscreenElement;
});

useEventBusListener(appEvents.portrait.PlayerSystemFullscreen, () => {
  if (supportFullscreenApi.value) {
    toggleFullscreen();
  } else {
    const videoEl = playerContainer.value?.querySelector('video') as
      | (HTMLVideoElement & { webkitEnterFullScreen?: () => void })
      | null;
    if (videoEl?.webkitEnterFullScreen) {
      videoEl.webkitEnterFullScreen();
    }
  }
});

const { latencyModeSettingVisible, addHistoryTipsListener, fastForwardBackwardVisible } =
  usePlayerControl();

const { toTryPlay, toExitWebPageFullscreen, toBackOffVideoBuffered, toForwardVideoBuffered } =
  usePlayerAction();
const { isConnectMicing } = storeDefinitionToRefs(useConnectMicStore);

// 计算是否显示webview返回按钮
const showWebviewBackButton = computed(() => {
  return mobilePlayerIsPageFullscreen.value && isPlvWebview.value;
});

// 退出全屏
function exitFullscreen() {
  toExitWebPageFullscreen();
}

const { getEmitter } = useGlobalInject();

const { dispose: disposeHistoryTipsListener } = addHistoryTipsListener();

onBeforeUnmount(() => {
  disposeHistoryTipsListener();
});

function onClickContainer() {
  toTryPlay();
  getEmitter().emit(appEvents.player.ClickMobilePlayerContainer);
}

const pbSubtitleSelectRef = ref<ComponentInstance<typeof MobileSubtitleSelect>>();

const { pbSubtitleOptions, pbSubtitleTranslateLanguage, handleSelectSubtitle } =
  useMobilePlaybackSubtitle({
    openSelectAction: () => {
      if (pbSubtitleSelectRef.value) {
        pbSubtitleSelectRef.value.openOption();
      }
    },
  });

useConnectMicing();

const { iframeVisible, iframeUrl } = usePlayerAdvert();
</script>

<style lang="scss">
@import './_styles/cover-mobile-player.scss';

$--player-page-fullscreen-width-half: calc($--plv-mobile-watch-full-screen-vw / 2) !default;
$--player-page-fullscreen-height-half: calc($--plv-mobile-watch-full-screen-vh / 2) !default;

// prettier-ignore
$--player-page-fullscreen-width-half__reverse: calc($--player-page-fullscreen-width-half * -1) !default;
// prettier-ignore
$--player-page-fullscreen-height-half__reverse: calc($--player-page-fullscreen-height-half * -1) !default;

.c-mobile-player-main {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #000;
  // overflow: hidden;

  &.c-mobile-player-main--hide {
    top: 0;
    left: 0;
    z-index: -1;
    pointer-events: none;
    visibility: hidden;
  }
}

.c-mobile-player-main__player-sdk-load-error {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 310;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 10px;
  line-height: 16px;
  color: #fff;
  pointer-events: none;
  cursor: pointer;
  transform: translate(-50%, -50%);
}

.c-mobile-player-main__play-btn {
  z-index: 310;
}

.c-mobile-player-main__container {
  position: absolute;
  top: 0;
  left: 0;
  // z-index: 300;
  width: 100%;
  height: 100%;
}

// 显示暂无直播占位面板时，透明掉播放器，避免与 SDK 自带的流停止 UI 重叠
.c-mobile-player-main--none-live {
  .c-mobile-player-main__container {
    opacity: 0;
  }
  .c-mobile-player-main__play-btn {
    display: none;
  }
}

.c-mobile-player-main__pv {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 308;
  padding: 0 8px;
  font-size: 12px;
  line-height: 24px;
  color: #fff;
  background: #000;
  border-radius: 12px;
  opacity: 0.7;
}

.c-mobile-player-main__webview-back {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;

  font-size: 28px;
  color: #fff;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  transition: background-color 0.2s ease;
  transform: rotate(90deg);

  .polyv-icon-arrow-left {
    width: 28px;
    height: 28px;
  }
}

.c-mobile-player-main__webview-back--lowLatency {
  position: fixed;
  top: 12px;
  left: 12px;
  transform: none;
}

// 正常延迟播放器全屏
.c-mobile-player-main--normal-player-fullscreen {
  // 统一交给外部去旋转
  .plv-live-fullscreen--landscape {
    // ios 兼容处理
    .plvideo {
      z-index: -1;
    }
  }
}

// 无延迟播放器页面全屏
.c-mobile-player-main--page-fullscreen {
  position: absolute;
  top: $--player-page-fullscreen-height-half;
  bottom: 0 !important;
  left: $--player-page-fullscreen-width-half;

  z-index: 2000;
  width: calc($--plv-mobile-watch-full-screen-vh);
  height: calc($--plv-mobile-watch-full-screen-vw);
  // prettier-ignore
  transform: translate($--player-page-fullscreen-height-half__reverse, $--player-page-fullscreen-width-half__reverse) rotate(90deg);
  transform-origin: center;

  // @include force-page-fullscreen;
  // ios 兼容处理
  .c-mobile-player-main__container {
    z-index: -1;
  }
  .c-background-section {
    z-index: -2;
  }
}

// 屏幕横屏
.c-mobile-player-main--screen__horizontal {
  width: $--plv-mobile-watch-full-screen-vw !important;
  height: 100% !important;
}

.c-mobile-player-main--page-fullscreen.c-mobile-player-main--normal-player-fullscreen {
  // 直播
  .plv-live-fullscreen--landscape {
    top: 0 !important;
    left: 0 !important;
    transform: none;
  }
  // 点播
  .plv-player-fullscreen--landscape {
    top: 0 !important;
    left: 0 !important;
    transform: none;
  }
}

.c-mobile-player-main--screen__horizontal.c-mobile-player-main--normal-player-fullscreen {
  // 直播
  .plv-live-fullscreen--landscape {
    position: absolute !important;
    z-index: auto !important;
  }
  // 点播
  .plv-player-fullscreen--landscape {
    top: 0 !important;
    left: 0 !important;
    transform: none;
  }
}

.c-mobile-player-main--hide-loading {
  .vcp-loading {
    display: none !important;
  }
}

.c-mobile-player-main--hide-normal-player-btn {
  .plv-live-cover__btn,
  .plv-live-cover__btn-new,
  .plv-live-big-play-btn,
  .plv-player-big-play-btn {
    display: none !important;
  }
}

.c-mobile-player-main__player-tips {
  position: absolute;
  top: 32px;
  left: 50%;
  z-index: 3000;
  transform: translateX(-50%);
}

.c-mobile-player-main__player-forward-btn {
  margin: 0 40px;
  font-size: 28px;
  color: #fff;
  pointer-events: initial;
  opacity: 0.8;
}

.c-mobile-player-playback-subtitle-select {
  display: none;
}

.c-mobile-player-main--page-fullscreen {
  .c-mobile-player-main__pv--landscape-fix {
    left: 60px;
  }
}

.c-mobile-player-main__container--hide-watermark {
  .plv-live-watermark {
    // 使用display: none 实测会影响水印的渲染，导致全屏后不显示
    visibility: hidden;
  }

  .plv-watch-sdk__player-watermark {
    visibility: hidden;
  }
}

// 通过样式隐藏播放器 loading，避免跟观看页加的 loading 重叠显示
.c-mobile-player-main__hide-player-loading {
  .plv-live-loading {
    opacity: 0;
  }
}
</style>
