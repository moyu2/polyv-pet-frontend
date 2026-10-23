import { computed, reactive, unref } from 'vue';
import { storeToRefs } from 'pinia';
import {
  AuthInfoPropValKey,
  AuthInfoPropValType,
  AuthInfoType,
  AuthSettingItemInfo,
  YN,
} from '@polyv/live-watch-sdk';
import { ValidatorRules } from '@/plugins/async-validator';

import { translate } from '@/assets/lang';
import { validatePhoneNumber } from '@/assets/utils/validate';
import { emitFunc, VueEmit } from '@polyv/vue-components';

import { useAuthStore } from '@/store/use-auth-store';

import { SelectOptionItem } from '@/components/common-base/form/form-select/types/form-select-types';

import { useToastManager } from '@/hooks/components/use-toast';
import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';
import { useAuthButtonInject } from '@/components/page-splash-common/auth/hooks/use-auth-button';
import {
  useAuthCommon,
  useAuthProtocol,
} from '@/components/page-splash-common/auth/hooks/use-auth-common';
import { useAuthInfoSetting } from './use-auth-info-setting';
import { useAuthInfoSms } from './use-auth-info-sms';
import { useIdentityStore } from '@/store/use-identity-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { ynToBool } from '@polyv/utils/boolean';
import { useLiveBookingCache } from '@/hooks/business/use-live-booking-cache/use-live-booking-cache';

export const authInfoFormEmits = () => ({
  /** 关闭窗口 */
  'close-dialog': emitFunc<void>(),
  /** 点击了已登录 */
  'click-logined': emitFunc<void>(),
});

interface BasicFormData {
  /** 手机号 */
  phoneNumber: string;
  /** 手机区号 */
  areaCode: string;
  /** 图片验证码 */
  imageId: string;
  imageCaptcha: string;
  /** 短信验证码 */
  smsCode: string;
  /** 隐私协议勾选 */
  checkProtocol: boolean;
}

export interface AuthInfoFormInstance {
  /** 重置表单 */
  resetFormData(): void;
}

export const useAuthInfoForm = (options: { emit: VueEmit<typeof authInfoFormEmits> }) => {
  const { getWatchCore } = useGlobalInject();

  const { advanceSetLiveBookingCache } = useLiveBookingCache();

  const { toast } = useToastManager();

  const { emit } = options;

  const identityStore = useIdentityStore();

  const authStore = useAuthStore();
  const { computedAuthItem } = useAuthButtonInject<AuthSettingItemInfo>();
  const { smsVerifyEnabled, hasMobileField } = useAuthInfoSetting();

  const { authInfoFields } = storeToRefs(authStore);

  const { imageVerifyInputRef, imageVerifyInputEnabled, smsValidType } = useAuthInfoSms();

  /** 提示信息 */
  const infoDesc = computed(() => computedAuthItem.value.infoDesc);

  /** 格式化下拉选项 */
  function formatSelectOptions(options?: string): SelectOptionItem[] {
    if (!options) {
      return [];
    }

    const strs = options.split(',').filter(str => !!str);
    return strs.map<SelectOptionItem>(str => {
      return {
        label: str,
        value: str,
      };
    });
  }

  /** 是否显示登录入口 */
  const showLoginEnter = computed(() => {
    if (identityStore.identitySetting.watchUserSystemEnabled) {
      return false;
    }

    return unref(hasMobileField);
  });

  /** 表单字段前缀 */
  const fieldPrefix = 'propValue' as const;

  /**
   * 通过索引生成表单字段
   * @param index 索引，从 0 开始
   */
  function generateFormField(index: number): AuthInfoPropValKey {
    return `${fieldPrefix}${index + 1}`;
  }

  function generateFromData(): AuthInfoPropValType & BasicFormData {
    const phoneNumber = identityStore.identityUnionInfo?.phoneNumber || '';

    function getInitFormData() {
      const data: AuthInfoPropValType = {};

      unref(authInfoFields).forEach((option, index) => {
        if (option.type === AuthInfoType.Mobile) {
          data[generateFormField(index)] = phoneNumber;
        } else {
          data[generateFormField(index)] = '';
        }
      });

      return data;
    }

    return {
      ...getInitFormData(),
      // 手机号 - 优先使用 identityStore 中的手机号
      phoneNumber,
      // 手机区号
      areaCode: '+86',
      // 图片验证码 id
      imageId: '',
      // 图片验证码
      imageCaptcha: '',
      // 短信验证码
      smsCode: '',
      // 隐私协议勾选
      checkProtocol: false,
    };
  }

  const formData = reactive<AuthInfoPropValType & BasicFormData>(generateFromData());

  function resetFormData() {
    const generatedData = generateFromData();
    for (const i in formData) {
      const key = i as keyof AuthInfoPropValType;
      formData[key] = generatedData[key];
    }
  }

  function onPhoneNumberChange(phoneNumber: string) {
    formData.phoneNumber = phoneNumber;
  }

  const { protocolContent, protocolFormRules } = useAuthProtocol({
    getAuthItem: () => computedAuthItem.value,
    formData,
  });

  const formRules = computed<ValidatorRules>(() => {
    const rules: ValidatorRules = {
      ...unref(protocolFormRules),
    };

    unref(authInfoFields).forEach((option, index) => {
      const type = option.type;
      const field = generateFormField(index);

      switch (type) {
        case AuthInfoType.Name:
        case AuthInfoType.Text:
        case AuthInfoType.Option:
          rules[field] = [
            {
              type: 'string',
              message: translate('auth.error.improveInfo'),
              required: ynToBool(option.required, YN.Y),
            },
          ];
          break;
        case AuthInfoType.Number:
          rules[field] = [
            {
              validator: () => {
                const value = formData[field];

                // 非必填且值为空，则不进行验证
                if (!ynToBool(option.required, YN.Y) && !value) {
                  return [];
                }

                // 同时支持数字和字符串类型的值
                if ((typeof value === 'number' || typeof value === 'string') && value !== '') {
                  return [];
                }

                return [translate('auth.error.improveInfo')];
              },
            },
          ];
          break;
        case AuthInfoType.Mobile:
          rules[field] = [
            {
              type: 'string',
              message: translate('form.error.phoneNumberRequired'),
              required: ynToBool(option.required, YN.Y),
            },
            {
              validator: () => {
                const phoneNumber = formData[field];
                const areaCode = formData.areaCode;

                // 非必填且手机号为空，则不进行验证
                if (!ynToBool(option.required, YN.Y) && !phoneNumber) {
                  return [];
                }

                if (validatePhoneNumber(phoneNumber, areaCode)) {
                  return [];
                }

                return [translate('form.error.phoneNumberError')];
              },
            },
          ];
          if (unref(smsVerifyEnabled)) {
            rules.smsCode = [
              {
                type: 'string',
                message: translate('form.error.smsVerifyRequired'),
                required: true,
              },
            ];
          }
          break;
      }
    });

    return rules;
  });

  const { failMessage, handleAuthVerifySuccess, handleAuthVerifyFail } = useAuthCommon();

  const { trackUserRegisterApplication } = useWatchEventTrack();

  async function submitAuth() {
    const watchCore = getWatchCore();

    const formValues: string[] = [];
    unref(authInfoFields).forEach((option, index) => {
      const field = generateFormField(index);
      if (typeof formData[field] !== 'undefined') {
        formValues.push(formData[field]);
      }
    });

    trackUserRegisterApplication();

    const result = await watchCore.auth.verifyInfoAuth({
      phoneNumber: formData.phoneNumber,
      areaCode: formData.areaCode,
      smsCode: formData.smsCode,
      formValues,
    });

    if (result.success) {
      advanceSetLiveBookingCache({
        phoneNumber: formData.phoneNumber,
        areaCode: formData.areaCode,
        smsVerified: smsVerifyEnabled.value,
        needAutoOpenBooking: true,
      });

      handleAuthVerifySuccess(result);
    } else {
      handleAuthVerifyFail(result);

      if (failMessage.value) {
        toast.error(failMessage.value);
      }
    }
  }

  /** 处理点击取消 */
  function onClickCancel(): void {
    emit('close-dialog');
  }

  function onClickLogined() {
    emit('click-logined');
  }

  const authFormInstance: AuthInfoFormInstance = {
    resetFormData,
  };

  return {
    infoDesc,
    authInfoFields,
    imageVerifyInputRef,
    imageVerifyInputEnabled,
    smsValidType,
    AuthInfoType,
    fieldPrefix,
    formData,
    formRules,

    protocolContent,
    smsVerifyEnabled,
    authFormInstance,
    hasMobileField,
    showLoginEnter,

    onPhoneNumberChange,
    formatSelectOptions,
    onClickCancel,
    submitAuth,
    onClickLogined,
    generateFormField,
  };
};
