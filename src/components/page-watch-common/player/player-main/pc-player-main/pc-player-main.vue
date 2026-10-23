<!-- @file PC 端播放器 -->
<template>
  <div
    class="c-pc-player-main"
    :class="{
      'c-pc-player-main__hide': isConnectMicing,
      'c-pc-player-main--none-live': noneLivePanelVisible,
      'c-pc-player-main--hide-normal-player-btn': !isLowLatency,
      'c-pc-player-main__hide-player-loading': initLoadingVisible,
    }"
  >
    <background-section
      class="c-pc-player-main__background-section"
      :background-type="themeSetting.playerBackgroundType"
      :custom-url="playerBgUrl"
    />

    <!-- 播放器渲染容器 -->
    <div
      ref="playerContainer"
      :class="[
        'c-pc-player-main__container',
        { 'c-pc-player-main__container__hide-watermark': isFullscreenWatermarkVisible },
      ]"
      data-testid="plv-player-container"
      @click="toTogglePlayInLimit"
    ></div>

    <!-- 外部授权试看覆盖层（倒计时/到期遮罩/引导跳转） -->
    <external-trial-overlay />

    <div
      v-if="playerSdkLoadError"
      class="c-pc-player-main__player-sdk-load-error"
    >
      {{ $lang('player.error.sdkLoad') }}
    </div>

    <!-- 播放器 logo -->
    <pc-player-logo v-if="isLowLatency && logoSetting.logoImage" />

    <!-- 播放器封面图 -->
    <pc-player-cover-img />

    <!-- 播放器初始化 loading（解决 SDK 未挂载前的空白区域） -->
    <loading-overlay
      :visible="initLoadingVisible"
      :show-text="false"
    />

    <!-- 视频区播放按钮，仅用来展示 -->
    <player-play-business-button />

    <!-- 暂无直播占位面板 -->
    <pc-none-live-panel v-if="noneLivePanelVisible" />

    <!-- 播放器字幕区 -->
    <player-subtitle />

    <!-- 弹层方式打开广告链接 -->
    <pc-iframe-popup
      v-model="iframeVisible"
      :src="iframeUrl"
      :height="720"
    />
  </div>
</template>

<script setup lang="ts">
import { usePlayerMain } from '@/components/page-watch-common/player/hooks/use-player-main';

import PcPlayerCoverImg from '@/components/page-watch-common/player/player-cover-img/pc-player-cover-img.vue';
import PlayerPlayBusinessButton from '@/components/page-watch-common/player/common/player-play-button/player-play-business-button.vue';
import PcPlayerLogo from '@/components/page-watch-common/player/player-logo/pc-player-logo.vue';
import PcNoneLivePanel from '@/components/page-watch-common/player/common/none-live-panel/pc-none-live-panel.vue';
import { useNoneLivePanel } from '@/components/page-watch-common/player/common/none-live-panel/use-none-live-panel';
import PlayerSubtitle from '@/components/page-watch-common/player/player-subtitle/pc-player-subtitle.vue';
import BackgroundSection from '@/components/common-business/background-section/background-section.vue';
import PcIframePopup from '@/components/common-base/iframe-popup/pc-iframe-popup.vue';
import LoadingOverlay from '@/components/common-base/loading-overlay/loading-overlay.vue';
import ExternalTrialOverlay from '@/components/page-watch-common/player/external-trial/external-trial-overlay.vue';

import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { usePlayerKeyboard } from '@/components/page-watch-common/player/hooks/use-player-keyboard';
import { useConnectMicing } from '../../hooks/use-connect-micing';
import { usePlayerAdvert } from '@/components/page-watch-common/player/hooks/use-player-advert';
import { usePlayerInitLoading } from '@/components/page-watch-common/player/hooks/use-player-init-loading';

import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { usePlayerStreamStopText } from '@/components/page-watch-common/player/hooks/use-player-stream-stop-text';
import { useThemeStore } from '@/store/use-theme-store';
import { useFullscreenWatermark } from '@/components/common-business/watermark/use-fullscreen-watermark';

const { playerSdkLoadError, isLowLatency, logoSetting } = storeDefinitionToRefs(usePlayerStore);

const { isConnectMicing } = storeDefinitionToRefs(useConnectMicStore);

const { playerBgUrl, themeSetting } = storeDefinitionToRefs(useThemeStore);

const { noneLivePanelVisible } = useNoneLivePanel();

const { getStreamStopText, isEnableDirectPlayCutOff } = usePlayerStreamStopText();

const { initLoadingVisible } = usePlayerInitLoading();

const { playerContainer } = usePlayerMain({
  initPlayerOptions: () => {
    return {
      barrageEnabled: false,
      showController: false,
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

const { isFullscreenWatermarkVisible } = useFullscreenWatermark();

usePlayerKeyboard(playerContainer);

const { toTogglePlayInLimit } = usePlayerAction();

useConnectMicing();

const { iframeVisible, iframeUrl } = usePlayerAdvert();
</script>

<style lang="scss">
@import './styles/cover-pc-player.scss';

.c-pc-player-main {
  position: relative;
  width: 100%;
  height: 100%;

  &.c-pc-player-main__hide {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    height: 1px;
    opacity: 0;
    .plv-watch-sdk__player-wrap-volc {
      > div {
        font-size: 0;
      }
    }
  }
}

.c-pc-player-main__container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  @include pc-watch-card-radius-top;
}

.c-pc-player-main__background-section {
  @include pc-watch-card-radius-top;
}

// 显示暂无直播占位面板时，透明掉播放器，避免与 SDK 自带的流停止 UI 重叠
.c-pc-player-main--none-live {
  .c-pc-player-main__container {
    opacity: 0;
  }
  .c-player-play-button {
    display: none;
  }
}

.c-pc-player-main__player-sdk-load-error {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 10;
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

.c-pc-player-main--hide-normal-player-btn {
  .pv-video-player {
    .pv-icon-btn-play {
      opacity: 0;
    }
  }
}

// 通过样式隐藏播放器水印
.c-pc-player-main__container__hide-watermark {
  .plv-live-player-watermark {
    display: none !important;
  }
}

// 避免观看页加的loading跟播放器loading重叠显示
.c-pc-player-main__hide-player-loading {
  .plv-live-player-loading {
    opacity: 0 !important;
  }

  .pv-loading {
    opacity: 0 !important;
  }
}
</style>
