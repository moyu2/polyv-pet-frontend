import { DirectBusinessPageType, PageErrorType } from '@/app/layout/direct-business-page/type';
import { translate } from '@/assets/lang';
import { isWeixin, isWorkWeixin } from '@/assets/utils/browser';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { useWatchAppStore } from '@/store/use-watch-app-store';

/**
 * @hook 处理企业微信错误页跳转
 */
export const useWorkWeixinErrorPage = () => {
  const watchAppStore = useWatchAppStore();
  const { getWatchCore } = useMultiPolyvWatchApp();
  const watchCore = getWatchCore();

  function isNeedErrorPageRedirect() {
    if (!(isWeixin || isWorkWeixin)) return false;

    return watchCore.weixin.isWorkWeixinAuthorized();
  }

  /**
   * @return 处理结果，返回 true 则表示已执行跳转
   */
  function processErrorPageRedirect() {
    // 需要先添加为企微好友
    if (watchCore.weixin.needAsWorkFriend()) {
      const config = watchCore.weixin.getWorkWeixinFriendConfig();
      watchAppStore.setDirectBusinessPage({
        pageType: DirectBusinessPageType.WorkWechatFriend,
        data: {
          title: config.qrCodeTitle,
          desc: config.qrCodeDescription,
          href: config.qrCodeHref,
        },
      });
      return true;
    }

    // 限制只能通过企微观看条件观看
    if (watchCore.weixin.limitByEnterpriseWatchAuth()) {
      watchAppStore.setPageError({
        type: PageErrorType.WorkWechatBusinessError,
        title: translate('pageError.work.wechat.businessError.title'),
        desc: translate('pageError.work.wechat.businessError.desc'),
      });
      return true;
    }

    return false;
  }

  return {
    isNeedErrorPageRedirect,
    processErrorPageRedirect,
  };
};
