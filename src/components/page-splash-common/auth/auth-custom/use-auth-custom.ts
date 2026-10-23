import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { useToastManager } from '@/hooks/components/use-toast';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { AuthSettingItemCustom, CustomAuthSignParams } from '@polyv/live-watch-sdk';
import { useAuthButtonInject } from '../hooks/use-auth-button';
import { useAuthCommon } from '../hooks/use-auth-common';

/**
 * 自定义授权操作 hook
 */
export const useAuthCustomAction = () => {
  const { getWatchCore, getPolyvWatchApp } = useMultiPolyvWatchApp();

  const { getQueryParams, paramGetter } = useQueryParams({
    getPolyvWatchAppLoader: () => () => getPolyvWatchApp(),
  });

  const { toast } = useToastManager();

  const { failMessage, getDefaultFailMessage, handleAuthVerifySuccess, handleAuthVerifyFail } =
    useAuthCommon();

  /**
   * 获取自定义授权需要签名参数
   */
  function getCustomAuthSignParams(): CustomAuthSignParams {
    return {
      userid: paramGetter().userid() || '',
      ts: paramGetter().ts() || '',
      sign: paramGetter().sign() || '',
    };
  }

  /** 允许验证自定义授权 */
  async function allowToVerifyCustomAuth(): Promise<boolean> {
    const watchCore = getWatchCore();
    return watchCore.auth.allowToVerifyCustomAuth(getCustomAuthSignParams());
  }

  /** 验证自定义授权 */
  async function verifyCustomAuth() {
    const watchCore = getWatchCore();
    const result = await watchCore.auth.verifyCustomAuth(
      getCustomAuthSignParams(),
      getQueryParams(),
    );
    if (result.success) {
      await handleAuthVerifySuccess(result);
    } else {
      await handleAuthVerifyFail(result);
      toast.warning(failMessage.value || getDefaultFailMessage());
    }
  }

  /** 允许自动重定向到自定义授权地址 */
  function allowAutoRedirectCustomAuthUrl(): Promise<boolean> {
    const watchCore = getWatchCore();
    return watchCore.auth.allowAutoRedirectCustomAuthUrl();
  }

  /** 跳转到自定义授权地址 */
  async function redirectCustomAuthUrl() {
    const watchCore = getWatchCore();
    await watchCore.auth.redirectCustomAuthUrl();
  }

  return {
    getCustomAuthSignParams,
    allowToVerifyCustomAuth,
    verifyCustomAuth,
    allowAutoRedirectCustomAuthUrl,
    redirectCustomAuthUrl,
  };
};

export const useAuthCustom = () => {
  useAuthButtonInject<AuthSettingItemCustom>(onClickAuthButton);

  const { redirectCustomAuthUrl } = useAuthCustomAction();

  /** 处理点击授权入口按钮 */
  function onClickAuthButton() {
    redirectCustomAuthUrl();
  }
};
