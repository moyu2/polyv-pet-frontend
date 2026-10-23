import { translate } from '@/assets/lang';
import { PageErrorType } from '@/app/layout/direct-business-page/type';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { AuthSettingItemExternal, ExternalAuthSignParams } from '@polyv/live-watch-sdk';
import { useAuthButtonInject } from '../hooks/use-auth-button';
import { useAuthCommon } from '../hooks/use-auth-common';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { useToastManager } from '@/hooks/components/use-toast';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';

/**
 * 外部授权操作 hook
 */
export const useAuthExternalAction = () => {
  const { getWatchCore, getPolyvWatchApp } = useMultiPolyvWatchApp();

  const { toast } = useToastManager();

  const { getQueryParams, paramGetter } = useQueryParams({
    getPolyvWatchAppLoader: () => () => getPolyvWatchApp(),
  });

  const watchAppStore = useWatchAppStore();
  const { failMessage, getDefaultFailMessage, handleAuthVerifySuccess, handleAuthVerifyFail } =
    useAuthCommon();

  /**
   * 获取外部授权需要校验的参数
   */
  function getExternalAuthSignParams(): ExternalAuthSignParams {
    return {
      userid: paramGetter().userid() || '',
      ts: paramGetter().ts() || '',
      sign: paramGetter().sign() || '',
    };
  }

  /**
   * 允许验证外部授权
   */
  async function allowToVerifyExternalAuth(): Promise<boolean> {
    const watchCore = getWatchCore();
    return watchCore.auth.allowToVerifyExternalAuth(getExternalAuthSignParams());
  }

  /**
   * 验证外部授权
   */
  async function verifyAuthExternal() {
    const watchCore = getWatchCore();
    const result = await watchCore.auth.verifyExternalAuth(
      getExternalAuthSignParams(),
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
   * 需要自动重定向到外部授权失败地址
   */
  function allowAutoRedirectExternalAuthFailUrl() {
    const watchCore = getWatchCore();
    return watchCore.auth.allowAutoRedirectExternalAuthFailUrl();
  }

  /**
   * 重定向到外部授权地址
   */
  async function redirectExternalAuthFailUrl() {
    const watchCore = getWatchCore();
    const result = await watchCore.auth.redirectExternalAuthFailUrl();

    // 跳转不成功，没有配置错误地址，显示本地的错误页
    if (!result) {
      watchAppStore.setPageError({
        type: PageErrorType.ExternalAuthFail,
        title: translate('auth.error.externalFail'),
      });
    }
  }

  return {
    getExternalAuthSignParams,
    allowToVerifyExternalAuth,
    verifyAuthExternal,
    allowAutoRedirectExternalAuthFailUrl,
    redirectExternalAuthFailUrl,
  };
};

export const useAuthExternal = () => {
  useAuthButtonInject<AuthSettingItemExternal>(onClickAuthButton);

  const { redirectExternalAuthFailUrl } = useAuthExternalAction();

  /** 处理点击授权入口按钮 */
  function onClickAuthButton() {
    redirectExternalAuthFailUrl();
  }
};
