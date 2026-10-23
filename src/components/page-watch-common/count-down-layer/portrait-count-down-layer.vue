<!-- @file 移动端布局倒计时层 -->
<template>
  <div
    v-if="showLiveCountDown"
    class="c-portrait-count-down-layout"
  >
    <!-- 直播开始文案 -->
    <div class="c-portrait-count-down-layout__title">
      {{ $lang('liveCountDown.text') }}
    </div>

    <!-- 倒计时 -->
    <mobile-live-count-down
      class="c-portrait-count-down-layout__count-down"
      theme="text"
    />

    <!-- 直播预约按钮 -->
    <mobile-live-booking-button
      v-if="showLiveBookingButton"
      class="c-portrait-count-down-layout__live-booking"
      button-position="corner"
    />
  </div>
</template>

<script setup lang="ts">
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import MobileLiveCountDown from '@/components/common-business/live-count-down/mobile-live-count-down.vue';
import MobileLiveBookingButton from '@/components/common-business/live-booking/mobile-live-booking-button.vue';
import { useLiveBookingStore } from '@/store/use-live-booking-store';

const { showLiveCountDown } = storeDefinitionToRefs(useChannelInfoStore);

const { showLiveBookingButton } = storeDefinitionToRefs(useLiveBookingStore);
</script>

<style lang="scss">
.c-portrait-count-down-layout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 12px;
  white-space: nowrap;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 32px;
}
.c-portrait-count-down-layout__title {
  margin-right: 5px;
}
.c-portrait-count-down-layout__live-booking {
  margin-right: -6px;
  margin-left: 6px;
}
</style>
