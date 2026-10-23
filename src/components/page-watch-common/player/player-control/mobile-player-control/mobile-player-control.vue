<!-- @file 移动端播放器控制栏 -->
<template>
  <div
    class="c-mobile-player-control"
    :class="{
      'c-mobile-player-control--page-fullscreen': mobilePlayerIsPageFullscreen,
    }"
  >
    <div class="c-mobile-player-control__tips-wrap">
      <!-- rtc 暂停播放的提示 -->
      <div
        v-if="playerControlEnabled && playerControlVisible && rtcPlayerPauseTipVisible"
        class="c-mobile-player-control__tips c-mobile-player-control__tips--rtc-paused"
      >
        {{ $lang('player.rtc.paused') }}
      </div>
    </div>

    <!-- 控制栏 -->
    <transition name="slide">
      <div
        v-show="playerControlEnabled && playerControlVisible"
        class="c-mobile-player-control__main"
        @click.stop="startHidePlayerControlTimer"
      >
        <div class="c-mobile-player-control__inner">
          <!-- 左侧按钮 -->
          <div class="c-mobile-player-control__inner__left">
            <!-- 暂停播放按钮 -->
            <div
              v-if="playerControlPlayBtnVisible"
              class="c-mobile-player-control__button"
              :class="{
                'c-mobile-player-control__button--pause': playStatus === PlayStatus.Playing,
                'c-mobile-player-control__button--play': playStatus === PlayStatus.Pause,
              }"
              @click="toTogglePlay"
            ></div>

            <!-- 刷新按钮 -->
            <div
              v-if="refreshButtonVisible"
              class="c-mobile-player-control__button c-mobile-player-control__button--refresh"
              @click="toRefresh"
            ></div>

            <!-- 直播时移时间进度 -->
            <div
              v-if="supportLiveTimeShift"
              class="c-mobile-player-control__time"
            >
              {{ currentTimeText }}
            </div>
          </div>

          <div class="c-mobile-player-control__inner__progress-bar">
            <!-- 直播时移进度条 -->
            <mobile-player-progress-bar v-if="supportLiveTimeShift" />
          </div>

          <!-- 右侧按钮 -->
          <div class="c-mobile-player-control__inner__right">
            <template v-if="barrageSettingEnabled">
              <!-- 弹幕设置 -->
              <mobile-icon-barrage-setting
                v-if="isHorizontalScreenOrientation || mobilePlayerIsPageFullscreen"
                class="c-mobile-player-control__button"
                color="#fff"
                @click="toToggleBarrageMobileSettingVisible(!barrageMobileSettingVisible)"
              />
              <!-- 弹幕开关 -->
              <mobile-origin-icon-barrage-on
                v-if="barrageShow"
                class="c-mobile-player-control__button"
                @click="toToggleBarrageShow"
              />
              <mobile-origin-icon-barrage-off
                v-else
                class="c-mobile-player-control__button"
                @click="toToggleBarrageShow"
              />
            </template>

            <!-- 设置面板 -->
            <div
              class="c-mobile-player-control__button c-mobile-player-control__button--setting"
              @click="openMobileMorePopup"
            ></div>

            <!-- 全屏按钮 -->
            <div
              v-show="!isHorizontalScreenOrientation"
              class="c-mobile-player-control__button"
              :class="{
                'c-mobile-player-control__button--fullscreen': !mobilePlayerIsPageFullscreen,
                'c-mobile-player-control__button--fullscreen-exit': mobilePlayerIsPageFullscreen,
              }"
              data-testid="plv-player-fullscreen-toggle-btn"
              @click="toToggleMobilePageFullscreen"
            ></div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import {
  MobileOriginIconBarrageOff,
  MobileOriginIconBarrageOn,
} from '@/components/component-icons/mobile-origin/map';
import { MobileIconBarrageSetting } from '@/components/component-icons/mobile/map';
import MobilePlayerProgressBar from '@/components/page-watch-common/player/player-progress-bar/mobile-player-progress-bar.vue';

import { useLayoutStore } from '@/store/use-layout-store';
import { usePlayerStore } from '@/store/use-player-store';
import { PlayStatus } from '@polyv/live-watch-sdk';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { usePlayerControl } from '@/components/page-watch-common/player/hooks/use-player-control';
import { usePlayerControlVisible } from './_hooks/_user-player-control-visible';
import { useGlobalInject } from '@/app/use-global-inject';
import { appEvents } from '@/app/app-events';

const { getEmitter } = useGlobalInject();

const {
  playStatus,
  playerControlEnabled,
  playerControlVisible,
  barrageShow,
  barrageMobileSettingVisible,
  supportLiveTimeShift,
} = storeDefinitionToRefs(usePlayerStore);

const { isHorizontalScreenOrientation, mobilePlayerIsPageFullscreen } =
  storeDefinitionToRefs(useLayoutStore);

const {
  toTogglePlay,
  toRefresh,
  toToggleMobilePageFullscreen,
  toToggleBarrageShow,
  toToggleBarrageMobileSettingVisible,
} = usePlayerAction();

const {
  rtcPlayerPauseTipVisible,
  currentTimeText,

  playerControlPlayBtnVisible,
  refreshButtonVisible,
  barrageSettingEnabled,
} = usePlayerControl();

const { startHidePlayerControlTimer } = usePlayerControlVisible();

function openMobileMorePopup() {
  getEmitter().emit(appEvents.global.OpenMobileMorePopup);
}
</script>

<style lang="scss">
.c-mobile-player-control {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 310;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.c-mobile-player-control__tips-wrap {
  position: absolute;
  bottom: 32px;
  left: 8px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  pointer-events: none;
}

.c-mobile-player-control__tips {
  display: flex;
  align-items: center;
  padding: 7px 12px;
  font-size: 12px;
  font-style: normal;
  color: $--color-white;
  text-align: center;
  white-space: nowrap;
  pointer-events: initial;
  background-color: $--player-control-panel-bg;
  border-radius: 14px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.c-mobile-player-control__main {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 88px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 100%);
}
.c-mobile-player-control__inner {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px;
  pointer-events: initial;
}
.c-mobile-player-control__inner__left {
  display: flex;
  align-items: center;
  padding-left: 8px;
}
.c-mobile-player-control__inner__right {
  display: flex;
  align-items: center;
  padding-right: 8px;
  margin-left: auto;

  .polyv-icon {
    display: inline-block;
    height: 32px;
  }
}

.c-mobile-player-control__button {
  display: flex;
  width: 32px;
  height: 32px;
  font-size: 32px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.c-mobile-player-control__time {
  margin-left: 12px;
  font-size: 14px;
  color: $--color-white;
}

.c-mobile-player-control__inner__progress-bar {
  flex: 1;
  margin: 0 8px;
}

.c-mobile-player-control__button--play {
  background-image: url(./imgs/mobile-player-ui-play.png);
}
.c-mobile-player-control__button--pause {
  background-image: url(./imgs/mobile-player-ui-pause.png);
}
.c-mobile-player-control__button--refresh {
  background-image: url(./imgs/mobile-player-ui-refresh.png);
}
.c-mobile-player-control__button--setting {
  background-image: url(./imgs/mobile-player-ui-setting.png);
}
.c-mobile-player-control__button--fullscreen {
  background-image: url(./imgs/mobile-player-ui-fullscreen.png);
}
.c-mobile-player-control__button--fullscreen-exit {
  background-image: url(./imgs/mobile-player-ui-fullscreen-exit.png);
}

.c-mobile-player-control--page-fullscreen {
  .c-mobile-player-control__inner__left {
    padding-left: 50px;
  }
  .c-mobile-player-control__inner__right {
    padding-right: 50px;
  }
}
</style>
