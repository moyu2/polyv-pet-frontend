import { DirectBusinessPageType, PageErrorType } from '@/app/layout/direct-business-page/type';
import { translate } from '@/assets/lang';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { PolyvWatchCore } from '@polyv/live-watch-sdk';

/**
 * 邀请观看拦截
 */
export const useAuthInviteWatchIntercept = () => {
  const watchAppStore = useWatchAppStore();

  /**
   * 检查邀请观看功能流程
   * @return 返回 false 表示无需额外处理，返回 true 表示进入邀请观看流程
   */
  async function checkInviteWatch(watchCore: PolyvWatchCore, opts: { saleId?: string }) {
    try {
      const allowInviteWatchAuth = watchCore.auth.allowInviteWatchAuth();

      if (!allowInviteWatchAuth) {
        return false;
      }

      // 获取邀请观看上级邀请员的 inviteWatchSaleId
      const inviteWatchInviteSalesId = watchCore.user.getInviteWatchInviteSalesId();

      // 存在上级邀请员，则使用上级邀请员id，否则使用传入的saleId
      const saleId = inviteWatchInviteSalesId || opts.saleId;

      if (!saleId) {
        watchAppStore.setPageError({
          type: PageErrorType.UnknownError,
          desc: translate('inviteWatch.notAllow.tips'),
        });
        return true;
      }

      const verifyResult = await watchCore.auth.verifyInviteWatchAuth({
        saleId,
      });
      if (verifyResult.success) {
        // 无需审核，刷新页面获取最新的邀请信息
        if (!verifyResult.needAudit) {
          window.location.reload();
          return true;
        }
        watchAppStore.setDirectBusinessPage({
          pageType: DirectBusinessPageType.InviteWatchAuditing,
        });
      } else {
        watchAppStore.setPageError({
          type: PageErrorType.UnknownError,
          desc: verifyResult.failMessage || translate('base.error.unknown'),
        });
      }

      return true;
    } catch (error) {
      console.error('checkInviteWatch error', error);
      watchAppStore.setPageError({
        type: PageErrorType.UnknownError,
        desc: translate('base.error.unknown'),
      });
      return true;
    }
  }

  return {
    checkInviteWatch,
  };
};
