<!-- @file 移动端横屏-播放器时间轴相关入口 -->

<template>
  <div class="c-mobile-player-time-axis-entrance">
    <div
      v-if="timeShiftReturnLiveButtonVisible"
      class="c-mobile-player-time-axis-entrance__time-shift"
    >
      <!-- 返回直播 -->
      <normal-button
        class="c-mobile-player-time-axis-entrance__time-shift__returnLive"
        :type="ButtonType.Custom"
        :size="ButtonSize.XMini"
        :text="$lang('player.timeShift.return.live')"
        :icon="MobileOriginIconReturnLive"
        icon-class="c-mobile-player-time-axis-entrance__time-shift__returnLive__icon"
        @click="toReturnLive"
      />
    </div>
    <div
      v-if="supportTimeAxisMark"
      class="c-mobile-player-time-axis-entrance__time-axis-mark"
    >
      <!-- 精彩看点 -->
      <normal-button
        class="c-mobile-player-time-axis-entrance__time-axis-mark__button"
        :type="ButtonType.Custom"
        :size="ButtonSize.XMini"
        :text="$lang('player.timeAxisMark.base.text')"
        :icon="MobileIconHighlight"
        icon-class="c-mobile-player-time-axis-entrance__time-axis-mark__button__icon"
        @click="showTimeAxisMarkPopup"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import NormalButton, { ButtonSize, ButtonType } from '@/components/common-base/normal-button';
import { MobileIconHighlight } from '@/components/component-icons/mobile/map';
import { MobileOriginIconReturnLive } from '@/components/component-icons/mobile-origin/map';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlayerStore } from '@/store/use-player-store';
import { usePlayerControl } from '@/components/page-watch-common/player/hooks/use-player-control';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { PlayerEvents } from '@polyv/live-watch-sdk';
import { useGlobalInject } from '@/app/use-global-inject';

const { getWatchCore } = useGlobalInject();

const { supportTimeAxisMark } = storeDefinitionToRefs(usePlayerStore);

const { timeShiftReturnLiveButtonVisible } = usePlayerControl();

const { toReturnLive } = usePlayerAction();

function showTimeAxisMarkPopup() {
  const watchCore = getWatchCore();
  watchCore.player.eventEmitter.emit(PlayerEvents.PlayerHighlightsBtnClicked, {});
}
</script>

<style lang="scss">
.c-mobile-player-time-axis-entrance {
  position: absolute;
  right: 0;
  bottom: 52px;
  z-index: 400;
  display: flex;
}

.c-mobile-player-time-axis-entrance__time-shift__returnLive,
.c-mobile-player-time-axis-entrance__time-axis-mark__button {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 14px;
  margin-right: 8px;
  font-size: 12px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 14px;
}

.c-mobile-player-time-axis-entrance__time-shift__returnLive__icon,
.c-mobile-player-time-axis-entrance__time-axis-mark__button__icon {
  margin-top: -2px;
  font-size: 14px;
}
</style>
