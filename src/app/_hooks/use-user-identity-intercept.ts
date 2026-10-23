import { useWatchAppStore } from '@/store/use-watch-app-store';
import { DirectBusinessPageType, PageErrorType } from '../layout/direct-business-page/type';
import { resolveIdentityRouting } from './use-identity-routing';
import { isWeixin } from '@/assets/utils/browser';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { useIdentityStore } from '@/store/use-identity-store';
import { AuthType, YN, type PolyvWatchCore } from '@polyv/live-watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { useAuthStore } from '@/store/use-auth-store';
import { translate } from '@/assets/lang';
import { useQueryParams } from '@/hooks/core/use-query-params';

export const useUserIdentityIntercept = () => {
  const watchAppStore = useWatchAppStore();
  const identityStore = useIdentityStore();
  const channelStore = useChannelStore();
  const authStore = useAuthStore();

  const { paramGetter } = useQueryParams();

  /**
   * 拦截频道分组验证（目前分组依赖手机号）
   * @returns 返回 true 说明需要拦截
   */
  function interruptChannelGroupVerify(watchCore: PolyvWatchCore) {
    // 研讨会和小班课频道不拦截
    if (channelStore.isSeminarChannel || channelStore.isSmallClassChannel) {
      return false;
    }

    const channelViewerGroupConfig = watchCore.channel.getChannelViewerGroupConfig();

    // 如果频道分组未启用，则不拦截
    if (!channelViewerGroupConfig.channelViewerGroupEnabled) {
      return false;
    }

    // 如果没有权限观看，需要拦截跳转到错误页
    if (!channelViewerGroupConfig.notInGroupCanWatchEnabled) {
      watchAppStore.setPageError({
        type: PageErrorType.NotAllowAccess,
        title: translate('pageError.NotAllowAccess.title'),
      });
      return true;
    }

    const identityInfo = watchCore.identity.getIdentityUnionInfo();
    if (!identityInfo) {
      watchAppStore.setPageError({
        type: PageErrorType.UnknownError,
        desc: 'not get identity info in channel group verify',
      });
      return true;
    }

    return false;
  }

  /** 用户登录成功拦截（授权后拦截） */
  async function toInterruptLoginAfter(watchCore: PolyvWatchCore) {
    // 登录方式包含企微授权时，需要确保在微信环境下进行企微静默授权
    const needWorkWechatAuth = watchCore.identity.checkWorkWxSnsApiBaseEnabled();
    if (needWorkWechatAuth) {
      const { redirected } = await watchCore.identity.ensureWorkWxSnsAuth({
        getIsWeixin: () => isWeixin,
        getIsWorkWeixinAuthorized: () => watchCore.weixin.isWorkWeixinAuthorized(),
      });

      if (redirected) {
        return true;
      }
    }

    return false;
  }

  /** 拦进认证页（page-watch-identify），已拦截返回 true */
  function toWatchIdentityPage(): boolean {
    watchAppStore.setDirectBusinessPage({
      pageType: DirectBusinessPageType.WatchIdentity,
    });
    return true;
  }

  /**
   * 检查用户体系登录
   * @returns 返回 true 说明需要拦截
   */
  async function checkIdentityInfoLogin(watchCore: PolyvWatchCore) {
    if (!identityStore.watchUserSystemEnabled) return false;

    const routing = resolveIdentityRouting({
      forceUserAuth: paramGetter().forceUserAuth() === YN.Y,
      isFeedBuild: isBuildForFeedMainMode(),
      hasDirectAuthParams: identityStore.allowToVerifyDirectAuth(),
      hasWorkWeixinCondition: authStore.authSettings.some(
        authItem => authItem.authType === AuthType.EnterpriseWeChat,
      ),
      hasInviteWatchCondition: authStore.authSettings.some(
        authItem => authItem.authType === AuthType.InviteWatch,
      ),
      sessionIdentity: identityStore.sessionIdentity,
      guestModeEnabled: identityStore.guestModeEnabled,
      shouldShowSplash: watchAppStore.shouldShowSplash,
      isPublicWatch: authStore.hasAuth(AuthType.None),
      isSeminarChannel: channelStore.isSeminarChannel,
    });

    if (routing.action === 'to-identify') {
      return toWatchIdentityPage();
    }

    if (routing.action === 'release-to-splash') {
      return false;
    }

    // 用户登录后再进行分组验证
    if (interruptChannelGroupVerify(watchCore)) {
      return true;
    }

    // 游客登录的情况不用往下处理
    if (identityStore.isGuest) {
      return false;
    }

    // 授权后拦截，用于补充用户信息
    return toInterruptLoginAfter(watchCore);
  }

  return {
    checkIdentityInfoLogin,
  };
};
