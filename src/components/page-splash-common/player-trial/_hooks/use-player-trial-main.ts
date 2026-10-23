/**
 * @file 试看播放器 hook
 */
import { ChannelTrialInfo, SetupPlayerOptions } from '@polyv/live-watch-sdk';
import { onBeforeUnmount, onMounted, ref, unref } from 'vue';

import { usePlayerStore } from '@/store/use-player-store';

import { usePlayerTrialEvent } from './use-player-trial-event';
import { useGlobalInject } from '@/app/use-global-inject';

export type InitPlayerOptions = Omit<SetupPlayerOptions, 'container'>;

/** @hook 试看播放器 Hook */
export const usePlayerTrialMain = (
  hookOptions: {
    trialInfo?: ChannelTrialInfo | null;
  } = {},
) => {
  const { getWatchCore } = useGlobalInject();

  const { trialInfo = null } = hookOptions;

  const { bindPlayerEvents, unbindPlayerEvents } = usePlayerTrialEvent({ trialInfo });

  const playerStore = usePlayerStore();

  /** 播放器渲染容器 */
  const playerContainer = ref<HTMLDivElement>();

  /** 初始化播放器 */
  async function initPlayer(): Promise<void> {
    const container = unref(playerContainer);
    if (!container || !trialInfo) {
      return;
    }

    playerStore.$patch({
      playerSdkLoadError: false,
      playerScriptLoading: true,
      playerInited: false,
      isPlayStarted: false,
    });

    const playerOptions: SetupPlayerOptions = {
      container,
    };
    const watchCore = getWatchCore();
    await watchCore.player.setupPlayer(playerOptions);

    bindPlayerEvents();
  }

  /** 销毁播放器 */
  function destroyPlayer(): void {
    const watchCore = getWatchCore();
    watchCore.player.destroyPlayer();

    unbindPlayerEvents();
  }

  onMounted(() => {
    initPlayer();
  });

  onBeforeUnmount(() => {
    destroyPlayer();
  });

  return {
    playerContainer,
  };
};
