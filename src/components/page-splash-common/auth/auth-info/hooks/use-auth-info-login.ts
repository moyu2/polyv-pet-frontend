import { translate } from '@/assets/lang';
import { validatePhoneNumber } from '@/assets/utils/validate';
import { emitFunc, VueEmit } from '@polyv/vue-components';
import { useToastManager } from '@/hooks/components/use-toast';
import { ValidatorRules } from '@/plugins/async-validator';
import { AuthInfoType } from '@polyv/live-watch-sdk';
import { computed, reactive } from 'vue';
import { useAuthCommon } from '../../hooks/use-auth-common';
import { useGlobalInject } from '@/app/use-global-inject';

export const authInfoLoginEmits = () => ({
  /** 关闭窗口 */
  'close-dialog': emitFunc<void>(),
});

interface AuthInfoLoginFormData {
  /** 手机号 */
  phoneNumber: string;
  /** 手机区号 */
  areaCode: string;
}

export const useAuthInfoLogin = (options: { emit: VueEmit<typeof authInfoLoginEmits> }) => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const { emit } = options;

  function generateFromData(): AuthInfoLoginFormData {
    return {
      // 手机号
      phoneNumber: '',
      // 手机区号
      areaCode: '+86',
    };
  }

  const formData = reactive<AuthInfoLoginFormData>(generateFromData());

  const formRules = computed<ValidatorRules>(() => {
    const rules: ValidatorRules = {
      phoneNumber: [
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
      ],
    };

    return rules;
  });

  const { failMessage, handleAuthVerifySuccess, handleAuthVerifyFail } = useAuthCommon();

  async function submitAuthLogin() {
    const watchCore = getWatchCore();

    const result = await watchCore.auth.loginInfoAuth({
      phoneNumber: formData.phoneNumber,
      areaCode: formData.areaCode,
    });

    if (result.success) {
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

  return {
    formData,
    formRules,
    AuthInfoType,

    onClickCancel,
    submitAuthLogin,
  };
};
