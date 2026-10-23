import { useWeixinAuthorize } from '@/hooks/platform/use-weixin/use-weixin-authorize';
import { useWeixinPay } from '@/hooks/platform/use-weixin/use-weixin-pay';
import { translate } from '@/assets/lang';
import { isWeixin } from '@/assets/utils/browser';
import { useToastManager } from '@/hooks/components/use-toast';
import { useWeixinStore } from '@/store/use-weixin-store';
import { AuthPayFailReason, AuthSettingItemPay, AuthType } from '@polyv/live-watch-sdk';
import { computed, onBeforeUnmount, ref, unref, watch } from 'vue';
import { useAuthButtonInject } from '../hooks/use-auth-button';
import { useAuthCommon } from '../hooks/use-auth-common';
import { useGlobalInject } from '@/app/use-global-inject';

/**
 * PC 端付费观看 hook
 */
export const useAuthPayPc = () => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const weixinStore = useWeixinStore();
  const { redirectWeixinAuthorize } = useWeixinAuthorize();
  const { computedAuthItem } = useAuthButtonInject<AuthSettingItemPay>(onClickAuthButton);
  const { handleAuthVerifySuccess } = useAuthCommon();

  /** 弹层是否显示 */
  const dialogVisible = ref(false);

  /** 弹层标题 */
  const dialogTitle = computed(() => computedAuthItem.value.payAuthTips);

  /** 弹层类型 */
  const dialogType = ref<'pay' | 'payCheck'>('pay');

  /** 支付金额 */
  const payPrice = computed(() => computedAuthItem.value.price);

  /** 打开支付弹层 */
  function openPayDialog() {
    const watchCore = getWatchCore();

    watchCore.auth.closeCheckWechatPayStatusPolling();
    dialogType.value = 'pay';
    dialogVisible.value = true;
    refreshPayData();
  }

  /** 打开支付检查弹层 */
  function openPayCheckDialog() {
    const watchCore = getWatchCore();
    watchCore.auth.closeCheckPayStatusPolling();
    dialogType.value = 'payCheck';
    dialogVisible.value = true;
    refreshWechatPayData();
  }

  /** 处理点击授权入口按钮 */
  function onClickAuthButton(): void {
    openPayDialog();
  }

  /** 处理点击我已支付 */
  function onClickWechatHasPay() {
    openPayCheckDialog();
  }

  /** 支付二维码地址 */
  const payQrcodeUrl = ref<string>();

  /** 微信扫描二维码地址 */
  const wechatQrcodeUrl = ref<string>();

  /**
   * 处理支付成功
   */
  function onPaySuccess() {
    /**
     * 针对于 PC 端微信客户端，在付费完后做微信非静默授权
     */
    if (isWeixin && !weixinStore.weixinWatchAuthorized) {
      redirectWeixinAuthorize({
        snsApiBase: false,
      });
      return;
    }

    handleAuthVerifySuccess({
      success: true,
      authType: AuthType.Pay,
    });
    dialogVisible.value = false;
  }

  /**
   * 处理支付超时
   */
  function onPayTimeout() {
    dialogVisible.value = false;
    toast.error(translate('auth.error.payTimeout'));
  }

  /**
   * 刷新支付数据
   */
  async function refreshPayData() {
    const watchCore = getWatchCore();
    const payInfo = await watchCore.auth.getAuthPayData();

    if (!payInfo.success) {
      if (payInfo.failReason === AuthPayFailReason.NotAllow) {
        toast.error(translate('auth.pay.notAllow'));
      } else {
        toast.error(payInfo.failMessage || translate('base.error.unknown'));
      }
      return;
    }

    payQrcodeUrl.value = payInfo.qrcodeUrl;

    watchCore.auth.startCheckPayStatusPolling({
      successCallback: () => onPaySuccess(),
      timeoutCallback: () => onPayTimeout(),
    });
  }

  /**
   * 刷新微信扫码数据
   */
  async function refreshWechatPayData() {
    const watchCore = getWatchCore();
    const wechatPayData = await watchCore.auth.getWechatPayCheckData();
    wechatQrcodeUrl.value = wechatPayData.qrcodeUrl;

    watchCore.auth.startCheckWechatPayStatusPolling({
      successCallback: () => onPaySuccess(),
      timeoutCallback: () => onPayTimeout(),
    });
  }

  watch(
    () => unref(dialogVisible),
    () => {
      const watchCore = getWatchCore();

      if (!unref(dialogVisible)) {
        watchCore.auth.closeCheckPayStatusPolling();
        watchCore.auth.closeCheckWechatPayStatusPolling();
      }
    },
  );

  onBeforeUnmount(() => {
    const watchCore = getWatchCore();
    watchCore.auth.closeCheckPayStatusPolling();
    watchCore.auth.closeCheckWechatPayStatusPolling();
  });

  return {
    dialogVisible,
    dialogTitle,
    dialogType,
    payPrice,
    payQrcodeUrl,
    wechatQrcodeUrl,
    openPayDialog,
    openPayCheckDialog,
    onClickWechatHasPay,
  };
};

/**
 * 移动端付费观看 hook
 */
export const useAuthPayMobile = () => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const { handleAuthVerifySuccess } = useAuthCommon();
  const { chooseWXPay } = useWeixinPay();
  const { redirectWeixinAuthorize } = useWeixinAuthorize();
  const { computedAuthItem } = useAuthButtonInject<AuthSettingItemPay>(onClickAuthButton);
  const weixinStore = useWeixinStore();

  /** 弹层是否显示 */
  const dialogVisible = ref(false);

  /** 弹层标题 */
  const dialogTitle = computed(() => computedAuthItem.value.payAuthTips);

  /** 支付金额 */
  const payPrice = computed(() => computedAuthItem.value.price);

  function onClickAuthButton() {
    // 点击付费观看需要先做非静默授权
    if (!weixinStore.weixinWatchAuthorized) {
      redirectWeixinAuthorize({
        snsApiBase: false,
      });
      return;
    }

    dialogVisible.value = true;
  }

  /**
   * 处理支付成功
   */
  async function onPaySuccess() {
    const watchCore = getWatchCore();
    const payed = await watchCore.auth.checkPayStatus();
    if (payed) {
      handleAuthVerifySuccess({
        success: true,
        authType: AuthType.Pay,
      });
      dialogVisible.value = false;
    }
  }

  const isLoading = ref(false);

  /** 处理点击支付 */
  async function onClickPay() {
    // 非微信中打开
    if (!isWeixin) {
      toast.error(translate('weixin.error.toWechatPay'));
      return;
    }

    if (isLoading.value) {
      return;
    }

    isLoading.value = true;
    try {
      const watchCore = getWatchCore();
      const payInfo = await watchCore.auth.getAuthPayData();
      if (!payInfo.success) {
        if (payInfo.failReason === AuthPayFailReason.NotAllow) {
          throw new Error(translate('auth.pay.notAllow'));
        } else {
          throw new Error(payInfo.failMessage || translate('base.error.unknown'));
        }
      }

      isLoading.value = false;

      if (payInfo.wxPaySignData) {
        dialogVisible.value = false;
        chooseWXPay(payInfo.wxPaySignData, {
          successCb: async () => {
            onPaySuccess();
          },
        });
      }
    } catch (e) {
      isLoading.value = false;

      const message = (e as Error).message;
      isLoading.value = false;
      toast.error(message);
    }
  }

  return {
    dialogVisible,
    dialogTitle,
    payPrice,
    onClickPay,
  };
};
