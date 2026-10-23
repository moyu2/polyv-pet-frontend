<template>
  <div
    v-if="bookingVisible"
    class="c-session-list-booking-button"
    @click.stop
  >
    <pwc-button
      :class="[skinColorIgnoreClass, { 'c-session-list-booking-button__button--mobile': isMobile }]"
      :type="isBooked ? 'ordinary' : 'primary'"
      size="mini"
      outline
      :min-width="isMobile ? 62 : 68"
      :disabled="pending"
      @click="onClickButton"
    >
      {{ buttonText }}
    </pwc-button>

    <mobile-live-booking-form-popup
      v-if="isMobile"
      ref="bookingFormRef"
      :session-id="sessionData.sessionId"
      :sms-booking-change-handler="onSmsBookingChange"
    />
    <pc-live-booking-form-dialog
      v-else
      ref="bookingFormRef"
      :session-id="sessionData.sessionId"
      :sms-booking-change-handler="onSmsBookingChange"
    />

    <mobile-live-booking-subscribe-popup
      v-if="isMobile"
      ref="subscribeRef"
    />

    <mobile-message-box
      v-if="isMobile"
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
import { computed, ref, unref } from 'vue';

import type { ChannelSessionDataItem } from '@polyv/live-watch-sdk';
import { ChannelSessionStatus } from '@polyv/live-watch-sdk';
import { PropUtils, PwcButton, emitFunc, useSkinColorIgnore } from '@polyv/vue-components';

import { useGlobalInject } from '@/app/use-global-inject';
import { MobileMessageBox } from '@/components/common-base/message-box';
import type { MessageBoxInstance } from '@/components/common-base/message-box';
import MobileLiveBookingFormPopup from '@/components/common-business/live-booking/mobile-live-booking-form-popup.vue';
import PcLiveBookingFormDialog from '@/components/common-business/live-booking/pc-live-booking-form-dialog.vue';
import MobileLiveBookingSubscribePopup from '@/components/common-business/live-booking/mobile-live-booking-subscribe-popup.vue';
import type {
  LiveBookingFormInstance,
  SubscribeInstance,
} from '@/components/common-business/live-booking/types';
import { useLiveBookingFail } from '@/components/common-business/live-booking/hooks/use-live-booking-fail';
import { useLiveBookingPhone } from '@/components/common-business/live-booking/hooks/use-live-booking-phone';
import { useToastManager } from '@/hooks/components/use-toast';
import { translate } from '@/assets/lang';
import { isMobile } from '@/assets/utils/browser';
import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';
import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import type { SessionBookingChangeData } from './type';

type SessionBookingType = 'sms' | 'wx' | 'custom';
interface LiveBookingOperateOptions {
  showSuccessToast?: boolean;
}

const props = defineProps({
  /** 场次数据 */
  sessionData: PropUtils.object<ChannelSessionDataItem>().isRequired,
});

const emits = defineEmits({
  'booking-change': emitFunc<SessionBookingChangeData>(),
});

const { getWatchCore } = useGlobalInject();

const {
  useSmsBooking: channelSmsBookingEnabled,
  useWxBooking: channelWxBookingEnabled,
  useCustomBooking: channelCustomBookingEnabled,
} = storeDefinitionToRefs(useLiveBookingStore);

const { getDefaultLiveBookingPhone } = useLiveBookingPhone();
const { toastBookingFail } = useLiveBookingFail();
const { toast } = useToastManager();
const { trackUserReservationLive } = useWatchEventTrack();
const { skinColorIgnoreClass } = useSkinColorIgnore();

const bookingFormRef = ref<LiveBookingFormInstance>();
const subscribeRef = ref<SubscribeInstance>();
const bookingCancelTipsRef = ref<MessageBoxInstance>();

const pending = ref(false);

function isBookingFieldEnabled(value: boolean | null | undefined) {
  return value !== null && typeof value !== 'undefined';
}

const smsBookingEnabled = computed(
  () => unref(channelSmsBookingEnabled) && isBookingFieldEnabled(props.sessionData.smsBooked),
);
const wxBookingEnabled = computed(
  () => unref(channelWxBookingEnabled) && isBookingFieldEnabled(props.sessionData.wxBooked),
);
const customBookingEnabled = computed(
  () => unref(channelCustomBookingEnabled) && isBookingFieldEnabled(props.sessionData.customBooked),
);

const isBooked = computed(() => {
  return (
    (unref(wxBookingEnabled) && props.sessionData.wxBooked === true) ||
    (unref(smsBookingEnabled) && props.sessionData.smsBooked === true) ||
    (unref(customBookingEnabled) && props.sessionData.customBooked === true)
  );
});

const bookingVisible = computed(() => {
  // 以当前列表项的实际状态为准，提前开播后不再显示本场预约入口。
  if (props.sessionData.status !== ChannelSessionStatus.UnStart) return false;

  return (
    unref(isBooked) ||
    unref(wxBookingEnabled) ||
    unref(smsBookingEnabled) ||
    unref(customBookingEnabled)
  );
});

const buttonText = computed(() => {
  return unref(isBooked) ? translate('liveBooking.booked') : translate('liveBooking.book');
});

function emitBookingChange(data: Omit<SessionBookingChangeData, 'sessionId'>) {
  emits('booking-change', {
    sessionId: props.sessionData.sessionId,
    ...data,
  });
}

function onSmsBookingChange(isBooked: boolean) {
  emitBookingChange({
    smsBooked: isBooked,
  });
}

function getSubmitBookingType(): SessionBookingType | undefined {
  if (unref(wxBookingEnabled)) return 'wx';
  if (unref(smsBookingEnabled)) return 'sms';
  if (unref(customBookingEnabled)) return 'custom';
}

function getCancelBookingTypes(): SessionBookingType[] {
  const types: SessionBookingType[] = [];

  if (unref(smsBookingEnabled) && props.sessionData.smsBooked === true) {
    types.push('sms');
  }
  if (unref(wxBookingEnabled) && props.sessionData.wxBooked === true) {
    types.push('wx');
  }
  if (!types.length && unref(customBookingEnabled) && props.sessionData.customBooked === true) {
    types.push('custom');
  }

  return types;
}

function patchCancelBookingType(type: SessionBookingType) {
  const data: Omit<SessionBookingChangeData, 'sessionId'> = {};

  if (type === 'wx') {
    data.wxBooked = false;
  }
  if (type === 'sms') {
    data.smsBooked = false;
  }
  if (type === 'custom') {
    data.customBooked = false;
  }

  if ((type === 'wx' || type === 'sms') && props.sessionData.customBooked === true) {
    data.customBooked = false;
  }

  emitBookingChange(data);
}

async function submitSmsBooking() {
  trackUserReservationLive({ reservationType: 'code' });

  await bookingFormRef.value?.openBookingForm();
}

async function submitWxBooking() {
  trackUserReservationLive({ reservationType: 'official_account' });

  const watchCore = getWatchCore();
  const result = await watchCore.liveBooking.submitWxLiveBooking({
    sessionId: props.sessionData.sessionId,
  });

  if (result.success) {
    emitBookingChange({
      wxBooked: true,
    });

    if (result.wxOfficialAccountQRCodeUrl) {
      subscribeRef.value?.openPopup(result.wxOfficialAccountQRCodeUrl);
    }
    return;
  }

  toastBookingFail(result.failReason);
}

async function submitCustomBooking() {
  const watchCore = getWatchCore();
  const result = await watchCore.liveBooking.submitCustomLiveBooking({
    sessionId: props.sessionData.sessionId,
  });

  if (result.success) {
    toast.success(translate('liveBooking.bookingSuccess'));
    emitBookingChange({
      customBooked: true,
    });
    return;
  }

  toast.error(translate('liveBooking.fail'));
}

async function submitBooking() {
  const bookingType = getSubmitBookingType();

  if (bookingType === 'wx') {
    await submitWxBooking();
    return;
  }

  if (bookingType === 'sms') {
    await submitSmsBooking();
    return;
  }

  if (bookingType === 'custom') {
    await submitCustomBooking();
  }
}

async function cancelSmsBooking(options: LiveBookingOperateOptions = {}): Promise<boolean> {
  trackUserReservationLive({ reservationType: 'code' });

  const liveBookingPhone = await getDefaultLiveBookingPhone();
  const hasPhoneNumber = !!liveBookingPhone.phoneNumber;
  const watchCore = getWatchCore();
  const result = await watchCore.liveBooking.cancelSmsLiveBooking({
    sessionId: props.sessionData.sessionId,
    phoneNumber: hasPhoneNumber ? liveBookingPhone.phoneNumber : undefined,
    areaCode: hasPhoneNumber ? liveBookingPhone.areaCode : undefined,
  });

  if (result.success) {
    if (options.showSuccessToast !== false) {
      toast.success(translate('liveBooking.cancelSuccess'));
    }
    patchCancelBookingType('sms');
    return true;
  }

  toastBookingFail(result.failReason);
  return false;
}

async function cancelWxBooking(options: LiveBookingOperateOptions = {}): Promise<boolean> {
  trackUserReservationLive({ reservationType: 'official_account' });

  const watchCore = getWatchCore();
  const result = await watchCore.liveBooking.cancelWxLiveBooking({
    sessionId: props.sessionData.sessionId,
  });

  if (result.success) {
    if (options.showSuccessToast !== false) {
      toast.success(translate('liveBooking.cancelSuccess'));
    }
    patchCancelBookingType('wx');
    return true;
  }

  toastBookingFail(result.failReason);
  return false;
}

async function cancelCustomBooking(options: LiveBookingOperateOptions = {}): Promise<boolean> {
  const watchCore = getWatchCore();
  const result = await watchCore.liveBooking.cancelCustomLiveBooking({
    sessionId: props.sessionData.sessionId,
  });

  if (result.success) {
    if (options.showSuccessToast !== false) {
      toast.success(translate('liveBooking.cancelSuccess'));
    }
    patchCancelBookingType('custom');
    return true;
  }

  toast.error(translate('liveBooking.fail'));
  return false;
}

async function cancelBooking() {
  const bookingTypes = getCancelBookingTypes();
  const showSuccessToast = bookingTypes.length === 1;
  let hasSuccess = false;

  if (bookingTypes.includes('sms')) {
    hasSuccess = (await cancelSmsBooking({ showSuccessToast })) || hasSuccess;
  }

  if (bookingTypes.includes('wx')) {
    hasSuccess = (await cancelWxBooking({ showSuccessToast })) || hasSuccess;
  }

  if (bookingTypes.includes('custom')) {
    hasSuccess = (await cancelCustomBooking({ showSuccessToast })) || hasSuccess;
  }

  if (!showSuccessToast && hasSuccess) {
    toast.success(translate('liveBooking.cancelSuccess'));
  }
}

async function onClickButton() {
  if (pending.value) return;

  try {
    pending.value = true;

    if (unref(isBooked)) {
      if (isMobile) {
        const confirm = await bookingCancelTipsRef.value?.$confirm();
        if (!confirm) return;
      }

      await cancelBooking();
      return;
    }

    await submitBooking();
  } finally {
    pending.value = false;
  }
}
</script>

<style lang="scss">
.c-session-list-booking-button {
  flex-shrink: 0;
}

button.pwc-button.is-size-mini.c-session-list-booking-button__button--mobile {
  padding: 0 12px;
  font-size: 12px;
}
</style>
