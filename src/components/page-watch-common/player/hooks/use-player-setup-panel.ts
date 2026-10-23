import { useGlobalInject } from '@/app/use-global-inject';
import { PlayerEvents } from '@polyv/live-watch-sdk';
import { useTargetEventEmitter } from '@polyv/vue-components';
import { ref } from 'vue';

export const usePlayerSetupPanel = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  /** 是否显示设置面板 */
  const isSetupPanelShow = ref(false);

  useTargetEventEmitter(watchCore.player.eventEmitter, {
    [PlayerEvents.PlayerSetupPanelChange]: data => {
      isSetupPanelShow.value = data.isShow;
    },
  });

  return {
    isSetupPanelShow,
  };
};
