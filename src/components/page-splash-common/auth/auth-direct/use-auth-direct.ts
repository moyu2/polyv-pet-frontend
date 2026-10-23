import { translate } from '@/assets/lang';
import { PageErrorType } from '@/app/layout/direct-business-page/type';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useAuthCommon } from '../hooks/use-auth-common';
import { DirectAuthSignParams } from '@polyv/live-watch-sdk';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { useToastManager } from '@/hooks/components/use-toast';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';

export const useAuthDirectAction = () => {
  const { getWatchCore, getPolyvWatchApp } = useMultiPolyvWatchApp();

  const { toast } = useToastManager();

  const watchAppStore = useWatchAppStore();

  const { getQueryParams, paramGetter } = useQueryParams({
    getPolyvWatchAppLoader: () => () => getPolyvWatchApp(),
  });

  const { failMessage, getDefaultFailMessage, handleAuthVerifySuccess, handleAuthVerifyFail } =
    useAuthCommon();

  /**
   * 获取独立授权需要校验的参数
   */
  function getDirectAuthSignParams(): DirectAuthSignParams {
    return {
      userid: paramGetter().userid() || '',
      ts: paramGetter().ts() || '',
      sign: paramGetter().sign() || '',
      nickname: paramGetter().nickname() || '',
    };
  }

  /**
   * 允许验证独立授权
   */
  async function allowToVerifyDirectAuth(): Promise<boolean> {
    const watchCore = getWatchCore();
    return watchCore.auth.allowToVerifyDirectAuth(getDirectAuthSignParams());
  }

  /**
   * 验证独立授权
   */
  async function verifyAuthDirect() {
    const watchCore = getWatchCore();
    const result = await watchCore.auth.verifyDirectAuth(
      getDirectAuthSignParams(),
      getQueryParams(),
    );
    if (result.success) {
      await handleAuthVerifySuccess(result);
    } else {
      // 如果已授权过，可以忽略此次授权失败
      if (watchCore.auth.isAuthorized()) {
        return;
      }

      await handleAuthVerifyFail(result);
      toast.warning(failMessage.value || getDefaultFailMessage());
    }
  }

  /**
   * 需要自动跳转到独立授权失败页面
   */
  function allowAutoRedirectDirectAuthFailUrl() {
    const watchCore = getWatchCore();
    return watchCore.auth.allowAutoRedirectDirectAuthFailUrl();
  }

  /**
   * 重定向到独立授权失败页
   */
  async function redirectDirectFailUrl(): Promise<void> {
    const watchCore = getWatchCore();
    const result = await watchCore.auth.redirectDirectAuthFailUrl();

    // 跳转不成功，没有配置错误地址，显示本地的错误页
    if (!result) {
      watchAppStore.setPageError({
        type: PageErrorType.DirectAuthFail,
        title: translate('auth.error.directFail'),
      });
    }
  }

  return {
    getDirectAuthSignParams,
    allowToVerifyDirectAuth,
    verifyAuthDirect,
    allowAutoRedirectDirectAuthFailUrl,
    redirectDirectFailUrl,
  };
};
