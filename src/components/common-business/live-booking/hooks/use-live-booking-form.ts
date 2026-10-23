/**
 * @file （短信）直播预约表单 hook
 */
import { translate } from '@/assets/lang';
import { validatePhoneNumber } from '@/assets/utils/validate';
import { useToastManager } from '@/hooks/components/use-toast';
import type { ValidatorRules } from '@/plugins/async-validator';
import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { computed, nextTick, reactive, ref, watch } from 'vue';
import type { LiveBookingFormInstance } from '../types';
import { useLiveBookingFail } from './use-live-booking-fail';
import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';
import { useGlobalInject } from '@/app/use-global-inject';
import { useLiveBookingCache } from '@/hooks/business/use-live-booking-cache/use-live-booking-cache';
import type { FormSubmitButtonInstance } from '@/components/common-base/form/hooks/use-form-submit-button';
import { useLiveBookingPhone } from './use-live-booking-phone';

export interface UseLiveBookingFormOptions {
  otherChannelId?: string;
  sessionId?: string;
  smsBookingChangeHandler?: (isBooked: boolean) => void;
}

export const useLiveBookingForm = (options: UseLiveBookingFormOptions = {}) => {
  const { otherChannelId, sessionId, smsBookingChangeHandler } = options;

  const { getWatchCore } = useGlobalInject();

  const { setLiveBookingCache, clearLiveBookingCache } = useLiveBookingCache();

  const { toast } = useToastManager();
  const { toastBookingFail } = useLiveBookingFail();

  const liveBookingStore = useLiveBookingStore();
  const { getDefaultLiveBookingPhone } = useLiveBookingPhone();

  const formSubmitRef = ref<FormSubmitButtonInstance | undefined>();

  /** 直播预约表单数据 */
  const bookingFormData = reactive({
    // 手机号
    phoneNumber: '',
    // 手机区号
    areaCode: '+86',
    // 短信验证码
    verifyCode: '',
  });

  /** 是否启用短信验证 */
  const smsEnabled = ref(true);
  const trustedPhoneKey = ref('');

  function getPhoneKey(phoneNumber: string, areaCode: string) {
    return `${areaCode}_${phoneNumber}`;
  }

  const initSmsEnabled = () => {
    const currentPhoneKey = getPhoneKey(bookingFormData.phoneNumber, bookingFormData.areaCode);
    smsEnabled.value = !trustedPhoneKey.value || currentPhoneKey !== trustedPhoneKey.value;
  };

  watch(
    () => getPhoneKey(bookingFormData.phoneNumber, bookingFormData.areaCode),
    (newValue, oldValue) => {
      if (oldValue && newValue !== oldValue) {
        initSmsEnabled();
      }
    },
  );

  /** 直播预约表单验证规则 */
  const bookingFormRules = computed<ValidatorRules>(() => {
    return {
      phoneNumber: [
        { type: 'string', message: translate('form.error.phoneNumberRequired'), required: true },
        {
          validator: () => {
            const { phoneNumber, areaCode } = bookingFormData;

            if (validatePhoneNumber(phoneNumber, areaCode)) {
              return [];
            }

            return [translate('form.error.phoneNumberError')];
          },
        },
      ],
      verifyCode: [
        {
          type: 'string',
          message: translate('form.error.smsVerifyRequired'),
          required: smsEnabled.value,
        },
      ],
    };
  });

  /** 预约表单是否显示 */
  const bookingFormVisible = ref(false);

  /** 打开弹层 */
  async function openBookingForm() {
    const defaultPhone = await getDefaultLiveBookingPhone();

    bookingFormData.phoneNumber = defaultPhone.phoneNumber;
    bookingFormData.areaCode = defaultPhone.areaCode;
    bookingFormData.verifyCode = '';
    trustedPhoneKey.value = defaultPhone.trusted
      ? getPhoneKey(defaultPhone.phoneNumber, defaultPhone.areaCode)
      : '';
    initSmsEnabled();

    formSubmitRef.value?.checkDisabled();
    nextTick(() => {
      bookingFormVisible.value = true;
    });
  }

  const { trackUserConfirmReservationLive } = useWatchEventTrack();

  /** 提交直播预约表单 */
  async function submitLiveBookingForm() {
    trackUserConfirmReservationLive({ reservationType: 'code' });

    const watchCore = getWatchCore();
    // 当存在自定义预约+短信预约时，在短信提醒成功后，后端会自动调用自定义预约接口，所以这里不需要再调用一次
    const result = await watchCore.liveBooking.submitSmsLiveBooking({
      phoneNumber: bookingFormData.phoneNumber,
      areaCode: bookingFormData.areaCode,
      verifyCode: smsEnabled.value ? bookingFormData.verifyCode : undefined,
      otherChannelId, // 其他频道预约时，需要传入 channelId
      sessionId,
    });

    if (result.success) {
      setLiveBookingCache({
        phoneNumber: bookingFormData.phoneNumber,
        areaCode: bookingFormData.areaCode,
        smsVerified: true,
      });

      toast.success(translate('liveBooking.bookingSuccess'));

      // 预约下一场其他直播的处理
      if (sessionId) {
        smsBookingChangeHandler?.(true);
      } else if (otherChannelId) {
        liveBookingStore.$patch({
          singleOtherChannelBookingConfig: {
            isSmsLiveBooking: true,
          },
        });
      } else {
        liveBookingStore.$patch({
          isSmsLiveBooking: true,
        });
      }

      bookingFormVisible.value = false;
    } else {
      toastBookingFail(result.failReason);
      setLiveBookingCache({ smsVerified: false });
      trustedPhoneKey.value = '';
      initSmsEnabled();
    }
  }

  /** 取消预约 */
  async function cancelLiveBooking() {
    const liveBookingPhone = bookingFormData.phoneNumber
      ? bookingFormData
      : await getDefaultLiveBookingPhone();
    const watchCore = getWatchCore();
    // 当存在自定义预约+短信预约时，在短信提醒成功后，后端会自动调用自定义预约接口，所以这里不需要再调用一次
    const result = await watchCore.liveBooking.cancelSmsLiveBooking({
      phoneNumber: liveBookingPhone.phoneNumber,
      areaCode: liveBookingPhone.areaCode,
      ...(otherChannelId ? { otherChannelId } : {}),
      sessionId,
    });

    if (result.success) {
      if (!sessionId) {
        clearLiveBookingCache();
      }

      toast.success(translate('liveBooking.cancelSuccess'));

      if (sessionId) {
        smsBookingChangeHandler?.(false);
      } else if (otherChannelId) {
        liveBookingStore.$patch({
          singleOtherChannelBookingConfig: {
            isSmsLiveBooking: false,
          },
        });
      } else {
        liveBookingStore.$patch({
          isSmsLiveBooking: false,
        });
      }
    } else {
      toastBookingFail(result.failReason);
    }
  }

  const liveBookingFormInstance: LiveBookingFormInstance = {
    openBookingForm,
    submitLiveBookingForm,
    cancelLiveBooking,
  };

  return {
    formSubmitRef,
    smsEnabled,
    bookingFormData,
    bookingFormRules,
    bookingFormVisible,
    openBookingForm,
    submitLiveBookingForm,
    cancelLiveBooking,
    liveBookingFormInstance,
  };
};
