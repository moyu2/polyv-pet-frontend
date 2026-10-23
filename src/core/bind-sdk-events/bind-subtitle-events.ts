import { PlayStatus, PolyvWatchCore, SubtitleEvents } from '@polyv/live-watch-sdk';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { usePlayerStore } from '@/store/use-player-store';
import { appEvents } from '@/app/app-events';
import { useWatchAppStore } from '@/store/use-watch-app-store';

export function bindSubtitleEvents(watchCore: PolyvWatchCore) {
  const watchAppStore = useWatchAppStore();
  const subtitleStore = useSubtitleStore();
  const playerStore = usePlayerStore();

  watchCore.subtitle.eventEmitter.on(SubtitleEvents.SubtitleEnableToggle, ({ enable }) => {
    subtitleStore.changeSubtitlesTeacherEnable(enable);
  });

  watchCore.subtitle.eventEmitter.on(SubtitleEvents.SubtitleRealTimeCC, data => {
    if (playerStore.playStatus === PlayStatus.Playing) {
      const emitter = watchAppStore.getPolyvWatchApp()?.getEmitter();
      if (!emitter) return;

      emitter.emit(appEvents.player.SubtitleRealTimeCC, data);
    }
  });
}
