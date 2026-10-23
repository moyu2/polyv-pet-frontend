import { SmsValidType } from '@polyv/live-watch-sdk';
import { computed, ref } from 'vue';

import { useChannelStore } from '@/store/use-channel-store';
import { ImageVerifyInputInstance } from '@/components/common-base/form/form-image-verify-input/type';
import { useAuthInfoSetting } from './use-auth-info-setting';

/**
 * 登记观看-短信逻辑
 */
export const useAuthInfoSms = () => {
  const channelStore = useChannelStore();
  const { smsVerifyEnabled } = useAuthInfoSetting();

  /** 图片验证码实例 */
  const imageVerifyInputRef = ref<ImageVerifyInputInstance>();

  /** 短信校验类型 */
  const smsValidType = computed(() => {
    return channelStore.smsConfig.smsImageCaptchaEnabled ? SmsValidType.Image : SmsValidType.None;
  });

  /** 是否使用图片验证码组件 */
  const imageVerifyInputEnabled = computed(() => {
    return smsValidType.value === SmsValidType.Image && smsVerifyEnabled.value;
  });

  return {
    imageVerifyInputRef,
    smsValidType,
    imageVerifyInputEnabled,
  };
};
