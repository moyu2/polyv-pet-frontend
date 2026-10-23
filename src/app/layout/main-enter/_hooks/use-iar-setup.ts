import { loadIarUI } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useToastManager } from '@/hooks/components/use-toast';
import { translate } from '@/assets/lang';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { useWatchAppStore } from '@/store/use-watch-app-store';

/**
 * @hook 互动功能安装 hook
 */
export const useIarSetup = () => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const watchCore = getWatchCore();

  const interactReceiveStore = useInteractReceiveStore();
  const watchAppStore = useWatchAppStore();

  // notNeedIar 只不加载 V1 的互动
  async function loadIarUIV1() {
    if (watchAppStore.notNeedIar) {
      return;
    }

    await loadIarUI();

    interactReceiveStore.$patch({
      iarUIV1Loaded: true,
    });
  }

  async function loadIarSDKInner() {
    await watchCore.interactReceive.setupIarCore(); // 安装互动功能逻辑层

    interactReceiveStore.$patch({
      iarSdkLoaded: true,
    });
  }

  /** 加载互动功能 SDK */
  async function loadIarSDK() {
    try {
      await Promise.all([
        loadIarSDKInner(),
        loadIarUIV1(), // 加载互动功能 UI 组件 V1 版本
      ]);
    } catch (error) {
      console.error(error);
      toast.error(translate('base.error.iarSetup'));
    }
  }

  return {
    loadIarSDK,
  };
};
