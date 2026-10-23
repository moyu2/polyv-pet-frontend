import { isWeixin } from '@/assets/utils/browser';
import { useQueryParams } from '@/hooks/core/use-query-params';

export function useAliPay() {
  const { paramGetter } = useQueryParams();
  const aliPayLinkTarget = paramGetter().aliPayLinkTarget();

  /**
   * 在新窗口打开支付宝支付页面
   * @param url 支付宝支付链接
   */
  function openPayWindow(url: string, target?: string) {
    const a = document.createElement('a');
    a.href = url;
    if (target) {
      a.target = target;
    }
    a.click();
  }

  /**
   * 判断是否在微信环境中(工作微信暂时不考虑。)
   */
  function isWeixinEnv() {
    return isWeixin;
  }

  /**
   * 在微信中打开支付宝支付页面
   * @param payUrl 支付宝支付链接
   */
  function payInWeixin(payUrl: string) {
    openPayWindow(payUrl);
  }

  /**
   * 在正常浏览器中打开支付宝支付页面
   */
  function payInNormal(payUrl: string) {
    openPayWindow(payUrl, aliPayLinkTarget);
  }

  /**
   * 支付宝支付
   * @param payUrl 支付宝支付链接
   */
  function pay(payUrl: string) {
    console.info('alipayUrl', payUrl);
    if (isWeixinEnv()) {
      payInWeixin(payUrl);
    } else {
      payInNormal(payUrl);
    }
  }

  return {
    pay,
  };
}
