import { appEvents } from '@/app/app-events';
import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';
import { usePlayerStore } from '@/store/use-player-store';
import { PlayerErrorReason, PlayerEvents, PolyvWatchCore } from '@polyv/live-watch-sdk';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

export function bindPlayerModuleEvents(watchCore: PolyvWatchCore): void {
  const watchAppStore = useWatchAppStore();

  const playerStore = usePlayerStore();
  const playbackStore = usePlaybackStore();
  const subtitleStore = useSubtitleStore();

  const { toast } = useToastManager();

  watchCore.player.eventEmitter.on(PlayerEvents.PlayerInfoChange, () => {
    playerStore.syncPlayerInfo();
  });

  watchCore.player.eventEmitter.on(PlayerEvents.PlayerWarmUpSettingChange, () => {
    playerStore.syncWarmUpSetting();
  });

  /** 无延迟错误，自动切回 CDN 播放器 */
  watchCore.player.eventEmitter.on(PlayerEvents.LowLatencyError, evt => {
    const errorCode = evt.errorCode || '';

    if (errorCode === '20004') {
      toast.error(`${evt.errorCode} ${translate('player.latency.restrictError')} ${evt.message}`, {
        duration: 10000,
      });
      return;
    }

    toast.error(`${errorCode} ${translate('player.latency.error')}`);

    playerStore.$patch({ isLowLatency: false });

    const emitter = watchAppStore.getPolyvWatchApp()?.getEmitter();
    if (!emitter) return;
    emitter.emit(appEvents.player.ResetUpPlayer);
  });

  watchCore.player.eventEmitter.on(PlayerEvents.PlayerError, evt => {
    if (evt.reason === PlayerErrorReason.SdkLoadError) {
      playerStore.$patch({
        playerSdkLoadError: true,
        playerScriptLoading: false,
      });
    }
  });

  watchCore.player.eventEmitter.on(PlayerEvents.PlayerScriptLoaded, () => {
    playerStore.$patch({
      playerScriptLoading: false,
    });
  });

  watchCore.player.eventEmitter.on(PlayerEvents.TimeUpdate, params => {
    if (playbackStore.chatReplayEnabled) {
      watchCore.chat.processChatMsgReplay(params);
    }
    if (playbackStore.productReplayEnabled) {
      watchCore.interactReceive.processProductReplay(params);
    }
  });

  watchCore.player.eventEmitter.on(PlayerEvents.PlayerMarqueeError, ({ code }) => {
    toast.error(translate('player.marquee.checkError', { code }));
  });

  watchCore.player.eventEmitter.on(PlayerEvents.PlayerSubtitleSwitched, ({ checked }) => {
    subtitleStore.changeLocalUerSubtitlesEnable(checked);
  });

  watchCore.player.eventEmitter.on(PlayerEvents.PlayerLoadingDetectionUpdate, info => {
    playerStore.syncLoadingDetectionInfo(info);
  });
}
