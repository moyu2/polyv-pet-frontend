import { QueryParamsKeyType } from '@/hooks/core/use-query-params';
import { useAuthStore } from '@/store/use-auth-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { AuthType } from '@polyv/live-watch-sdk';
import { useAuthCustomAction } from '../auth-custom/use-auth-custom';
import { useAuthDirectAction } from '../auth-direct/use-auth-direct';
import { useAuthExternalAction } from '../auth-external/use-auth-external';

/** 特殊授权相关的参数 */
export const AuthSpecialQueryParams: QueryParamsKeyType[] = [
  'userid',
  'avatar',
  'ts',
  'sign',
  'nickname',
  'forceExternalAuth',
];

/**
 * 处理在页面进入后的特殊授权
 */
export const useAuthSpecial = () => {
  const authStore = useAuthStore();
  const watchAppStore = useWatchAppStore();

  /**
   * 处理特殊授权
   * @warn 注意授权顺序，不要轻易调整
   * @returns 返回 true 表示授权错误，需要跳转到其他页面，阻止页面继续加载
   * */
  async function handleSpecialAuth(): Promise<true | undefined> {
    // 存在独立授权
    if (authStore.hasAuth(AuthType.Direct)) {
      await doDirectAuth();
    }

    // 存在外部授权
    if (authStore.hasAuth(AuthType.External)) {
      await doExternalAuth();
    }

    // 存在自定义授权
    if (authStore.hasAuth(AuthType.Custom)) {
      await doCustomAuth();
    }

    if (watchAppStore.directBusinessPageType) {
      return true;
    }
  }

  /** 处理自定义授权逻辑 */
  async function doCustomAuth() {
    const {
      allowToVerifyCustomAuth,
      allowAutoRedirectCustomAuthUrl,
      redirectCustomAuthUrl,
      verifyCustomAuth,
    } = useAuthCustomAction();

    const allowCustomAuth = await allowToVerifyCustomAuth();
    if (allowCustomAuth) {
      await verifyCustomAuth();
      return;
    }

    const allowAutoRedirect = await allowAutoRedirectCustomAuthUrl();
    if (allowAutoRedirect) {
      await redirectCustomAuthUrl();
    }
  }

  /** 处理外部授权逻辑 */
  async function doExternalAuth() {
    const {
      allowToVerifyExternalAuth,
      redirectExternalAuthFailUrl,
      allowAutoRedirectExternalAuthFailUrl,
      verifyAuthExternal,
    } = useAuthExternalAction();

    const allowExternalAuth = await allowToVerifyExternalAuth();
    if (allowExternalAuth) {
      await verifyAuthExternal();
      return;
    }

    const allowAutoRedirect = await allowAutoRedirectExternalAuthFailUrl();
    if (allowAutoRedirect) {
      await redirectExternalAuthFailUrl();
    }
  }

  /** 处理独立授权逻辑 */
  async function doDirectAuth() {
    const {
      allowToVerifyDirectAuth,
      allowAutoRedirectDirectAuthFailUrl,
      redirectDirectFailUrl,
      verifyAuthDirect,
    } = useAuthDirectAction();

    const allowDirectAuth = await allowToVerifyDirectAuth();
    if (allowDirectAuth) {
      await verifyAuthDirect();
      return;
    }

    const allowAutoRedirect = await allowAutoRedirectDirectAuthFailUrl();
    if (allowAutoRedirect) {
      redirectDirectFailUrl();
    }
  }

  return {
    handleSpecialAuth,
  };
};
