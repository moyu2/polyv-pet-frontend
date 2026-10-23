import { isFunction } from '@/assets/utils/function';
import { useWeixinSdk } from './use-weixin-sdk';
import { LoggerName } from '@polyv/live-watch-sdk';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { WeixinGeneralCallback, WxCallback } from './types';

/**
 * @hook 微信支付
 */
export function useWeixinPay() {
  const { getWatchCore } = useMultiPolyvWatchApp();
  const watchCore = getWatchCore();

  const { getWeixinSdk } = useWeixinSdk();

  /**
   * 唤起或监听微信 sdk 初始化完成后唤起微信支付
   * @param payInfo 微信支付相关信息
   * @param callback 支付相关回调
   */
  async function chooseWXPay(payInfo: WechatJsSdk.ChooseWXPayOption, callback: WxCallback = {}) {
    const { successCb, cancelCb } = callback;
    const wx = await getWeixinSdk();

    wx &&
      wx.chooseWXPay({
        timestamp: payInfo.timestamp,
        nonceStr: payInfo.nonceStr,
        package: payInfo.package,
        signType: payInfo.signType,
        paySign: payInfo.paySign,
        success: res => {
          if (isFunction<WeixinGeneralCallback>(successCb)) {
            successCb(res);
          }
        },
        cancel: res => {
          if (isFunction<WeixinGeneralCallback>(cancelCb)) {
            cancelCb(res);
          }
        },
        fail: res => {
          watchCore.logger.error(LoggerName.Weixin, 'choose-wx-pay-fail', JSON.stringify(res));
        },
      });
  }

  return {
    chooseWXPay,
  };
}
