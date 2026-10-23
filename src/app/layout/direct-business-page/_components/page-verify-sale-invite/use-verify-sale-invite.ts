import { computed, reactive, ref } from 'vue';
import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';
import { ValidatorRules } from '@/plugins/async-validator';
import { validatePhoneNumber } from '@/assets/utils/validate';
import { InviteCustomerCollectType } from '@polyv/live-watch-sdk';
import { useGlobalInject } from '@/app/use-global-inject';

/**
 * 一客一码表单逻辑
 * @hook
 */
export const useVerifySaleInvite = () => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const watchCore = getWatchCore();

  const saleInviteVerifySmsEnabled = ref(watchCore.saleInvite.getSaleInviteVerifySmsEnabled());

  const collectSetting = watchCore.saleInvite.getInviteCustomerCollectSetting();

  const formData = reactive({
    phoneNumber: '',
    areaCode: '+86',
    smsCode: '',
    username: '',
    address: '',
    corpName: '',
    position: '',
    email: '',
  });

  const formRules = computed<ValidatorRules>(() => {
    const rules: ValidatorRules = {};

    // 手机号规则
    rules.phoneNumber = [
      {
        type: 'string',
        message: translate('form.error.phoneNumberRequired'),
        required: true,
      },
      {
        validator: () => {
          const phoneNumber = formData.phoneNumber;
          const areaCode = formData.areaCode;

          if (validatePhoneNumber(phoneNumber, areaCode)) {
            return [];
          }

          return [translate('form.error.phoneNumberError')];
        },
      },
    ];

    // 短信验证码规则
    if (saleInviteVerifySmsEnabled.value) {
      rules.smsCode = [
        {
          type: 'string',
          message: translate('form.error.smsVerifyRequired'),
          required: true,
        },
      ];
    }

    collectSetting.fieldList.forEach(item => {
      if (item.required) {
        rules[item.type] = [
          {
            type: 'string',
            message: getTranslateByType(item.type).placeholder,
            required: true,
          },
        ];
      }
    });

    return rules;
  });

  /**
   * 根据类型获取占位符
   */
  function getTranslateByType(type: InviteCustomerCollectType): {
    label: string;
    placeholder: string;
  } {
    const placeholders: Record<InviteCustomerCollectType, { label: string; placeholder: string }> =
      {
        [InviteCustomerCollectType.UserName]: {
          label: translate('saleInvite.username'),
          placeholder: translate('form.placeholder.contacts'),
        },
        [InviteCustomerCollectType.Position]: {
          label: translate('saleInvite.position'),
          placeholder: translate('form.placeholder.position'),
        },
        [InviteCustomerCollectType.CorpName]: {
          label: translate('saleInvite.corpName'),
          placeholder: translate('form.placeholder.corpName'),
        },
        [InviteCustomerCollectType.Address]: {
          label: translate('saleInvite.address'),
          placeholder: translate('form.placeholder.address'),
        },
        [InviteCustomerCollectType.Email]: {
          label: translate('saleInvite.email'),
          placeholder: translate('form.placeholder.email'),
        },
      };

    return (
      placeholders[type] || {
        label: '',
        placeholder: translate('form.error.improveInfo'),
      }
    );
  }

  async function submitForm() {
    const verifyResult = await watchCore.saleInvite.verifySaleInviteAuth({
      ...formData,
    });

    if (!verifyResult.success) {
      console.error(verifyResult.failReason, verifyResult.failMessage);
      toast.error(verifyResult.failMessage || translate('base.error.unknown'));
      return;
    }

    // 成功提交后刷新当前页面即可
    window.location.reload();
  }

  return {
    saleInviteVerifySmsEnabled,
    collectSetting,

    formData,
    formRules,
    getTranslateByType,
    submitForm,
  };
};
