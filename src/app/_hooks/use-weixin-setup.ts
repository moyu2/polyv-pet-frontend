import {
  useWeixinAuthorize,
  useWorkWeixinAuthorize,
} from '@/hooks/platform/use-weixin/use-weixin-authorize';
import { unref } from 'vue';
import { isWeixin, isWorkWeixin } from '@/assets/utils/browser';
import { useAuthStore } from '@/store/use-auth-store';
import { AuthType } from '@polyv/live-watch-sdk';
import { useWorkWeixinErrorPage } from '@/hooks/platform/use-weixin/use-work-weixin-error-page';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';

/**
 * @hook 处理企业微信授权
 * @returns 返回 true 则表示中断页面渲染
 */
const useWorkWeixinSetup = async () => {
  const { getWatchCore } = useMultiPolyvWatchApp();

  const watchCore = getWatchCore();
  const authStore = useAuthStore();

  // 非微信环境不往下继续判断
  if (!(isWorkWeixin || isWeixin)) {
    return false;
  }

  const { canWorkWeixinAuthorize, redirectWorkWeixinAuthorize } = useWorkWeixinAuthorize();

  console.info('[useWorkWeixinSetup] canWorkWeixinAuthorize', canWorkWeixinAuthorize);

  if (unref(canWorkWeixinAuthorize)) {
    await redirectWorkWeixinAuthorize({
      snsApiBase: watchCore.weixin.getWorkWeixinSnsApiBase(),
    });
    return true;
  }

  const { isNeedErrorPageRedirect, processErrorPageRedirect } = useWorkWeixinErrorPage();
  const isOnlyEnterpriseWeChatAuth =
    authStore.authSettings.length === 1 && authStore.hasAuth(AuthType.EnterpriseWeChat);
  // 单个条件时自动处理
  if (isNeedErrorPageRedirect() && isOnlyEnterpriseWeChatAuth) {
    const processResult = processErrorPageRedirect();
    if (processResult) {
      return true;
    }
  }
};

/**
 * @hook 处理个人微信授权
 * @returns 返回 true 则表示中断页面渲染
 */
const useGeneralWeixinSetup = async () => {
  const { getWatchCore } = useMultiPolyvWatchApp();

  const watchCore = getWatchCore();

  const { canWeixinAuthorize, redirectWeixinAuthorize } = useWeixinAuthorize();
  if (unref(canWeixinAuthorize)) {
    await redirectWeixinAuthorize({
      snsApiBase: watchCore.weixin.getSnsApiBase(),
    });
    return true;
  }
};

/**
 * @hook 处理微信流程
 * @warn 保利威业务相关，需要先处理个微，再处理企微
 * @returns 返回 true 则表示中断页面渲染，需要进行微信授权或错误页跳转
 */
export const useWeixinSetup = async () => {
  const generalWeixinSetupResult = await useGeneralWeixinSetup();
  if (generalWeixinSetupResult) {
    return true;
  }

  const workWeixinSetupResult = await useWorkWeixinSetup();
  if (workWeixinSetupResult) {
    return true;
  }
};
