<!-- @file 移动端直播预约按钮 -->
<template>
  <div
    class="c-mobile-live-booking-button"
    :class="{
      'c-mobile-live-booking-button--booked': isLiveBooking,
      'c-mobile-live-booking-button--splash': buttonPosition === 'splash',
      'c-mobile-live-booking-button--player': buttonPosition === 'player',
      'c-mobile-live-booking-button--corner': buttonPosition === 'corner',
      'c-mobile-live-booking-button--other-live': isOtherLive,
    }"
  >
    <div
      v-if="buttonPosition === 'splash' && isShowBookingCount && !isOtherLive"
      class="c-mobile-live-booking-button__text pws-dark-white-color-80 pws-light-black-color-40"
    >
      {{ $lang('liveBooking.booked') }} {{ wxBookingCount }} {{ $lang('base.people') }}
    </div>

    <normal-button
      class="c-mobile-live-booking-button__button pws-mobile-live-booking-button"
      :size="buttonSize"
      :type="innerButtonType"
      block
      @click="onClickButton"
    >
      <div class="c-mobile-live-booking-button__button__top">
        <mobile-icon-check
          v-if="isLiveBooking"
          class="c-mobile-live-booking-button__button__top__icon"
        />
        <mobile-icon-bell
          v-else-if="isOtherLive"
          class="c-mobile-live-booking-button__button__top__icon"
        />
        <mobile-icon-booking
          v-else
          class="c-mobile-live-booking-button__button__top__icon"
        />
        <span>{{ buttonText }}</span>
      </div>
      <div
        v-if="isShowBookingCount && !isOtherLive && buttonPosition !== 'splash'"
        class="c-mobile-live-booking-button__button__bottom"
      >
        {{ wxBookingCount }} {{ $lang('base.people') }}
      </div>
    </normal-button>

    <!-- 短信预约表单弹层 -->
    <mobile-live-booking-form-popup
      ref="bookingFormRef"
      :channel-id="channelId"
    />

    <!-- 关注公众号弹层 -->
    <mobile-live-booking-subscribe-popup
      ref="subscribeRef"
      :is-other-live="isOtherLive"
    />

    <!-- 取消微信预约提示弹层 -->
    <mobile-message-box
      ref="bookingCancelTipsRef"
      content-center
      :title="$lang('base.warmTips')"
      :content="$lang('liveBooking.cancel.tips')"
      :confirm-button-text="$lang('base.confirm')"
      :cancel-button-text="$lang('base.cancel')"
    />
  </div>
</template>

<script setup lang="ts">
import { translate } from '@/assets/lang';
import { computed, onMounted, ref, unref } from 'vue';
import { PropUtils, useProps } from '@polyv/vue-components';

import {
  MobileIconBooking,
  MobileIconBell,
  MobileIconCheck,
} from '@/components/component-icons/mobile/map';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import MobileLiveBookingFormPopup from './mobile-live-booking-form-popup.vue';
import MobileLiveBookingSubscribePopup from './mobile-live-booking-subscribe-popup.vue';
import { MobileMessageBox, MessageBoxInstance } from '@/components/common-base/message-box';

import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';
import { useLiveBookingWx } from './hooks/use-live-booking-wx';
import { LiveBookingFormInstance } from './types';
import { useLiveBookingCustom } from './hooks/use-live-booking-custom';

import { debounce } from 'lodash-es';
import { useLiveBookingCache } from '@/hooks/business/use-live-booking-cache/use-live-booking-cache';

const { trackUserReservationLive } = useWatchEventTrack();

const { getLiveBookingCache, setLiveBookingCache } = useLiveBookingCache();

const props = defineProps({
  /** 按钮使用的位置，splash-引导页（默认），player-播放器，corner-播放器角落 */
  buttonPosition: PropUtils.oneOf(['splash', 'player', 'corner'] as const).def('splash'),
  /** 按钮类型 */
  buttonType: PropUtils.enum<ButtonType>().def(ButtonType.Primary),
  /** 是否是其他直播频道预约 */
  isOtherLive: PropUtils.bool.def(false),
  /** 其他频道预约的 channelId */
  channelId: PropUtils.string.def(''),
});

const { buttonPosition } = useProps(props);

const { subscribeRef, wxSubmitLiveBooking, wxCancelLiveBooking } = useLiveBookingWx({
  otherChannelId: props.channelId,
});

const {
  isLiveBooking: isNormalLiveBooking,
  wxBookingCount: normalWxBookingCount,
  useWxBooking: normalUseWxBooking,
  useSingleWxBooking,
  wxBookingCountVisible,
  isOtherLiveBooking,
  singleOtherChannelBookingConfig,
  singleOtherChannelSmsLiveBooking,
  singleOtherChannelCustomLiveBooking,
  isCustomLiveBooking,
  useCustomBooking,
  useSmsBooking,
  isSmsLiveBooking,
  isWxLiveBooking,
  singleOtherChannelSmsLiveBookingEnable,
  singleOtherChannelCustomLiveBookingEnable,
  singleOtherChannelWxLiveBooking,
} = storeDefinitionToRefs(useLiveBookingStore);

const { submitLiveBookingOfCustom, cancelLiveBookingOfCustom, patchSroreOfCustom } =
  useLiveBookingCustom({
    otherChannelId: props.channelId,
    singleMode: true,
  });

const isLiveBooking = computed(() => {
  if (unref(props.isOtherLive)) {
    return unref(isOtherLiveBooking);
  }
  return unref(isNormalLiveBooking) || unref(isCustomLiveBooking);
});

const useWxBooking = computed(() => {
  if (unref(props.isOtherLive)) {
    return unref(useSingleWxBooking);
  }

  return unref(normalUseWxBooking);
});

const useSmsLiveBooking = computed(() => {
  if (unref(props.isOtherLive)) {
    return unref(singleOtherChannelSmsLiveBookingEnable);
  }

  return unref(useSmsBooking);
});

const wxBookingCount = computed(() => {
  if (unref(props.isOtherLive)) {
    return unref(singleOtherChannelBookingConfig.value?.wxBookingCount);
  }
  return unref(normalWxBookingCount);
});

/** 按钮尺寸 */
const buttonSize = computed(() => {
  if (unref(buttonPosition) === 'corner') {
    return ButtonSize.XMini;
  }
  if (unref(buttonPosition) === 'splash') {
    return ButtonSize.Mini;
  }
  return ButtonSize.Default;
});

const innerButtonType = computed(() => {
  if (isLiveBooking.value) {
    return ButtonType.Gray;
  }
  return props.buttonType;
});

/** 按钮文本 */
const buttonText = computed(() => {
  if (unref(isLiveBooking)) {
    return translate('liveBooking.booked');
  }

  let text = translate('liveBooking.bookLive');

  switch (unref(buttonPosition)) {
    case 'splash':
      text = translate('liveBooking.book');
      break;
    case 'player':
      text = translate('liveBooking.bookLive');
      break;
    case 'corner':
      text = translate('liveBooking.book');
      break;
  }

  return text;
});

/** 是否展示预约人数 */
const isShowBookingCount = computed(() => {
  if (unref(buttonPosition) === 'corner') return false;

  return unref(useWxBooking) && unref(wxBookingCountVisible);
});

/** 预约表单组件实例 */
const bookingFormRef = ref<LiveBookingFormInstance>();

/** 取消预约提示弹层实例 */
const bookingCancelTipsRef = ref<MessageBoxInstance>();

/**
 * 仅启用“自定义预约”模式
 */
const isOnlyCustom = () => {
  let onlyCustom = false;
  // 其他频道预约
  if (unref(props.isOtherLive)) {
    onlyCustom =
      !unref(singleOtherChannelSmsLiveBookingEnable) &&
      unref(singleOtherChannelCustomLiveBookingEnable) &&
      !unref(useSingleWxBooking);
  } else {
    onlyCustom = unref(useCustomBooking) && !unref(useSmsLiveBooking) && !unref(useWxBooking);
  }

  return onlyCustom;
};

/** 执行预约逻辑 */
const toBooking = () => {
  const onlyCustom = isOnlyCustom();
  const smsEnabled = unref(useSmsLiveBooking);
  const wxEnabled = unref(useWxBooking);

  // 当只有自定义预约时，执行自定义预约
  if (onlyCustom) {
    submitLiveBookingOfCustom();
    return;
  }

  if (wxEnabled) {
    onClickWxButton();
    return;
  }

  if (smsEnabled) {
    onClickSmsButton();
  }
};

/** 处理按钮点击 */
// eslint-disable-next-line sonarjs/cognitive-complexity
const onClickButton = debounce(async () => {
  const booked = unref(isLiveBooking);

  const smsBooking = unref(isSmsLiveBooking);
  const wxBooking = unref(isWxLiveBooking);
  const otherSmsBooked = unref(singleOtherChannelSmsLiveBooking);
  const otherCustomBooked = unref(singleOtherChannelCustomLiveBooking);
  const otherWxBooked = unref(singleOtherChannelWxLiveBooking);
  const smsInstance = unref(bookingFormRef);
  // 当已经存在预约时，按照预约类型取消
  if (booked) {
    if (otherWxBooked) {
      const res = await bookingCancelTipsRef.value?.$confirm();
      if (res) {
        trackUserReservationLive({ reservationType: 'official_account' });
        await wxCancelLiveBooking();
        otherSmsBooked && (await smsInstance?.cancelLiveBooking());
        otherCustomBooked && patchSroreOfCustom(false);
      }
      return;
    }
    // 其他频道预约 取消预约
    if (otherSmsBooked) {
      const res = await bookingCancelTipsRef.value?.$confirm();
      if (res) {
        await smsInstance?.cancelLiveBooking();
        otherCustomBooked && patchSroreOfCustom(false);
      }
      return;
    }
    if (otherCustomBooked) {
      const res = await bookingCancelTipsRef.value?.$confirm();
      if (res) {
        await cancelLiveBookingOfCustom();
      }
      return;
    }
    // 正常频道预约 取消预约
    if (wxBooking) {
      const res = await bookingCancelTipsRef.value?.$confirm();
      if (res) {
        trackUserReservationLive({ reservationType: 'official_account' });
        await wxCancelLiveBooking();
        smsBooking && (await smsInstance?.cancelLiveBooking());
        useCustomBooking.value && patchSroreOfCustom(false);
      }
      return;
    }
    if (smsBooking) {
      const res = await bookingCancelTipsRef.value?.$confirm();
      if (res) {
        await smsInstance?.cancelLiveBooking();
        useCustomBooking.value && patchSroreOfCustom(false);
      }
      return;
    }
    const res = await bookingCancelTipsRef.value?.$confirm();
    if (res) {
      await cancelLiveBookingOfCustom();
    }
    return;
  }

  toBooking();
}, 300);

/** 处理微信预约点击 */
async function onClickWxButton() {
  trackUserReservationLive({ reservationType: 'official_account' });
  await wxSubmitLiveBooking();
}

onMounted(() => {
  // 自动打开预约弹窗
  if (!isLiveBooking.value) {
    const cache = getLiveBookingCache();
    if (!cache.needAutoOpenBooking) return;

    setLiveBookingCache({
      needAutoOpenBooking: false,
    });

    toBooking();
  }
});

/** 处理短信预约点击 */
async function onClickSmsButton() {
  const instance = unref(bookingFormRef);

  trackUserReservationLive({ reservationType: 'code' });
  instance?.openBookingForm();
}
</script>

<style lang="scss">
.c-mobile-live-booking-button__text {
  margin-bottom: 6px;
  font-size: 12px;
  line-height: 18px;
  text-align: right;
}
.c-mobile-live-booking-button__button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.c-mobile-live-booking-button__button__top {
  display: flex;
  align-items: center;

  .c-mobile-live-booking-button__button__top__icon {
    display: flex;
    margin-right: 4px;
    font-size: 16px !important;
  }
}

.c-mobile-live-booking-button__button__bottom {
  margin-bottom: -3px;
  font-size: 12px;
  transform: scale(0.83);
}

.c-mobile-live-booking-button__button__icon {
  margin-right: 4px;
  font-size: 16px !important;
}

.c-mobile-live-booking-button--splash {
  .c-mobile-live-booking-button__button {
    min-width: 80px;
    padding: 0;
  }
}

.c-mobile-live-booking-button--player {
  .c-mobile-live-booking-button__button {
    width: 224px;
  }
}

.c-mobile-live-booking-button--corner {
  .c-mobile-live-booking-button__button {
    min-width: 60px;
    white-space: nowrap;
  }
}

.c-mobile-live-booking-button--other-live {
  .c-mobile-live-booking-button__button {
    width: auto;
    font-size: 14px;
    font-weight: 500;
    line-height: 25px;
    color: #3f76fc;
    background-color: transparent !important;
  }

  .c-mobile-live-booking-button__button__top__icon {
    font-size: 20px !important;
    line-height: 15px;
  }
}
</style>
