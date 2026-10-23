import { isWeixin } from '@/assets/utils/browser';
import { translate } from '@/assets/lang';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useWeixinStore } from '@/store/use-weixin-store';
import { useWeixinAuthorize } from '@/hooks/platform/use-weixin/use-weixin-authorize';
import { DirectBusinessPageType, PageErrorType } from '../layout/direct-business-page/type';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';

/**
 * 一客一码拦截
 * @hook
 */
export const useSaleInviteIntercept = () => {
  const watchAppStore = useWatchAppStore();
  const weixinStore = useWeixinStore();

  const { getWatchCore } = useMultiPolyvWatchApp();

  const { redirectWeixinAuthorize } = useWeixinAuthorize();

  /**
   * 检查一客一码功能流程
   * @return 返回 false 表示无需额外处理，返回 true 表示进入一客一码流程
   */
  async function checkSaleInvite(): Promise<boolean> {
    try {
      const watchCore = getWatchCore();

      const isNeedSaleInviteVerify = watchCore.saleInvite.needSaleInviteVerify();
      if (!isNeedSaleInviteVerify) {
        return false;
      }

      if (weixinStore.isWeixinSnapshotPageMode) {
        throw new Error('当前进入微信快照页，不进入一客一码流程');
      }

      if (watchCore.saleInvite.isIllegalSaleCode()) {
        watchAppStore.setPageError({
          type: PageErrorType.UnknownError,
          desc: translate('pageError.saleInvite.illegalSaleCode'),
        });
        return true;
      }

      const inviteCustomerUsageScenario = watchCore.saleInvite.getInviteCustomerUsageScenario();

      // 限制在微信内使用
      if (inviteCustomerUsageScenario === 'wechat') {
        // 非微信内
        if (!isWeixin) {
          watchAppStore.setPageError({
            type: PageErrorType.UnknownError,
            desc: translate('pageError.saleInvite.limit.weixin'),
          });
          return true;
        }

        // 微信内
        if (!watchCore.weixin.getBasicWeixinAuthEnabled()) {
          watchAppStore.setPageError({
            type: PageErrorType.UnknownError,
            desc: translate('pageError.saleInvite.limit.weixin2'),
          });
          return true;
        }
      }

      if (
        isWeixin &&
        !weixinStore.weixinWatchAuthorized &&
        watchCore.weixin.getBasicWeixinAuthEnabled()
      ) {
        // 如果没有微信非静默授权，则需要先进行授权
        redirectWeixinAuthorize({
          snsApiBase: false,
        });
        return true;
      }

      const canAutoVerify = watchCore.saleInvite.checkSaleInviteAutoVerify();
      if (canAutoVerify) {
        const verifyResult = await watchCore.saleInvite.verifySaleInviteAuth();
        if (!verifyResult.success) {
          watchAppStore.setPageError({
            type: PageErrorType.UnknownError,
            desc: verifyResult.failMessage || translate('base.error.unknown'),
          });
          return true;
        }
        window.location.reload();
        return false;
      }

      // 进入一客一码校验页面
      watchAppStore.setDirectBusinessPage({
        pageType: DirectBusinessPageType.VerifySaleInvite,
      });
      return true;
    } catch (error) {
      console.error('checkSaleInvite error', error);
      return false;
    }
  }

  return {
    checkSaleInvite,
  };
};
