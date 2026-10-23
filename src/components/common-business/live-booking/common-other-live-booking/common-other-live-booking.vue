<template>
  <common-other-live-booking-basic
    v-if="isShowBooking"
    :title="title"
    :start-time="startTime"
    :is-booked="isBooked ?? false"
    @close-click="handleCloseClick"
  >
    <mobile-live-booking-button
      v-if="isMobile"
      :button-type="ButtonType.Custom"
      :button-position="'player'"
      :is-other-live="true"
      :channel-id="channelId"
    />
    <pc-live-booking-button
      v-else
      :button-type="ButtonType.Custom"
      :button-position="'player'"
      :is-other-live="true"
      :channel-id="channelId"
    />
  </common-other-live-booking-basic>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import CommonOtherLiveBookingBasic from './common-other-live-booking-basic.vue';
import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import MobileLiveBookingButton from '@/components/common-business/live-booking/mobile-live-booking-button.vue';
import PcLiveBookingButton from '@/components/common-business/live-booking/pc-live-booking-button.vue';
import { ButtonType } from '@/components/common-base/normal-button/types';
import { isMobile } from '@/assets/utils/browser';
import { PlayerEvents } from '@polyv/live-watch-sdk';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';

const { getWatchCore } = useMultiPolyvWatchApp();
const visible = ref(true);
const { otherChannelBookingEnabled, singleOtherChannelBookingConfig } =
  storeDefinitionToRefs(useLiveBookingStore);
// 是否显示设置面板
const isSetupPanelShow = ref(false);

const isShowBooking = computed(
  () => !isSetupPanelShow.value && otherChannelBookingEnabled.value && visible.value,
);

const title = computed(() => singleOtherChannelBookingConfig.value?.channelName ?? '');
const startTime = computed(() => singleOtherChannelBookingConfig.value?.startTime ?? '');
const isBooked = computed(
  () =>
    singleOtherChannelBookingConfig.value?.isSmsLiveBooking ||
    singleOtherChannelBookingConfig.value?.isWxLiveBooking ||
    singleOtherChannelBookingConfig.value?.isCustomLiveBooking,
);
const channelId = computed(() => singleOtherChannelBookingConfig.value?.channelId ?? '');

const handleCloseClick = () => {
  visible.value = false;
};

const handlePlayerSetupPanelChange = (data: { isShow: boolean }) => {
  isSetupPanelShow.value = data.isShow;
};

onMounted(() => {
  const watchCore = getWatchCore();

  watchCore.player.eventEmitter.on(
    PlayerEvents.PlayerSetupPanelChange,
    handlePlayerSetupPanelChange,
  );
});

onBeforeUnmount(() => {
  const watchCore = getWatchCore();

  watchCore.player.eventEmitter.off(
    PlayerEvents.PlayerSetupPanelChange,
    handlePlayerSetupPanelChange,
  );
});
</script>
