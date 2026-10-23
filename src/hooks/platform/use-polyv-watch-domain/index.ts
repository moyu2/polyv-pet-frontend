/**
 * @file 泛域名 hook
 */

import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { RedirectWatchDomainPayOptions, WatchDomainPayType } from '@polyv/live-watch-sdk';
import { computed } from 'vue';

/**
 * @hook 泛域名处理
 * */
export const usePolyvWatchDomain = () => {
  const { getWatchCore } = useMultiPolyvWatchApp();

  const watchCore = getWatchCore();

  /** 泛域名开关 */
  const polyvWatchDomainEnabled = computed<boolean>(() => {
    return watchCore.channel.getPolyvWatchDomainEnabled();
  });

  /**
   * 跳转到泛域名支付 - 仅支持微信支付
   */
  async function skipWatchDomainPay<T extends WatchDomainPayType>(
    options: RedirectWatchDomainPayOptions<T>,
  ) {
    const watchCore = getWatchCore();
    watchCore.weixin.redirectWatchDomainPay(options);
  }

  return {
    polyvWatchDomainEnabled,
    skipWatchDomainPay,
  };
};
