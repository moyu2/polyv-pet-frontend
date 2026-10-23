import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { isFormItemInstance } from '@/components/common-base/form/hooks/use-form-item';
import { ValidatorRules } from '@/plugins/async-validator';
import { AuthSettingItemPhone, AuthType } from '@polyv/live-watch-sdk';
import { computed, reactive, ref, unref } from 'vue';
import { useAuthButtonInject } from '../hooks/use-auth-button';
import { useAuthCommon, useAuthProtocol } from '../hooks/use-auth-common';
import { useFingerPrint } from '@/hooks/tools/use-finger-print';
import { useViewerStore } from '@/store/use-viewer-store';
import { isWeixin } from '@/assets/utils/browser';

/** 观看条件：白名单 hook */
export const useAuthPhone = () => {
  const { getWatchCore } = useGlobalInject();

  const viewerStore = useViewerStore();
  const { computedAuthItem } = useAuthButtonInject<AuthSettingItemPhone>(onClickAuthButton);
  const { getVisitorId } = useFingerPrint();

  /** 弹层是否显示 */
  const dialogVisible = ref(false);

  /** 弹层标题 */
  const dialogTitle = computed(() => computedAuthItem.value.authTips);

  /** 表单对象 */
  const formData = reactive({
    phone: '',
    checkProtocol: false,
  });

  /** 输入框占位文本 */
  const inputPlaceholder = computed(() => {
    return computedAuthItem.value.whiteListInputTips || translate('auth.phone.placeholder');
  });

  const { protocolContent, protocolFormRules } = useAuthProtocol({
    getAuthItem: () => computedAuthItem.value,
    formData,
  });

  /** 处理点击授权入口按钮 */
  function onClickAuthButton(): void {
    dialogVisible.value = true;
    formData.phone = '';
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

  const formRules = computed<ValidatorRules>(() => {
    return {
      phone: { type: 'string', message: translate('auth.error.phoneEmpty'), required: true },
      ...unref(protocolFormRules),
    };
  });

  const { failMessage, handleAuthVerifySuccess, handleAuthVerifyFail } = useAuthCommon();
  const formItemRef = ref();

  /** 提交授权表单 */
  async function submitAuth() {
    const watchCore = getWatchCore();

    let visitorId = await getVisitorId();
    // 对于微信端则通过 openId 作为访客 id，将移动端、PC 端等登录同一个微信的判断为相同观众
    if (isWeixin && viewerStore.openId) {
      visitorId = viewerStore.openId;
    }

    const result = await watchCore.auth.verifyPhoneAuth({
      phone: formData.phone,
      visitorId,
    });

    if (result.success) {
      dialogVisible.value = false;
      handleAuthVerifySuccess(result);
    } else {
      handleAuthVerifyFail(result);

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
    protocolContent,
    formData,
    inputPlaceholder,
    formRules,
    onClickCancel,
    submitAuth,
    failMessage,
    formItemRef,
  };
};
