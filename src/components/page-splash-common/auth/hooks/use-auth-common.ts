import { translate } from '@/assets/lang';
import { wait } from '@/assets/utils/utils';
import { ValidatorRules } from '@/plugins/async-validator';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import {
  AuthSettingItem,
  AuthVerifyError,
  AuthVerifyResultFail,
  AuthVerifyResultSuccess,
  YN,
} from '@polyv/live-watch-sdk';
import { ynToBool } from '@polyv/utils/boolean';
import { computed, ref, unref } from 'vue';

export interface AuthProtocolFormData {
  /** 是否勾选了隐私声明 */
  checkProtocol: boolean;
}

export interface UseAuthProtocolOptions {
  getAuthItem: () => AuthSettingItem;
  formData: AuthProtocolFormData;
}

/**
 * 观看条件隐私协议 hook
 */
export const useAuthProtocol = (options: UseAuthProtocolOptions) => {
  const { getAuthItem, formData } = options;

  /** 隐私协议内容 */
  const protocolContent = computed(() => {
    let privacyStatus = YN.N;
    let privacyContent = '';

    const authItem = getAuthItem();
    if ('privacyStatus' in authItem && authItem.privacyStatus) {
      privacyStatus = authItem.privacyStatus;
    }
    if ('privacyContent' in authItem && authItem.privacyContent) {
      privacyContent = authItem.privacyContent;
    }

    if (!ynToBool(privacyStatus)) {
      return '';
    }

    return privacyContent;
  });

  /** 隐私协议表单验证规则 */
  const protocolFormRules = computed<ValidatorRules>(() => {
    return {
      checkProtocol: {
        validator: () => {
          if (unref(protocolContent) && !formData.checkProtocol) {
            return [translate('auth.error.checkProtocol')];
          }
          return [];
        },
      },
    };
  });

  return {
    protocolContent,
    protocolFormRules,
  };
};

/**
 * 观看条件公用 hook
 */
export const useAuthCommon = () => {
  const watchAppStore = useWatchAppStore();

  /** 失败信息 */
  const failMessage = ref<string>();

  /** 获取默认的失败信息 */
  function getDefaultFailMessage() {
    return translate('auth.error.unknown');
  }

  /**
   * 处理观看条件验证成功
   * @param successResult 成功结果
   */
  async function handleAuthVerifySuccess(successResult: AuthVerifyResultSuccess): Promise<void> {
    if (!successResult.success) return;

    failMessage.value = undefined;
    await watchAppStore.resetUpWatchCore();
  }

  /**
   * 处理观看条件验证失败
   * @param failResult 失败结果
   */
  async function handleAuthVerifyFail(failResult: AuthVerifyResultFail): Promise<void> {
    failMessage.value = undefined;

    switch (failResult.failReason) {
      case AuthVerifyError.PhoneEmpty:
        failMessage.value = translate('auth.error.phoneEmpty');
        break;
      case AuthVerifyError.PhoneNotExist:
        failMessage.value = translate('auth.error.phoneNotExistent');
        break;
      case AuthVerifyError.PhoneUsed:
        failMessage.value = translate('auth.error.phoneUsed');
        break;
      case AuthVerifyError.CodeError:
        failMessage.value = translate('auth.error.codeError');
        break;
      case AuthVerifyError.CodeNeedVerify:
        failMessage.value = translate('auth.error.codeNeedVerify');
        break;
      case AuthVerifyError.SmsCodeError:
        failMessage.value = translate('auth.error.smsCodeError');
        break;
      case AuthVerifyError.PhoneNotRegister:
        failMessage.value = translate('auth.error.phoneNotRegister');
        break;
      case AuthVerifyError.RedirectUrl:
        if (failResult.getRedirectUrl) {
          const redirectUrl = failResult.getRedirectUrl();
          window.location.href = redirectUrl;
          await wait(1000); // 延迟 1s 是为了页面跳转时不出现其他 toast，后续优化
        }
        break;
      case AuthVerifyError.SystemException:
        failMessage.value = translate('auth.error.systemException');
        break;
      case AuthVerifyError.InvalidWatchAuth:
        failMessage.value = translate('auth.error.invalidWatchAuth');
        break;
      case AuthVerifyError.Unknown:
      default:
        failMessage.value = failResult.failMessage || getDefaultFailMessage();
        break;
    }
  }

  return {
    failMessage,
    getDefaultFailMessage,
    handleAuthVerifySuccess,
    handleAuthVerifyFail,
  };
};
