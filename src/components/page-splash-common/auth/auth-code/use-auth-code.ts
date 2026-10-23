import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { isFormItemInstance } from '@/components/common-base/form/hooks/use-form-item';
import { ValidatorRules } from '@/plugins/async-validator';
import { AuthSettingItemCode, AuthVerifyError, AuthType } from '@polyv/live-watch-sdk';
import { computed, reactive, ref, unref } from 'vue';
import { useAuthButtonInject } from '../hooks/use-auth-button';
import { useAuthCommon, useAuthProtocol } from '../hooks/use-auth-common';
import { ImageVerifyInputInstance } from '@/components/common-base/form/form-image-verify-input/type';

/** 观看条件：验证码 hook */
export const useAuthCode = () => {
  const { getWatchCore } = useGlobalInject();

  const { computedAuthItem } = useAuthButtonInject<AuthSettingItemCode>(onClickAuthButton);

  /** 弹层是否显示 */
  const dialogVisible = ref(false);

  /** 弹层标题 */
  const dialogTitle = computed(() => computedAuthItem.value.codeAuthTips);

  /** 表单对象 */
  const formData = reactive({
    code: '',
    checkProtocol: false,
    imageId: '',
    captcha: '',
  });

  /** 是否需要图形验证码 */
  const needImageVerify = ref(false);

  const { protocolContent, protocolFormRules } = useAuthProtocol({
    getAuthItem: () => computedAuthItem.value,
    formData,
  });

  /** 处理点击授权入口按钮 */
  function onClickAuthButton(): void {
    dialogVisible.value = true;
    formData.code = '';
    formData.imageId = '';
    formData.captcha = '';
    formData.checkProtocol = false;
  }

  // 登录回来主动弹：与按钮点击同函数，表单重置行为一致
  useEventBusListener(
    appEvents.global.OpenAuthConditionDialog,
    ({ authType }: { authType: AuthType }) => {
      if (authType === computedAuthItem.value.authType) {
        onClickAuthButton();
      }
    },
  );

  /** 处理点击取消 */
  function onClickCancel(): void {
    dialogVisible.value = false;
  }

  /** 二维码图片地址 */
  const qrcodeImg = computed(() => computedAuthItem.value.qcodeImg);

  /** 二维码提示文案 */
  const qrcodeTips = computed(() => computedAuthItem.value.qcodeTips);

  const formRules = computed<ValidatorRules>(() => {
    return {
      code: { type: 'string', message: translate('auth.error.codeEmpty'), required: true },
      captcha: { type: 'string', message: translate('auth.error.captchaEmpty'), required: true },
      ...unref(protocolFormRules),
    };
  });

  const { failMessage, handleAuthVerifySuccess, handleAuthVerifyFail } = useAuthCommon();
  const formItemRef = ref();

  const imageVerifyFormItemRef = ref();
  const imageVerifyRef = ref<ImageVerifyInputInstance>();

  /** 提交授权表单 */
  async function submitAuth() {
    const watchCore = getWatchCore();
    const result = await watchCore.auth.verifyCodeAuth({
      code: formData.code,
      imageId: formData.imageId,
      captcha: formData.captcha,
    });

    if (result.success) {
      dialogVisible.value = false;
      handleAuthVerifySuccess(result);
    } else {
      if (result.failReason === AuthVerifyError.CodeNeedVerify) {
        needImageVerify.value = true;
      }
      handleAuthVerifyFail(result);

      // 图形验证码错误
      const imageVerifyFormInstance = unref(imageVerifyFormItemRef);
      if (
        failMessage.value &&
        isFormItemInstance(imageVerifyFormInstance) &&
        result.failReason === AuthVerifyError.ImageCodeError
      ) {
        imageVerifyFormInstance.setErrorMessage(failMessage.value);
        imageVerifyRef.value?.refreshVerifyImage();
        return;
      }

      // 设置表单的异常提示
      const formItemInstance = unref(formItemRef);
      if (failMessage.value && isFormItemInstance(formItemInstance)) {
        formItemInstance.setErrorMessage(failMessage.value);
      }
    }
  }

  return {
    dialogVisible,
    dialogTitle,
    qrcodeImg,
    qrcodeTips,
    protocolContent,
    needImageVerify,
    formData,
    formRules,
    onClickCancel,
    submitAuth,
    failMessage,
    formItemRef,
    imageVerifyFormItemRef,
    imageVerifyRef,
  };
};
