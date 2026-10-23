import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { LangType } from '@/assets/lang/lang-enum';
import { isMobile } from '@/assets/utils/browser';
import { validatePhoneNumber } from '@/assets/utils/validate';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { useToastManager } from '@/hooks/components/use-toast';
import { ValidatorRules } from '@/plugins/async-validator';
import { useLangStore } from '@/store/use-lang-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { RealNameFail } from '@polyv/live-watch-sdk';
import { computed, reactive, unref } from 'vue';

export const useRealNameAuth = () => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const langStore = useLangStore();
  const viewerStore = useViewerStore();
  const watchCore = getWatchCore();

  const { visible, setVisible } = useSimpleVisible(false);

  useEventBusListener(appEvents.global.OpenRealNameDialog, (visible = true) => {
    setVisible(visible);
  });

  /** 用户协议 */
  const userAgreement = computed(() => {
    /** 用户协议（中文版） */
    const userAgreementCn =
      'https://doc-oss.polyv.net/basic/%E7%94%A8%E6%88%B7%E5%8D%8F%E8%AE%AE.pdf';
    /** 用户协议（英文版） */
    const userAgreementEn = 'https://doc-oss.polyv.net/basic/User%20Agreement.pdf';

    const url = langStore.currentLang === LangType.ZH_CN ? userAgreementCn : userAgreementEn;

    if (isMobile) {
      return watchCore.utils.generatePdfPreviewUrl(url);
    }

    return url;
  });

  /** 隐私协议 */
  const policyAgreement = computed(() => {
    /** 隐私协议（中文版） */
    const policyAgreementCn =
      'https://doc-oss.polyv.net/basic/%E9%9A%90%E7%A7%81%E6%94%BF%E7%AD%96.pdf';
    /** 隐私协议（英文版） */
    const policyAgreementEn = 'https://doc-oss.polyv.net/basic/Privacy%20Policy.pdf';

    const url = langStore.currentLang === LangType.ZH_CN ? policyAgreementCn : policyAgreementEn;

    if (isMobile) {
      return watchCore.utils.generatePdfPreviewUrl(url);
    }

    return url;
  });

  /** 协议内容 */
  const protocolContent = computed(() => {
    return translate('realName.agreementContent', {
      userAgreement: unref(userAgreement),
      policyAgreement: unref(policyAgreement),
    });
  });

  const formData = reactive({
    phoneNumber: '',
    areaCode: '+86',
    smsCode: '',
    checkProtocol: false,
  });

  const formRules = computed<ValidatorRules>(() => {
    return {
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
      smsCode: [
        {
          type: 'string',
          message: translate('form.error.smsVerifyRequired'),
          required: true,
        },
      ],

      checkProtocol: {
        validator: () => {
          if (!formData.checkProtocol) {
            return [translate('auth.error.checkProtocol')];
          }
          return [];
        },
      },
    };
  });

  /**
   * 提交实名认证信息
   */
  async function submitRealNameData() {
    const watchCore = getWatchCore();

    const result = await watchCore.user.saveRealNameData({
      phoneNumber: formData.phoneNumber,
      areaCode: formData.areaCode,
      smsCode: formData.smsCode,
    });

    viewerStore.syncNeedRealNameAuth();

    if (result.success) {
      toast.success(translate('base.submitSuccess'));
      setVisible(false);
    } else {
      const failReason = result.failReason;

      if (failReason === RealNameFail.SmsCodeFail) {
        toast.error(translate('base.smsCodeError'));
      }
    }
  }

  return {
    visible,
    formData,
    formRules,
    userAgreement,
    policyAgreement,
    protocolContent,
    submitRealNameData,
  };
};
