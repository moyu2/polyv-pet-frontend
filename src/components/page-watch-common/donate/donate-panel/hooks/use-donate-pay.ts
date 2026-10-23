/**
 * @file 礼物、现金打赏支付 hook
 */

import { usePolyvWatchDomain } from '@/hooks/platform/use-polyv-watch-domain';
import { useWeixinAuthorize } from '@/hooks/platform/use-weixin/use-weixin-authorize';
import { useWeixinPay } from '@/hooks/platform/use-weixin/use-weixin-pay';
import { translate } from '@/assets/lang';
import { isMobile, isWeixin } from '@/assets/utils/browser';
import { useToastManager } from '@/hooks/components/use-toast';
import { useDonateStore } from '@/store/use-donate-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import {
  DonateType,
  PayDonateData,
  PayDonateParams,
  WatchDomainPayType,
} from '@polyv/live-watch-sdk';
import { onBeforeUnmount, unref, watch } from 'vue';
import { useDonateRewardMsgInsertHook } from './use-donate-reward-msg-insert';
import { useGlobalInject } from '@/app/use-global-inject';

/** 支付打赏选项 */
export interface DonatePayOptions {
  /** 打赏类型 */
  donateType: DonateType;
  /** 打赏道具 id */
  goodId?: string;
  /** 现金打赏下的打赏金额 */
  amount?: string | number;
}

/**
 * 打赏支付状态检查 hook
 */
const useDonatePayCheck = () => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const { insertRewardMsgForPayDonate } = useDonateRewardMsgInsertHook();
  const { waitPayDonateData } = storeDefinitionToRefs(useDonateStore);

  let checkTimer: number | undefined;
  let checkCount = 100;
  /** 清空检查支付状态定时器 */
  function clearCheckTimer() {
    clearInterval(checkTimer);
    checkTimer = undefined;
    checkCount = 100;
  }

  /** 设置检查支付状态定时器 */
  function setCheckTimer() {
    clearCheckTimer();
    checkTimer = window.setInterval(() => {
      checkPayStatus();
    }, 1000);
  }

  /** 检查支付状态 */
  async function checkPayStatus() {
    const watchCore = getWatchCore();

    const data = unref(waitPayDonateData);
    if (!data || !data.logId) {
      clearCheckTimer();
      return;
    }
    // 100 秒未支付则超时
    if (checkCount === 0) {
      clearCheckTimer();
      waitPayDonateData.value = undefined;
      toast.error(translate('donate.error.payTimeOut'));
      return;
    }
    checkCount -= 1;

    try {
      const status = await watchCore.donate.checkDonatePayStatus({
        logId: data.logId,
        donateType: data.donateType,
      });

      if (status.paySuccess) {
        if (waitPayDonateData.value) {
          insertRewardMsgForPayDonate(waitPayDonateData.value);
        }
        waitPayDonateData.value = undefined;
        clearCheckTimer();
      }
    } catch (e) {
      toast.error(translate('donate.error.payFail'));
      clearCheckTimer();
    }
  }

  onBeforeUnmount(() => {
    clearCheckTimer();
  });

  return {
    setCheckTimer,
    clearCheckTimer,
    checkPayStatus,
  };
};

/** PC 端支付逻辑 */
const useDonatePayPc = () => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const { insertRewardMsgForPayDonate } = useDonateRewardMsgInsertHook();
  const { waitPayDonateData } = storeDefinitionToRefs(useDonateStore);

  const { setCheckTimer, clearCheckTimer } = useDonatePayCheck();

  watch(
    () => unref(waitPayDonateData),
    () => {
      if (!unref(waitPayDonateData)) {
        clearCheckTimer();
      }
    },
  );

  /**
   * 支付打赏（PC 逻辑）
   */
  async function payDonate(payOptions: DonatePayOptions): Promise<void> {
    const watchCore = getWatchCore();

    clearCheckTimer();
    const donateType = payOptions.donateType;
    const amount = payOptions.amount;
    const goodId = payOptions.goodId;

    try {
      const params: PayDonateParams = {
        donateType,
      };
      // 道具打赏
      if (typeof goodId !== 'undefined') {
        params.goodId = goodId;
      }
      // 现金打赏
      if (amount) {
        params.amount = amount;
      }
      const payData = await watchCore.donate.payDonate(params);

      // 免费礼物
      if (payData.isFree) {
        insertRewardMsgForPayDonate({
          ...payOptions,
          isFree: true,
        });
        return;
      }

      waitPayDonateData.value = payData;
      setCheckTimer();
    } catch (e) {
      clearCheckTimer();
      toast.error(translate('donate.error.payFail'));
      throw e;
    }
  }

  return {
    payDonate,
  };
};

/** 移动端支付逻辑 */
const useDonatePayMobile = () => {
  const { getWatchCore } = useGlobalInject();
  const { toast } = useToastManager();

  const { insertRewardMsgForPayDonate } = useDonateRewardMsgInsertHook();
  const { redirectWeixinAuthorize } = useWeixinAuthorize();
  const { chooseWXPay } = useWeixinPay();
  const { polyvWatchDomainEnabled, skipWatchDomainPay } = usePolyvWatchDomain();

  /**
   * 支付打赏（移动端逻辑）
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  function payDonate(payOptions: DonatePayOptions) {
    return new Promise<void>((resolve, reject) => {
      (async () => {
        const watchCore = getWatchCore();

        const donateType = payOptions.donateType;
        const amount = payOptions.amount;
        const goodId = payOptions.goodId;

        let payInfo: PayDonateData;
        const params: PayDonateParams = {
          donateType,
        };
        // 道具打赏
        if (typeof goodId !== 'undefined') {
          params.goodId = goodId;
        }
        // 现金打赏
        if (amount) {
          params.amount = amount;
        }

        // 仅针对现金打赏优先泛域名支付
        if (unref(polyvWatchDomainEnabled) && donateType === DonateType.Cash) {
          await skipWatchDomainPay({
            payType: WatchDomainPayType.Donate,
            params,
          });
          return;
        }

        try {
          payInfo = await watchCore.donate.payDonate(params);
        } catch (e) {
          const err = e as Error;
          // 需要跳转授权
          if (err.message === 'authorization') {
            redirectWeixinAuthorize();
          } else {
            toast.error(translate('donate.error.payFail'));
          }
          reject(e);
          return;
        }

        // 免费礼物
        if (payInfo.isFree) {
          insertRewardMsgForPayDonate({
            ...payOptions,
            isFree: true,
          });
          resolve();
          return;
        }

        // 非微信下直接提示
        if (!isWeixin) {
          toast.error(translate('weixin.error.toWechatPay'));
          reject(new Error('pay fail'));
          return;
        }

        if (payInfo.wxPaySignData) {
          chooseWXPay(payInfo.wxPaySignData, {
            successCb: () => {
              insertRewardMsgForPayDonate(payOptions);
              return resolve();
            },
            cancelCb: () => reject(new Error('pay fail')),
          });
        }
      })();
    });
  }

  return {
    payDonate,
  };
};

/** 礼物、现金打赏支付 hook */
export const useDonatePay = () => {
  return isMobile ? useDonatePayMobile() : useDonatePayPc();
};
