import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useEventBusListener, appEvents } from '@/app/app-events';
import { isIE } from '@/assets/utils/browser';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { isBuildForFeedMainMode, isInjectByExternalApp } from '@/assets/utils/utils';
import { useChannelStore } from '@/store/use-channel-store';
import { LiveStatus } from '@polyv/live-watch-sdk';

/**
 * 连麦 hook
 */
export const useConnectMicSetup = () => {
  const connectMicStore = useConnectMicStore();
  const channelStore = useChannelStore();
  const { getWatchCore } = useMultiPolyvWatchApp();

  /**
   * 初始化连麦
   */
  async function initConnectCall() {
    if (!connectMicStore.connectMicEnabled) return;

    // feed 流不使用连麦 或 非直播状态不使用连麦
    if (
      (isBuildForFeedMainMode() && isInjectByExternalApp()) ||
      channelStore.liveStatus !== LiveStatus.Live
    )
      return;

    const watchCore = getWatchCore();
    if (isIE) {
      console.warn('连麦功能不支持在 IE 浏览器中使用！！！');
      return;
    }

    const { success } = await watchCore.connectMic.setupConnectMic();

    connectMicStore.$patch({
      micSetupSuccess: success,
    });
  }

  async function setupConnectMic() {
    await initConnectCall();
  }

  useEventBusListener(appEvents.connectMic.ResetUpConnectMic, () => {
    initConnectCall();
  });

  return {
    setupConnectMic,
  };
};
