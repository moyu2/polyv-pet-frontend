import { useGlobalInject } from '@/app/use-global-inject';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useThemeStore } from '@/store/use-theme-store';
import { computed } from 'vue';

/**
 * @hook 互动-红包挂件
 * */
export const useRedpackPendant = () => {
  const interactReceiveStore = useInteractReceiveStore();

  const themeStore = useThemeStore();

  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();
  /** 红包 SDK 实例 */
  const redpackSdk = watchCore.interactReceive.getRedpack();

  /** 处理红包挂件入口显示状态改变 */
  function onEntryVisibleChanged(visible = true) {
    interactReceiveStore.redpackPendantVisible = visible;
  }

  const customImgConfig = computed(() => {
    if (!themeStore.watchThemeStyleConfig) {
      return {};
    }

    const pendant = themeStore.watchThemeStyleConfig.common.pendant;
    return {
      normalPendantImg: pendant.redPacket,
      passwordPendantImg: pendant.redPacketPwd,
      rainPendantImg: pendant.redPacketRain,
    };
  });

  return {
    redpackSdk,
    customImgConfig,
    onEntryVisibleChanged,
  };
};
