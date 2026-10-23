import { ynToBool } from '@polyv/utils/boolean';
import { computed } from 'vue';
import { AuthInfoType, YN } from '@polyv/live-watch-sdk';
import { useAuthStore } from '@/store/use-auth-store';

export const useAuthInfoSetting = () => {
  const authStore = useAuthStore();

  /**
   * 是否需要短信验证
   */
  const smsVerifyEnabled = computed<boolean>(() => {
    let enabled = false;
    authStore.authInfoFields.forEach(option => {
      if (option.type === AuthInfoType.Mobile) {
        enabled = ynToBool(option.sms, YN.N);
      }
    });
    return enabled;
  });

  /**
   * 是否具有手机选项
   */
  const hasMobileField = computed<boolean>(() => {
    return authStore.authInfoFields.findIndex(option => option.type === AuthInfoType.Mobile) !== -1;
  });

  return {
    smsVerifyEnabled,
    hasMobileField,
  };
};
