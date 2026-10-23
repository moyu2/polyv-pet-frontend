<!-- @file PC 端布局倒计时层 -->
<template>
  <div
    v-if="showLiveCountDown"
    class="c-pc-count-down-layout pws-normal-button-primary--config-wrapper"
    :class="{
      'c-pc-count-down-layout--top-right': isTopRightStyle,
    }"
  >
    <div class="c-pc-count-down-layout__content pws-count-down-layout">
      <!-- 直播开始文案 -->
      <div class="c-pc-count-down-layout__time-text">
        {{ $lang('watch.liveTime') }}：{{ liveStartTimeText }}
      </div>

      <div
        v-if="isTopRightStyle"
        class="c-pc-count-down-layout__title"
      >
        {{ $lang('liveCountDown.text') }}
      </div>

      <!-- 倒计时 -->
      <pc-live-count-down
        class="c-pc-count-down-layout__count-down"
        :theme="isTopRightStyle ? 'text' : 'square'"
      />

      <!-- 直播预约按钮 -->
      <pc-live-booking-button
        v-if="showLiveBookingButton"
        class="c-pc-count-down-layout__live-booking"
        button-style="button"
        :button-size="isTopRightStyle ? ButtonSize.Mini : ButtonSize.Large"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ButtonSize } from '@/components/common-base/normal-button/types';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import PcLiveCountDown from '@/components/common-business/live-count-down/pc-live-count-down.vue';
import PcLiveBookingButton from '@/components/common-business/live-booking/pc-live-booking-button.vue';
import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { useCountDownLayer } from './use-count-down-layer';

const { showLiveCountDown, liveStartTimeText } = storeDefinitionToRefs(useChannelInfoStore);

const { showLiveBookingButton } = storeDefinitionToRefs(useLiveBookingStore);

const { isTopRightStyle } = useCountDownLayer();
</script>

<style lang="scss">
.c-pc-count-down-layout__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  pointer-events: initial;
  background-color: #2b2c35;
  background-image: linear-gradient(225deg, #2b2c35 0%, rgba(255, 255, 255, 0.1) 100%);
  @include pc-watch-card-radius-top;
}

.c-pc-count-down-layout__time-text {
  margin-bottom: 17px;
  font-size: 16px;
  color: #e4e4e4;
}

.c-pc-count-down-layout__live-booking {
  margin-top: 40px;
}

.c-pc-count-down-layout--top-right {
  pointer-events: none;

  .c-pc-count-down-layout__time-text {
    display: none;
  }

  .c-pc-count-down-layout__title {
    margin-right: 5px;
    font-size: 18px;
    line-height: 21px;
    color: $--color-white;
  }

  .c-pc-count-down-layout__content {
    position: absolute;
    top: 20px;
    right: 40px;
    flex-direction: row;
    align-items: center;
    width: initial;
    height: initial;
    padding: 8px 8px 8px 16px;
    pointer-events: initial;
    background: rgba(0, 0, 0, 0.7);
    background-image: none;
    border-radius: 32px;
  }

  .c-pc-count-down-layout__live-booking {
    margin-top: 0;
    margin-left: 16px;
  }
}
</style>
