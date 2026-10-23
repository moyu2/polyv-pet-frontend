import { appEvents } from '@/app/app-events';
import { usePlaybackStore } from '@/store/use-playback-store';
import { usePlayerStore } from '@/store/use-player-store';
import { usePlaybackList } from '@/components/page-watch-common/playback-list/use-playback-list';
import { useLayoutStore } from '@/store/use-layout-store';
import {
  FullScreenMode,
  PlaybackMode,
  PlaybackTarget,
  PlayerEvents,
  PlayerEventsRelations,
  PlayStatus,
} from '@polyv/live-watch-sdk';
import { onBeforeUnmount } from 'vue';
import { usePlayerAction } from './use-player-action';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { useWebviewStore } from '@/store/use-webview-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { isWxMiniProgram } from '@/assets/utils/browser';

/**
 * 播放器相关事件 hook
 */
export const usePlayerEvent = () => {
  const channelInfoStore = useChannelInfoStore();
  const playerStore = usePlayerStore();
  const playbackStore = usePlaybackStore();
  const layoutStore = useLayoutStore();
  const webviewStore = useWebviewStore();
  const watchAppStore = useWatchAppStore();

  const { toToggleBarrageMobileSettingVisible, forcePausePlay, toFreezePlay } = usePlayerAction();
  const { getEmitter, getWatchCore } = useMultiPolyvWatchApp();
  const { onClickPlaybackItem } = usePlaybackList();
  const watchCore = getWatchCore();

  function onPlayerConfigLoaded(): void {
    if (!webviewStore.curWebviewPageIsActive) {
      toFreezePlay(true);
    }
  }

  function onPlayerInited(): void {
    playerStore.$patch({
      playerInited: true,
    });

    if (!webviewStore.curWebviewPageIsActive) {
      forcePausePlay();
      toFreezePlay(true);
    }

    if (watchAppStore.isPageActive) {
      toFreezePlay(false);
    } else {
      forcePausePlay();
    }
  }

  function onPlayerPlaying(): void {
    if (!webviewStore.curWebviewPageIsActive || !watchAppStore.isPageActive) {
      playerStore.$patch({
        isPlayStarted: false,
        playStatus: PlayStatus.Pause,
      });
      forcePausePlay();
      return;
    }

    if (!playerStore.isPlayMode) {
      console.warn('not enabled on PlayerPlaying');
      return;
    }

    playerStore.$patch({
      isPlayStarted: true,
      playStatus: PlayStatus.Playing,
    });
  }

  function onHistoryPlay(evt: { historyTime: number }): void {
    getEmitter().emit(appEvents.player.ShowHistoryTips, evt.historyTime);
  }

  /** 处理回放播放结束 */
  async function onPlaybackOver() {
    const toPlayTarget = async (target: PlaybackTarget) => {
      await onClickPlaybackItem(target);
    };

    // 处理学习时长弹窗
    if (channelInfoStore.learningStatsDialogEnabled) {
      const videoDurationTime = watchCore.player.getDurationTime();
      getEmitter().emit(appEvents.global.OpenLearningStatDialog, {
        videoDurationTime,
      });
    }

    // 单个回放-循环播放
    if (
      playbackStore.playbackMode === PlaybackMode.Single &&
      playbackStore.currentPlaybackTarget &&
      playbackStore.loopPlayEnabled
    ) {
      // 单个回放结束后，如果处于聊天重放，就不再重复播放了
      if (playbackStore.chatReplayEnabled) {
        return;
      }

      await toPlayTarget(playbackStore.currentPlaybackTarget);
      return;
    }

    // 回放列表为空
    if (playbackStore.playbackList.length === 0) {
      return;
    }

    let playbackTarget: PlaybackTarget | undefined;
    const playbackLength = playbackStore.playbackList.length;
    const currentIndex = playbackStore.playbackList.findIndex(target => {
      return target.playbackId === playbackStore.currentPlaybackTarget?.playbackId;
    });

    if (currentIndex === playbackLength - 1) {
      // 当前播放的是列表的最后一个
      if (playbackStore.isNoMore) {
        // 已经拿完了回放列表，则播放第一个
        if (playbackStore.loopPlayEnabled) {
          playbackTarget = playbackStore.playbackList[0];
        }
      } else {
        // 加载下一页
        await playbackStore.loadNextPlaybackList();
        const nextTarget = playbackStore.playbackList[currentIndex + 1];
        playbackTarget = nextTarget;
      }
    } else {
      // 下一个是在本页
      const nextTarget = playbackStore.playbackList[currentIndex + 1];
      playbackTarget = nextTarget;
    }

    // 获取新的播放目标来播放
    if (playbackTarget) {
      await toPlayTarget(playbackTarget);
    }
  }

  /** 音量修改 */
  function onVolumeChanged() {
    const currentVolume = watchCore.player.getCurrentVolume();
    playerStore.$patch({ currentVolume });
  }

  /** 调起弹幕设置弹窗 */
  function onBarrageSettingClick() {
    toToggleBarrageMobileSettingVisible(true);
  }

  /** 全屏 */
  function onToggleFullScreen({
    isPlayerFullscreen,
    fullScreenMode,
  }: PlayerEventsRelations[PlayerEvents.ToggleFullScreen]) {
    layoutStore.$patch({
      mobileNormalLatencyPlayerIsFullscreen: isPlayerFullscreen,
    });

    // 正常延迟播放器网页全屏时需要同步处理标识位
    if (fullScreenMode === FullScreenMode.WebHtml) {
      layoutStore.$patch({
        mobilePlayerIsPageFullscreen: isPlayerFullscreen,
      });
    }
  }

  /** sdk 播放器 UI 控制栏显隐 */
  function onSdkPlayerUIControlVisible(
    data: PlayerEventsRelations[PlayerEvents.PlayerUIControlDisplay],
  ) {
    playerStore.$patch({
      sdkPlayerUIControlVisible: data.visible,
    });
  }

  /** 使用fullscreen api 全屏change事件，需后台配置增强全屏功能的开关后，此事件回调才会生效 */
  function onPlayerFullscreenChange(
    data: PlayerEventsRelations[PlayerEvents.PlayerFullscreenChange],
  ) {
    document.body.classList.toggle('g-page-player-system-fullscreen', data.isFullscreen);

    // 微信小程序下，退出全屏后重新计算高度，解决部分机型问题
    if (isWxMiniProgram && !data.isFullscreen) {
      setTimeout(() => {
        getEmitter().emit(appEvents.global.MobileLayoutComputedSize);
      }, 1000);
    }
  }

  /** 绑定播放器事件 */
  function bindPlayerEvents() {
    unbindPlayerEvents();

    watchCore.player.eventEmitter.on(PlayerEvents.PlayerConfigLoaded, onPlayerConfigLoaded);
    watchCore.player.eventEmitter.on(PlayerEvents.PlayerInited, onPlayerInited);
    watchCore.player.eventEmitter.on(PlayerEvents.PlayerPlaying, onPlayerPlaying);
    watchCore.player.eventEmitter.on(PlayerEvents.HistoryPlay, onHistoryPlay);
    watchCore.player.eventEmitter.on(PlayerEvents.PlaybackOver, onPlaybackOver);
    watchCore.player.eventEmitter.on(PlayerEvents.VolumeChange, onVolumeChanged);
    watchCore.player.eventEmitter.on(PlayerEvents.BarrageSettingClick, onBarrageSettingClick);
    watchCore.player.eventEmitter.on(PlayerEvents.ToggleFullScreen, onToggleFullScreen);
    watchCore.player.eventEmitter.on(
      PlayerEvents.PlayerUIControlDisplay,
      onSdkPlayerUIControlVisible,
    );
    watchCore.player.eventEmitter.on(PlayerEvents.PlayerFullscreenChange, onPlayerFullscreenChange);
  }

  /** 解绑播放器事件 */
  function unbindPlayerEvents() {
    watchCore.player.eventEmitter.off(PlayerEvents.PlayerConfigLoaded, onPlayerConfigLoaded);
    watchCore.player.eventEmitter.off(PlayerEvents.PlayerInited, onPlayerInited);
    watchCore.player.eventEmitter.off(PlayerEvents.PlayerPlaying, onPlayerPlaying);
    watchCore.player.eventEmitter.off(PlayerEvents.HistoryPlay, onHistoryPlay);
    watchCore.player.eventEmitter.off(PlayerEvents.PlaybackOver, onPlaybackOver);
    watchCore.player.eventEmitter.off(PlayerEvents.VolumeChange, onVolumeChanged);
    watchCore.player.eventEmitter.off(PlayerEvents.BarrageSettingClick, onBarrageSettingClick);
    watchCore.player.eventEmitter.off(PlayerEvents.ToggleFullScreen, onToggleFullScreen);
    watchCore.player.eventEmitter.off(
      PlayerEvents.PlayerUIControlDisplay,
      onSdkPlayerUIControlVisible,
    );
    watchCore.player.eventEmitter.off(
      PlayerEvents.PlayerFullscreenChange,
      onPlayerFullscreenChange,
    );
  }

  onBeforeUnmount(() => {
    unbindPlayerEvents();
  });

  return {
    bindPlayerEvents,
    unbindPlayerEvents,
  };
};
