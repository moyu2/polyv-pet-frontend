<!-- @file PC 端直播预约按钮 -->
<template>
  <div
    class="c-pc-live-booking-button"
    :class="{
      'c-pc-live-booking-button--booked': isSmsLiveBooking,
      'c-pc-live-booking-button--mini': buttonSize === 'mini',
    }"
  >
    <!-- 文字样式 -->
    <div
      v-if="buttonStyle === 'text'"
      class="c-pc-live-booking-button__text"
      @click="onClickButton"
    >
      <pc-icon-booking
        v-if="!isOtherLive"
        class="c-pc-live-booking-button__text__icon pws-next-primary-color"
      />
      <mobile-icon-bell
        v-else
        class="c-pc-live-booking-button__text__icon pws-next-primary-color"
      />
      <span class="c-pc-live-booking-button__text__text pws-next-primary-color">{{
        buttonText
      }}</span>
    </div>

    <!-- 按钮样式 -->
    <normal-button
      v-if="buttonStyle === 'button'"
      class="c-pc-live-booking-button__button"
      :size="buttonSize"
      block
      @click="onClickButton"
    >
      <pc-icon-booking
        v-if="buttonSize === 'mini' && !isSmsLiveBooking"
        class="c-pc-live-booking-button__button__icon"
      />
      <span>{{ buttonText }}</span>
    </normal-button>

    <live-booking-form-dialog
      ref="bookingFormRef"
      :channel-id="channelId"
    />
  </div>
</template>

<script setup lang="ts">
import { PcIconBooking } from '@/components/component-icons/pc/map';
import LiveBookingFormDialog from './pc-live-booking-form-dialog.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { translate } from '@/assets/lang';
import { PropUtils, useProps } from '@polyv/vue-components';
import { computed, onMounted, ref, unref } from 'vue';
import { ButtonSize } from '@/components/common-base/normal-button/types';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { LiveBookingFormInstance } from './types';
import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';
import { MobileIconBell } from '@/components/component-icons/mobile/map';
import { useLiveBookingCustom } from './hooks/use-live-booking-custom';
import { debounce } from 'lodash-es';
import { useLiveBookingCache } from '@/hooks/business/use-live-booking-cache/use-live-booking-cache';

const { getLiveBookingCache, setLiveBookingCache } = useLiveBookingCache();

const { trackUserReservationLive } = useWatchEventTrack();

const props = defineProps({
  /** 按钮样式，默认：text，text-文本，button-按钮 */
  buttonStyle: PropUtils.oneOfType<'text' | 'button'>([String]).def('text'),
  /** 按钮大小，默认：ButtonSize.Large */
  buttonSize: PropUtils.enum<ButtonSize>().def(ButtonSize.Large),
  /** 其他频道预约的 channelId */
  channelId: PropUtils.string.def(''),
  /** 是否是其他频道预约 */
  isOtherLive: PropUtils.bool.def(false),
});

const { buttonStyle, buttonSize } = useProps(props);

const {
  isSmsLiveBooking,
  singleOtherChannelSmsLiveBooking,
  singleOtherChannelCustomLiveBooking,
  isCustomLiveBooking,
  useCustomBooking,
  useSmsBooking,
  singleOtherChannelSmsLiveBookingEnable,
  singleOtherChannelCustomLiveBookingEnable,
} = storeDefinitionToRefs(useLiveBookingStore);

const { submitLiveBookingOfCustom, cancelLiveBookingOfCustom, patchSroreOfCustom } =
  useLiveBookingCustom({
    otherChannelId: props.channelId,
    singleMode: true,
  });

const isBooking = computed(() => {
  if (unref(props.isOtherLive)) {
    return unref(singleOtherChannelSmsLiveBooking) || unref(singleOtherChannelCustomLiveBooking);
  }
  return unref(isSmsLiveBooking) || unref(isCustomLiveBooking);
});

/** 按钮文本 */
const buttonText = computed(() => {
  if (unref(isBooking)) {
    return translate('liveBooking.booked');
  }

  if (unref(buttonStyle) === 'button' && unref(buttonSize) === ButtonSize.Mini) {
    return translate('liveBooking.book');
  }

  return translate('liveBooking.bookLive');
});

/** 预约表单组件实例 */
const bookingFormRef = ref<LiveBookingFormInstance>();

/** 处理按钮点击 */
const onClickButton = debounce(() => {
  const instance = unref(bookingFormRef);

  const booked = unref(isBooking);
  // 仅启用“自定义预约”模式
  let onlyCustom = false;
  // 其他频道预约
  if (unref(props.isOtherLive)) {
    onlyCustom =
      !unref(singleOtherChannelSmsLiveBookingEnable) &&
      unref(singleOtherChannelCustomLiveBookingEnable);
  } else {
    onlyCustom = unref(useCustomBooking) && !unref(useSmsBooking);
  }

  const otherSmsBooked = unref(singleOtherChannelSmsLiveBooking);
  const otherCustomBooked = unref(singleOtherChannelCustomLiveBooking);

  // 1) 已预约：按预约类型取消
  if (booked) {
    // 其他频道预约 取消预约
    if (otherSmsBooked) {
      trackUserReservationLive({ reservationType: 'code' });
      instance?.cancelLiveBooking();
      otherCustomBooked && patchSroreOfCustom(false);
      return;
    }
    if (otherCustomBooked) {
      cancelLiveBookingOfCustom();
      return;
    }
    // 正常频道预约 取消预约
    if (unref(isSmsLiveBooking)) {
      trackUserReservationLive({ reservationType: 'code' });
      instance?.cancelLiveBooking();
      useCustomBooking && patchSroreOfCustom(false);
      return;
    }
    cancelLiveBookingOfCustom();

    return;
  }

  // 2) 仅启用“自定义预约”模式
  if (onlyCustom) {
    submitLiveBookingOfCustom();
    return;
  }

  // 3) 其余：埋点后走短信预约表单流程
  trackUserReservationLive({ reservationType: 'code' });

  instance?.openBookingForm();
}, 200);

onMounted(() => {
  // 自动打开预约弹窗
  if (!unref(isBooking)) {
    const cache = getLiveBookingCache();
    if (!cache.needAutoOpenBooking) return;

    setLiveBookingCache({
      needAutoOpenBooking: false,
    });

    onClickButton();
  }
});
</script>

<style lang="scss">
.c-pc-live-booking-button__text {
  display: flex;
  align-items: center;
  color: $--color-primary;
  cursor: pointer;
}

.c-pc-live-booking-button__text__icon {
  display: flex;
  font-size: 20px !important;
}

.c-pc-live-booking-button__text__text {
  margin-left: 2px;
  font-size: 18px;
}

.c-pc-live-booking-button--booked {
  .c-pc-live-booking-button__text {
    color: #adadc0;
  }
}

.c-pc-live-booking-button__button {
  width: 184px;
}

.c-pc-live-booking-button__button__icon {
  display: flex;
  margin-right: 3px;
  font-size: 20px !important;
}

.c-pc-live-booking-button--mini {
  .c-pc-live-booking-button__button {
    width: 68px;
    white-space: nowrap;
  }
}
</style>
