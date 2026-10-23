<!-- @file 移动端倒计时 + 预约条（引导页顶部、会议模式顶部共用） -->
<template>
  <div
    class="c-mobile-live-count-down-bar pws-dark-white-bg-10 pws-light-white-bg-40"
    :style="liveBookingStyle"
  >
    <mobile-live-count-down
      :show-title="showLiveBookingButton"
      theme="number-square"
      :count-style="countStyle"
    />
    <mobile-live-booking-button
      v-if="showLiveBookingButton"
      class="c-mobile-live-count-down-bar__booking pws-normal-button-primary--config-wrapper"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, CSSProperties } from 'vue';

import { generateBgStyle } from '@/themes/utils/theme-config';

import MobileLiveBookingButton from '@/components/common-business/live-booking/mobile-live-booking-button.vue';
import MobileLiveCountDown from '@/components/common-business/live-count-down/mobile-live-count-down.vue';

import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { useThemeStore } from '@/store/use-theme-store';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const { showLiveBookingButton } = storeDefinitionToRefs(useLiveBookingStore);

const themeStore = useThemeStore();

const liveBookingStyle = computed(() => {
  if (!themeStore.watchThemeStyleConfig) return;

  const { bgConfig } = themeStore.watchThemeStyleConfig.mobile.splash.subscribeArea;

  return generateBgStyle(bgConfig);
});

const countStyle = computed(() => {
  if (!themeStore.watchThemeStyleConfig) return;

  const result: CSSProperties = {};
  const { countBg, countColor } = themeStore.watchThemeStyleConfig.mobile.splash.subscribeArea;

  if (countBg) {
    result.background = countBg;
  }
  if (countColor) {
    result.color = countColor;
  }

  return result;
});
</script>

<style lang="scss">
.c-mobile-live-count-down-bar {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  padding: 12px;
  text-align: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  border-radius: 8px;
}

.c-mobile-live-count-down-bar__booking {
  margin-left: auto;
}
</style>
