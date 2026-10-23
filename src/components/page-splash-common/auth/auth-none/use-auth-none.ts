import { useGlobalInject } from '@/app/use-global-inject';
import { useEnrollStore } from '@/store/use-enroll-store';
import { AuthSettingItemCode } from '@polyv/live-watch-sdk';
import { onMounted } from 'vue';
import { useAuthButtonInject } from '../hooks/use-auth-button';
import { useAuthCommon } from '../hooks/use-auth-common';

export const useAuthNone = () => {
  const { getWatchCore } = useGlobalInject();

  const enrollStore = useEnrollStore();
  useAuthButtonInject<AuthSettingItemCode>(onClickAuthButton);
  const { handleAuthVerifySuccess, handleAuthVerifyFail } = useAuthCommon();

  /** 执行无条件授权 */
  async function toDoAuthNone() {
    const watchCore = getWatchCore();
    const result = await watchCore.auth.verifyNoneAuth();

    if (result.success) {
      await handleAuthVerifySuccess(result);
    } else {
      await handleAuthVerifyFail(result);
    }
  }

  /** 处理点击授权按钮 */
  async function onClickAuthButton(): Promise<void> {
    await toDoAuthNone();
  }

  onMounted(() => {
    // 如果显示了无条件授权但又需要报名观看，则渲染授权按钮时自动出发授权
    if (enrollStore.needEnrollByEnter) {
      toDoAuthNone();
    }
  });
};
