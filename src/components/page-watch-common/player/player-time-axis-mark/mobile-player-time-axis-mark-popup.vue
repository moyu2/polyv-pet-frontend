<!-- @file 移动端横屏时间轴标记-精彩看点业务弹窗组件 -->

<template>
  <mobile-popup
    class="c-mobile-player-time-axis-mark-popup"
    fill-body-section
    :title="$lang('player.timeAxisMark.base.text')"
    :visible.sync="timeAxisMarkPopupVisible"
    :update-on-resize="true"
    :force-horizontal-screen="isPageFullscreenOrHorizontalScreen"
  >
    <div class="c-mobile-player-time-axis-mark-popup__content">
      <div
        v-for="markPoint in timeAxisMarkList"
        :key="markPoint.id"
        class="c-mobile-player-time-axis-mark-popup__content-item"
        @click="toSeekByTimeAxisMark(markPoint)"
      >
        <img
          class="c-mobile-player-time-axis-mark-popup__content-item__img"
          :src="markPoint.markMessage.previewUrl"
        />
        <div class="c-mobile-player-time-axis-mark-popup__content-item__desc">
          <div
            class="c-mobile-player-time-axis-mark-popup__content-item__desc__title g-multiline"
            :title="markPoint.markMessage.title"
          >
            {{ markPoint.markMessage.title }}
          </div>
          <span class="c-mobile-player-time-axis-mark-popup__content-item__desc__time">{{
            formatSeconds(markPoint.markTime, { segments: 3 })
          }}</span>
        </div>
      </div>
      <p
        v-if="timeAxisMarkList.length === 0"
        class="c-mobile-player-time-axis-mark-popup__content-empty"
      >
        {{ $lang('player.timeAxisMark.empty.text') }}
      </p>
    </div>
  </mobile-popup>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { formatSeconds } from '@polyv/utils/date';
import { PlayerEvents } from '@polyv/live-watch-sdk';

import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { useLayoutStore } from '@/store/use-layout-store';
import { useTimeAxisMarkHook } from './use-time-axis-mark';
import { useGlobalInject } from '@/app/use-global-inject';

const { getWatchCore } = useGlobalInject();

const { isPageFullscreenOrHorizontalScreen } = storeDefinitionToRefs(useLayoutStore);

const timeAxisMarkPopupVisible = ref(false);

const { timeAxisMarkList, toSeekByTimeAxisMark } = useTimeAxisMarkHook();

onMounted(() => {
  const watchCore = getWatchCore();
  watchCore.player.eventEmitter.on(PlayerEvents.PlayerHighlightsBtnClicked, () => {
    timeAxisMarkPopupVisible.value = true;
  });
});
</script>

<style lang="scss">
.c-mobile-player-time-axis-mark-popup__content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

.c-mobile-player-time-axis-mark-popup__content-item {
  display: flex;
  margin-bottom: 18px;
  color: #333;
  &:last-child {
    margin-bottom: 0;
  }
}

.c-mobile-player-time-axis-mark-popup__content-item__img {
  width: 134px;
  height: 76px;
  margin-right: 8px;
  background: #000;
  border-radius: 4px;
}

.c-mobile-player-time-axis-mark-popup__content-item__desc {
  overflow: hidden;
}
.c-mobile-player-time-axis-mark-popup__content-item__desc__title {
  margin-bottom: 2px;
  font-size: 14px;
  font-weight: bold;
  line-height: 22px;
}

.c-mobile-player-time-axis-mark-popup__content-item__desc__time {
  font-size: 12px;
  line-height: 1;
  opacity: 0.6;
}

.c-mobile-player-time-axis-mark-popup__content-empty {
  line-height: 100px;
  color: #000;
  text-align: center;
}
</style>
