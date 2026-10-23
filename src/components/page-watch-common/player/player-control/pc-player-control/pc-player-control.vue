<!-- @file PC 端播放器控制栏 -->
<template>
  <div
    class="c-pc-player-control"
    ref="playerControlUI"
  >
    <!-- 提示 -->
    <div class="c-pc-player-control__tips-wrap">
      <!-- 手动播放直播提示 -->
      <div
        v-if="manualPlayTipsVisible && manualTipsVisible"
        class="c-pc-player-control__tips c-pc-player-control__tips--manual-play"
      >
        {{ $lang('player.manualPlayTips1') }}
        <span class="c-pc-player-control__tips__highlight">
          {{ $lang('player.manualPlayTips2') }}
        </span>
        {{ $lang('player.manualPlayTips3') }}
        <pc-icon-close
          class="c-pc-player-control__tips__close"
          @click.native="closeManualTips"
        />
      </div>

      <!-- 历史播放提示 -->
      <div
        v-if="historyTipsVisible && historyDuration"
        class="c-pc-player-control__tips c-pc-player-control__tips--history-play"
      >
        {{ $lang('player.historyTips') }}
        {{ formatSeconds(historyDuration) }}
        <span
          class="c-pc-player-control__tips__btn"
          @click="onClickRestart"
        >
          {{ $lang('player.restart') }}
        </span>
        <pc-icon-close
          class="c-pc-player-control__tips__close"
          @click="closeHistoryTips"
        />
      </div>

      <player-tips></player-tips>
    </div>

    <div class="c-pc-player-control__main">
      <div class="c-pc-player-control__content">
        <!-- 进度条 -->
        <pc-player-progress-bar
          v-if="playerProgressVisible"
          class="c-pc-player-control__progress"
        />

        <!-- 左侧按钮 -->
        <div class="c-pc-player-control__content__left">
          <mobile-icon-player-back
            v-if="fastForwardBackwardVisible"
            class="c-pc-player-control__button c-pc-player-control__button--fastForward"
            :data-tips="backwardButtonTips"
            @click="toBackOffVideo(15)"
          />

          <!-- 暂停播放按钮 -->
          <div
            v-if="playerControlPlayBtnVisible"
            class="c-pc-player-control__button"
            :class="{
              'c-pc-player-control__button--pause': playStatus === PlayStatus.Playing,
              'c-pc-player-control__button--play': playStatus === PlayStatus.Pause,
            }"
            :data-tips="playButtonTips"
            @click="toTogglePlay"
          ></div>

          <mobile-icon-player-forward
            v-if="fastForwardBackwardVisible"
            class="c-pc-player-control__button c-pc-player-control__button--fastForward"
            :data-tips="forwardButtonTips"
            @click="toForwardVideo(15)"
          />

          <!-- 刷新按钮 -->
          <div
            v-if="refreshButtonVisible"
            class="c-pc-player-control__button c-pc-player-control__button--refresh"
            :data-tips="$lang('player.refresh')"
            @click="toRefresh"
          ></div>

          <!-- 直播时移时间进度 -->
          <div
            v-if="supportLiveTimeShift"
            class="c-pc-player-control__time"
          >
            {{ currentTimeText }}
          </div>

          <!-- 回放时间进度 -->
          <div
            v-if="playbackTimeVisible"
            class="c-pc-player-control__time"
          >
            {{ currentTimeText }} / {{ durationTimeText }}
          </div>

          <!-- 直播时移 -->
          <div
            v-if="timeShiftReturnLiveButtonVisible"
            class="c-pc-player-control__time-shift-container"
          >
            <!-- 返回直播 -->
            <normal-button
              class="c-pc-player-control__time-shift-container__returnLive"
              :type="ButtonType.Custom"
              :size="ButtonSize.XMini"
              :text="$lang('player.timeShift.return.live')"
              :icon="PcOriginIconReturnLive"
              icon-class="c-pc-player-control__time-shift-container__returnLive__icon"
              @click="toReturnLive"
            />
          </div>

          <!-- 精彩看点 -->
          <pc-player-time-axis-mark-container
            class="c-pc-player-control__time-axis-mark-container"
            v-if="supportTimeAxisMark"
          />
        </div>

        <!-- 右侧按钮 -->
        <div class="c-pc-player-control__content__right">
          <!-- 连麦信息 -->
          <pc-connect-mic-setting
            v-if="isConnectMicing && mainScreen === MainScreenContent.Player"
          />

          <!-- 弹幕相关设置 -->
          <template v-if="barrageSetting.barrageEnabled">
            <!-- 弹幕开关 -->
            <pc-origin-icon-barrage-on
              v-if="barrageShow"
              class="c-pc-player-control__button"
              :data-tips="$lang('player.closeBarrage')"
              @click="toToggleBarrageShow"
            />
            <pc-origin-icon-barrage-off
              v-else
              class="c-pc-player-control__button"
              :data-tips="$lang('player.openBarrage')"
              @click="toToggleBarrageShow"
            />
            <!-- 弹幕设置 -->
            <pc-barrage-setting v-show="barrageSettingEnabled" />
          </template>

          <!-- 倍速设置 -->
          <pc-rate-setting v-if="rateSettingVisible" />

          <!-- 音量设置 -->
          <pc-volume-setting v-if="volumeSettingVisible" />

          <!-- 设置面板 -->
          <pc-player-setting v-if="playerSettingVisible" />

          <!-- 文档和视频区域切换 -->
          <div
            v-if="switchScreenButtonVisible"
            class="c-pc-player-control__button c-pc-player-control__button--switch-screen"
            :data-tips="$lang('player.switchScreen')"
            @click="toggleMainScreen"
          ></div>

          <!-- 画中画按钮 -->
          <div
            v-if="pipButtonVisible"
            class="c-pc-player-control__button"
            :class="{
              'c-pc-player-control__button--pip': !isPipActive,
              'c-pc-player-control__button--pip-exit': isPipActive,
            }"
            :data-tips="
              isPipActive ? $lang('player.pictureInPictureExit') : $lang('player.pictureInPicture')
            "
            @click="togglePip"
          ></div>

          <!-- 全屏按钮 -->
          <div
            class="c-pc-player-control__button"
            :class="{
              'c-pc-player-control__button--fullscreen': !isFullscreen,
              'c-pc-player-control__button--fullscreen-cancel': isFullscreen,
            }"
            data-testid="plv-player-fullscreen-toggle-btn"
            :data-tips="
              isFullscreen ? $lang('layout.fullscreenCancel') : $lang('layout.fullscreen')
            "
            @click="togglePlayerFullscreen"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { formatSeconds } from '@polyv/utils/date';

import PcPlayerProgressBar from '@/components/page-watch-common/player/player-progress-bar/pc-player-progress-bar.vue';
import PcPlayerTimeAxisMarkContainer from '@/components/page-watch-common/player/player-time-axis-mark/pc-player-time-axis-mark-container.vue';
import NormalButton, { ButtonSize, ButtonType } from '@/components/common-base/normal-button';
import { PcIconClose } from '@/components/component-icons/pc/map';
import {
  PcOriginIconReturnLive,
  PcOriginIconBarrageOff,
  PcOriginIconBarrageOn,
} from '@/components/component-icons/pc-origin/map';
import {
  MobileIconPlayerForward,
  MobileIconPlayerBack,
} from '@/components/component-icons/mobile/map';

import PcConnectMicSetting from './pc-connect-mic-setting.vue';
import PcBarrageSetting from './pc-barrage-setting.vue';
import PcPlayerSetting from './pc-player-setting.vue';
import PcRateSetting from './pc-rate-setting.vue';
import PcVolumeSetting from './pc-volume-setting.vue';
import PlayerTips from '@/components/page-watch-common/player/player-control/player-tips/player-tips.vue';

import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { MainScreenContent, PlayStatus } from '@polyv/live-watch-sdk';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { usePlayerStore } from '@/store/use-player-store';

import { appEvents, useEventBusListener } from '@/app/app-events';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { usePlayerControl } from '@/components/page-watch-common/player/hooks/use-player-control';
import { collectPlayerKeyboardEffectElements } from '@/components/page-watch-common/player/hooks/use-player-keyboard';
import { usePcPlayerFullscreen } from '../../hooks/use-player-fullscreen';
import { usePlayerPip } from '../../hooks/use-player-pip';

const playerControlUI = ref<HTMLDivElement>();
collectPlayerKeyboardEffectElements(playerControlUI);

const { playStatus, barrageSetting, barrageShow, supportTimeAxisMark, supportLiveTimeShift } =
  storeDefinitionToRefs(usePlayerStore);

const layoutStore = useLayoutStore();
const { mainScreen } = storeDefinitionToRefs(useLayoutStore);
const { toggleMainScreen } = layoutStore;

const { isConnectMicing } = storeDefinitionToRefs(useConnectMicStore);

const {
  toTogglePlay,
  toRefresh,
  toToggleBarrageShow,
  toRestart,
  toReturnLive,
  toBackOffVideo,
  toForwardVideo,
} = usePlayerAction();

const {
  playbackTimeVisible,
  playerProgressVisible,
  playButtonTips,
  playerControlPlayBtnVisible,
  refreshButtonVisible,
  volumeSettingVisible,
  rateSettingVisible,
  playerSettingVisible,
  manualPlayTipsVisible,
  switchScreenButtonVisible,
  currentTimeText,
  durationTimeText,
  barrageSettingEnabled,
  timeShiftReturnLiveButtonVisible,
  fastForwardBackwardVisible,
  forwardButtonTips,
  backwardButtonTips,
} = usePlayerControl();

const { isFullscreen, togglePlayerFullscreen } = usePcPlayerFullscreen();

const { isPipActive, pipButtonVisible, togglePip } = usePlayerPip();

const { visible: manualTipsVisible, close: closeManualTips } = useSimpleVisible(true);

/** 历史播放的进度 */
const historyDuration = ref<number>();

const {
  visible: historyTipsVisible,
  show: showHistoryTips,
  close: closeHistoryTips,
} = useSimpleVisible(false, {
  autoClose: true,
});

useEventBusListener(appEvents.player.ShowHistoryTips, (duration: number) => {
  historyDuration.value = duration || 0;
  showHistoryTips();
});

/** 点击重新播放 */
function onClickRestart() {
  toRestart();
  closeHistoryTips();
}
</script>

<style lang="scss">
$--player-control-button-size: 48px !default;
$--player-control-button-icon-size: 24px !default;

.c-pc-player-control {
  position: relative;
  width: 100%;
  height: 100px;
  color: $--color-white;
}

.c-pc-player-control__tips-wrap {
  position: absolute;
  bottom: $--player-control-button-size + 24;
  left: 8px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  pointer-events: none;
}

.c-pc-player-control__tips {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 18px 0 24px;
  margin-bottom: 8px;
  font-size: 16px;
  font-style: normal;
  line-height: 48px;
  color: $--color-white;
  text-align: center;
  white-space: nowrap;
  pointer-events: initial;
  background-color: $--player-control-panel-bg;
  border-radius: 24px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.c-pc-player-control__tips__highlight {
  margin-right: 4px;
  margin-left: 4px;
  color: #5c9dff;
}

.c-pc-player-control__tips__btn {
  height: 26px;
  padding: 0 11px;
  margin-left: 16px;
  font-size: 14px;
  line-height: 26px;
  color: #5c9dff;
  letter-spacing: 0.52px;
  cursor: pointer;
  border: 1px solid #5c9dff;
  border-radius: 16px;
}

.c-pc-player-control__tips__close {
  display: flex;
  margin-left: 8px;
  font-size: 16px !important;
  font-weight: bold;
  color: #a8a8a8;
  cursor: pointer;
}

.c-pc-player-control__main {
  position: relative;
  z-index: 10;
  height: 100%;
  pointer-events: none;
  user-select: none;
  background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3));
}

.c-pc-player-control__content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 48px;
  pointer-events: initial;
}

.c-pc-player-control__progress {
  position: absolute;
  top: -16px;
  left: 0;
}

.c-pc-player-control__content__left {
  position: absolute;
  bottom: 0;
  left: 8px;
  display: flex;
  height: 100%;
}
.c-pc-player-control__content__right {
  position: absolute;
  right: 8px;
  bottom: 0;
  display: flex;
  height: 100%;
}

.c-pc-player-control__button {
  position: relative;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: $--player-control-button-size;
  height: $--player-control-button-size;
  font-size: $--player-control-button-icon-size;
  cursor: pointer;
  background-repeat: no-repeat;
  background-position: center;
  background-size: $--player-control-button-icon-size $--player-control-button-icon-size;
}

.c-pc-player-control__button[data-tips] {
  position: relative;
  &::after {
    position: absolute;
    bottom: 100%;
    left: 50%;
    z-index: 100;
    height: 32px;
    padding: 0 16px;
    font-size: 14px;
    line-height: 32px;
    color: $--color-white;
    white-space: nowrap;
    pointer-events: none;
    content: attr(data-tips);
    background: $--player-control-panel-bg;
    border-radius: 2px;
    opacity: 0;
    transition: 0.3s;
    transform: translateX(-50%);
  }

  &:hover {
    &::after {
      opacity: 1;
    }
  }
}

.c-pc-player-control__button--play {
  background-image: url(./imgs/pc-player-ui-play.png);
  &:hover {
    background-image: url(./imgs/pc-player-ui-play-hover.png);
  }
}

.c-pc-player-control__button--pause {
  background-image: url(./imgs/pc-player-ui-pause.png);
  &:hover {
    background-image: url(./imgs/pc-player-ui-pause-hover.png);
  }
}

.c-pc-player-control__button--refresh {
  background-image: url(./imgs/pc-player-ui-refresh.png);
  &:hover {
    background-image: url(./imgs/pc-player-ui-refresh-hover.png);
  }
}

.c-pc-player-control__time {
  height: $--player-control-button-size;
  margin-left: 12px;
  font-size: 14px;
  line-height: $--player-control-button-size;
  color: $--color-white;
}

.c-pc-player-control__time-shift-container {
  display: inline-flex;
  align-items: center;
  height: $--player-control-button-size;
  margin-left: 12px;
}

.c-pc-player-control__time-shift-container__returnLive {
  padding: 0 10px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.c-pc-player-control__time-shift-container__returnLive__icon {
  margin-top: -2px;
  font-size: 14px;
}

.c-pc-player-control__time-axis-mark-container {
  height: $--player-control-button-size;
  margin-left: 12px;
}

.c-pc-player-control__capsule {
  position: relative;
  display: flex;
  align-items: center;
  height: $--player-control-button-size;
  margin-right: 12px;
  margin-left: 12px;
}
.c-pc-player-control__capsule__content {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  font-size: 12px;
  color: $--color-white;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.38);
  border: 1px solid $--color-white;
  border-radius: 12px;
  transition: 0.3s;
}
.c-pc-player-control__select-panel {
  position: absolute;
  bottom: 100%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 96px;
  padding: 24px 0;
  pointer-events: none;
  background: $--player-control-panel-bg;
  border-radius: 2px;
  opacity: 0;
  transition: 0.3s;
  transform: translateX(-50%);
}
.c-pc-player-control__select-panel__item {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 26px;
  font-size: 12px;
  color: $--color-white;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 13px;
  transition: 0.15s;

  &.c-pc-player-control__select-panel__item--active,
  &:hover {
    border-color: $--color-white;
  }
}
.c-pc-player-control__select-panel__item + .c-pc-player-control__select-panel__item {
  margin-top: 16px;
}
.c-pc-player-control__capsule:hover {
  .c-pc-player-control__capsule__content {
    background: rgba(0, 0, 0, 0.5);
  }
  .c-pc-player-control__select-panel {
    pointer-events: initial;
    opacity: 1;
  }
}

.c-pc-player-control__button--fullscreen {
  background-image: url(./imgs/pc-player-ui-fullscreen.png);
  &:hover {
    background-image: url(./imgs/pc-player-ui-fullscreen-hover.png);
  }
}
.c-pc-player-control__button--fullscreen-cancel {
  background-image: url(./imgs/pc-player-ui-fullscreen-cancel.png);
  &:hover {
    background-image: url(./imgs/pc-player-ui-fullscreen-cancel-hover.png);
  }
}

.c-pc-player-control__button--switch-screen {
  background-image: url(./imgs/pc-player-ui-switch-screen.png);
  &:hover {
    background-image: url(./imgs/pc-player-ui-switch-screen-hover.png);
  }
}

.c-pc-player-control__button--pip {
  background-image: url(./imgs/pc-player-ui-pip.png);
  &:hover {
    background-image: url(./imgs/pc-player-ui-pip-hover.png);
  }
}
.c-pc-player-control__button--pip-exit {
  background-image: url(./imgs/pc-player-ui-pip-exit.png);
  &:hover {
    background-image: url(./imgs/pc-player-ui-pip-exit-hover.png);
  }
}

.c-pc-player-control__tips__switch-btn {
  padding: 0 3px;
  color: #3f76fc;
}

.c-pc-player-control__button--fastForward {
  font-size: 28px;
}
</style>
