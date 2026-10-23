import { SmsValidType } from '@polyv/live-watch-sdk';
import { computed, ref } from 'vue';

import { useChannelStore } from '@/store/use-channel-store';
import { useEnrollStore } from '@/store/use-enroll-store';
import { ImageVerifyInputInstance } from '@/components/common-base/form/form-image-verify-input/type';

/**
 * 报名观看-短信逻辑
 */
export const useEnrollSms = () => {
  const channelStore = useChannelStore();
  const enrollStore = useEnrollStore();

  /** 图片验证码实例 */
  const imageVerifyInputRef = ref<ImageVerifyInputInstance>();

  /** 短信校验类型 */
  const smsValidType = computed(() => {
    return channelStore.smsConfig.smsImageCaptchaEnabled ? SmsValidType.Image : SmsValidType.None;
  });

  /** 是否使用图片验证码组件 */
  const imageVerifyInputEnabled = computed(() => {
    return smsValidType.value === SmsValidType.Image && enrollStore.smsVerifyEnabled;
  });

  return {
    imageVerifyInputRef,
    smsValidType,
    imageVerifyInputEnabled,
  };
};
