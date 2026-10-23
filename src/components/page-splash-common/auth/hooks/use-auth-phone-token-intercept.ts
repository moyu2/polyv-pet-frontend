import { isWeixin } from '@/assets/utils/browser';
import { useFingerPrint } from '@/hooks/tools/use-finger-print';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { useAuthStore } from '@/store/use-auth-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { AuthType } from '@polyv/live-watch-sdk';

/**
 * 白名单 token 自动鉴权拦截
 */
export const useAuthPhoneTokenIntercept = () => {
  const authStore = useAuthStore();
  const viewerStore = useViewerStore();
  const watchAppStore = useWatchAppStore();
  const { getVisitorId } = useFingerPrint();

  const { paramGetter, removeQueryParam } = useQueryParams();

  /**
   * 检查并执行白名单 token 自动鉴权
   * @returns true 表示白名单 token 授权成功
   */
  async function checkPhoneAuthToken(): Promise<boolean> {
    const phoneAuthToken = paramGetter().phoneAuthToken();
    if (!phoneAuthToken) {
      return false;
    }

    // 只在存在白名单观看条件时处理，避免干扰其他观看流程
    if (!authStore.hasAuth(AuthType.Phone)) {
      return false;
    }

    const watchCore = watchAppStore.getWatchCore();

    let visitorId = await getVisitorId();
    if (isWeixin && viewerStore.openId) {
      visitorId = viewerStore.openId;
    }

    const result = await watchCore.auth.verifyPhoneAuth({
      phoneAuthToken,
      visitorId,
    });

    // 校验失败则降级到原有授权流程
    if (!result.success) {
      return false;
    }

    // 校验通过后清理 token，避免链接被继续传播
    removeQueryParam(['phoneAuthToken']);

    await watchAppStore.resetUpWatchCore();
    return true;
  }

  return {
    checkPhoneAuthToken,
  };
};
