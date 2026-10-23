/**
 * @file 播放器操作 hook
 */
import { appEvents } from '@/app/app-events';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { usePlayerStore, SwitchTipsStatus } from '@/store/use-player-store';
import { PlayStatus, PlayerEvents, LoggerName } from '@polyv/live-watch-sdk';
import debounce from 'lodash-es/debounce';
import { usePlayerControl } from './use-player-control';
import { setLatencySettings } from '../latency-settings-storage';

/**
 * 播放器操作 hook
 */
export const usePlayerAction = () => {
  const playerStore = usePlayerStore();
  const layoutStore = useLayoutStore();
  const connectMicStore = useConnectMicStore();

  const { getWatchCore, getEmitter } = useMultiPolyvWatchApp();

  const { noPauseWhenLive, noPauseWhenPlayback, playerProgressVisible } = usePlayerControl();

  /**
   * 是否不允许处理
   */
  function isNotAllowAction(): boolean {
    return !playerStore.isPlayMode || !playerStore.playerInited;
  }

  function isNotAllowPause(): boolean {
    return noPauseWhenLive.value || noPauseWhenPlayback.value;
  }

  // ========= 播放相关 ==========

  /** 播放 */
  function toPlay(): void {
    if (isNotAllowAction()) {
      return;
    }

    // 避免连麦中播放播放器导致重音
    if (connectMicStore.isConnectMicing) {
      console.warn('isConnectMicing, player can not to play');
      return;
    }

    getWatchCore().player.play();
  }

  /** 如果当前是暂停则调用播放 */
  function toTryPlay() {
    if (playerStore.playStatus === PlayStatus.Pause) {
      toPlay();
    }
  }

  // ========= 暂停相关 ==========

  /** 暂停 */
  function toPause(): void {
    if (isNotAllowAction()) {
      return;
    }

    getWatchCore().player.pause();
  }

  /**
   * 不显示大播放按钮，并且不显示左下角播放暂停按钮，暂停操作失效
   * */
  function toPauseInLimit(): void {
    if (isNotAllowPause()) {
      return;
    }

    toPause();
  }

  /** 停止拉流 */
  function toStop(): void {
    if (isNotAllowAction()) {
      return;
    }

    getWatchCore().player.stop();
  }

  function forcePausePlay(
    opts: { onceHiddenPlayButton: boolean } = { onceHiddenPlayButton: false },
  ) {
    if (isNotAllowAction()) {
      return;
    }

    playerStore.$patch({ onceHiddenPlayButton: opts.onceHiddenPlayButton });

    // 无延迟暂停也会拉流，所以需要暂停拉流而不是暂停
    if (playerStore.isLowLatency) {
      const needWaitToStop = playerStore.needWaitToStop;
      if (needWaitToStop) {
        const waitTime = 2000;
        window.setTimeout(() => {
          toStop();
        }, waitTime);
      } else {
        toStop();
      }
      toPause();
    } else {
      toPause();
    }
  }

  // ========= 播放暂停相关 ==========

  /** 冻结视频的播放 */
  function toFreezePlay(isFreeze: boolean) {
    getWatchCore().player.freezePlay(isFreeze);
  }

  /** 刷新 */
  function toRefresh(): void {
    if (isNotAllowAction()) {
      return;
    }

    getWatchCore().player.refresh();
  }

  /** 切换播放状态 */
  function toTogglePlay(): void {
    if (playerStore.playStatus === PlayStatus.Pause) {
      toPlay();
    } else {
      toPause();
    }
  }

  /**
   * 不显示大播放按钮，并且不显示左下角播放暂停按钮，部分操作失效:
   * 1.点击播放器区域
   * 2.键盘空格按键
   * 3.竖屏双击屏幕
   * */
  function toTogglePlayInLimit(): void {
    // 播放不受限制
    if (playerStore.playStatus === PlayStatus.Pause) {
      toPlay();
      return;
    }

    if (isNotAllowPause()) {
      return;
    }

    toTogglePlay();
  }

  // ========= 音量相关 ==========

  /** 防抖设置音量 */
  const setVolumeDebounce = debounce((volume: number) => {
    getWatchCore().player.setVolume(volume);
  }, 300);

  /** 设置音量 */
  function toChangeVolume(volume = 1): void {
    if (volume < 0) {
      volume = 0;
    }
    if (volume > 1) {
      volume = 1;
    }
    playerStore.$patch({
      currentVolume: volume,
    });
    setVolumeDebounce(volume);
  }

  /**
   * 递增音量
   * @param diff 增加的音量，默认：0.05
   */
  function toIncreaseVolume(diff = 0.05) {
    const currentVolume = playerStore.currentVolume + diff;
    toChangeVolume(currentVolume);
  }

  /**
   * 递减音量
   * @param diff 减少的音量，默认：0.05
   */
  function toReductionVolume(diff = 0.05) {
    const currentVolume = playerStore.currentVolume - diff;
    toChangeVolume(currentVolume);
  }

  // ========= 弹幕相关 ==========

  /** 切换显示/隐藏弹幕移动端设置弹窗 */
  function toToggleBarrageMobileSettingVisible(toShow: boolean) {
    playerStore.$patch({
      barrageMobileSettingVisible: toShow,
    });
  }

  /** 切换弹幕显示 */
  function toToggleBarrageShow(): void {
    playerStore.$patch({
      barrageShow: !playerStore.barrageShow,
    });
    getWatchCore().player.setBarrageShow(playerStore.barrageShow);
  }

  /** 切换弹幕速度 */
  function toChangeBarrageSpeed(speed: number) {
    playerStore.$patch({
      barrageSpeed: speed,
    });
    getWatchCore().player.setBarrageSpeed(speed);
  }

  /** 切换弹幕字号 */
  function toChangeBarrageSize(size: number) {
    playerStore.$patch({
      barrageSize: size,
    });
    getWatchCore().player.setBarrageSize(size);
  }

  /** 切换弹幕透明度 */
  function toChangeBarrageAlpha(alpha: number) {
    playerStore.$patch({
      barrageAlpha: alpha,
    });
    getWatchCore().player.setBarrageAlpha(alpha);
  }

  /** 切换弹幕位置 */
  function toChangeBarrageLocation(index: number) {
    playerStore.$patch({
      currentBarrageLocationIndex: index,
    });
    getWatchCore().player.setBarrageLocation(index);
  }

  // ========= 多线路相关 ==========

  let lineSwitchingTimer: number | undefined;
  let lineFinishTimer: number | undefined;

  function handleLineChange() {
    window.clearTimeout(lineSwitchingTimer);
    playerStore.$patch({
      switchLineTipStatus: SwitchTipsStatus.Finish,
    });

    lineFinishTimer = window.setTimeout(() => {
      if (playerStore.switchLineTipStatus === SwitchTipsStatus.Finish) {
        playerStore.$patch({
          switchLineTipStatus: SwitchTipsStatus.Hide,
        });
      }
    }, 3000);
  }

  function listenLineChangeToShowTips(line: number) {
    const playerModule = getWatchCore().player;

    window.clearTimeout(lineSwitchingTimer);
    window.clearTimeout(lineFinishTimer);

    playerStore.$patch({
      switchLineTipStatus: SwitchTipsStatus.Switching,
      switchLineLevel: line,
    });

    playerModule.eventEmitter.off(PlayerEvents.LineChange, handleLineChange);
    playerModule.eventEmitter.once(PlayerEvents.LineChange, handleLineChange);

    lineSwitchingTimer = window.setTimeout(() => {
      if (playerStore.switchLineTipStatus === SwitchTipsStatus.Switching) {
        playerStore.$patch({
          switchLineTipStatus: SwitchTipsStatus.Hide,
        });
      }
    }, 3000);
  }

  /** 切换线路 */
  function toChangeLine(line: number): void {
    listenLineChangeToShowTips(line);
    getWatchCore().player.changeLine(line);
    toTryPlay();
  }

  // ========= 清晰度相关 ==========

  let levelSwitchingTimer: number | undefined;
  let levelFinishTimer: number | undefined;

  function handleQualityLevelChange() {
    window.clearTimeout(levelSwitchingTimer);

    playerStore.$patch({
      switchQualityTipStatus: SwitchTipsStatus.Finish,
      switchQualityLevel: getWatchCore().player.getCurrentQualityLevel(),
    });

    levelFinishTimer = window.setTimeout(() => {
      if (playerStore.switchQualityTipStatus === SwitchTipsStatus.Finish) {
        playerStore.$patch({
          switchQualityTipStatus: SwitchTipsStatus.Hide,
        });
      }
    }, 3000);
  }

  function listenLevelChangeToShowTips(level: number) {
    const playerModule = getWatchCore().player;

    window.clearTimeout(levelSwitchingTimer);
    window.clearTimeout(levelFinishTimer);

    playerStore.$patch({
      switchQualityTipStatus: SwitchTipsStatus.Switching,
      switchQualityLevel: level,
    });

    playerModule.eventEmitter.off(PlayerEvents.QualityLevelChange, handleQualityLevelChange);
    playerModule.eventEmitter.once(PlayerEvents.QualityLevelChange, handleQualityLevelChange);

    levelSwitchingTimer = window.setTimeout(() => {
      if (playerStore.switchQualityTipStatus === SwitchTipsStatus.Switching) {
        playerStore.$patch({
          switchQualityTipStatus: SwitchTipsStatus.Hide,
        });
      }
    }, 3000);
  }

  function toChangeQualityLevel(level: number) {
    listenLevelChangeToShowTips(level);

    getWatchCore().player.changeQualityLevel(level);
    toTryPlay();
  }

  // ========= 倍速相关 ==========

  /** 切换倍速 */
  function toChangeRate(rate: number): void {
    getWatchCore().player.changeRate(rate);
    toTryPlay();
  }

  // ========= 播放进度相关 ==========

  /**
   * 合并高频点击的快进/快退操作，降低频繁 seek 带来的抖动。
   * 新接口使用，不影响原有 toForwardVideo / toBackOffVideo 行为。
   */
  const SEEK_BUFFER_DELAY_MS = 300; // trailing debounce duration for buffered seek
  let pendingSeekOffset = 0;
  let pendingSeekTimer: number | null = null;
  let pauseAfterSeekAttached = false;

  const clampSeekTime = (time: number) => {
    if (time < 0) return 0;
    if (time > playerStore.durationTime) return Math.max(playerStore.durationTime - 0.001, 0);
    return time;
  };

  function attachPauseAfterSeekOnce() {
    if (pauseAfterSeekAttached) return;
    pauseAfterSeekAttached = true;

    const playerModule = getWatchCore().player;
    playerModule.eventEmitter.once(PlayerEvents.PlayerPlaying, () => {
      pauseAfterSeekAttached = false;
      // 下一帧暂停，避免和 seek 竞争
      window.setTimeout(() => {
        toPause();
      }, 0);
    });
  }

  function scheduleSeek(offset: number, seekAfterPause: boolean) {
    pendingSeekOffset += offset;
    // trailing debounce：每次点击都会重置计时，安静一段时间后统一 seek
    pendingSeekTimer && clearTimeout(pendingSeekTimer);

    if (seekAfterPause) attachPauseAfterSeekOnce();

    pendingSeekTimer = window.setTimeout(() => {
      pendingSeekTimer = null;

      const target = clampSeekTime(playerStore.currentTime + pendingSeekOffset);
      pendingSeekOffset = 0;

      toSeekVideo(target);
      playerStore.$patch({ currentTime: target });
    }, SEEK_BUFFER_DELAY_MS);
  }

  /** 设置播放进度 */
  function toSeekVideo(time: number): void {
    if (time > playerStore.durationTime) {
      time = playerStore.durationTime;
    }
    getWatchCore().player.seekVideo(time);
  }

  /**
   * 视频前进（原逻辑，立即 seek）
   * @param second 秒数，默认：15
   */
  function toForwardVideo(second = 15, seekAfterPause = false) {
    if (seekAfterPause) attachPauseAfterSeekOnce();

    let currentTime = playerStore.currentTime + second;
    if (currentTime > playerStore.durationTime) {
      currentTime = playerStore.durationTime - 1;
    }
    toSeekVideo(currentTime);
    playerStore.$patch({
      currentTime,
    });
  }

  /**
   * 视频前进（合并高频点击，批量 seek）
   */
  function toForwardVideoBuffered(second = 15, seekAfterPause = false) {
    scheduleSeek(second, seekAfterPause);
  }

  /**
   * 不显示进度条，键盘左右按键seek对应失效
   */
  function toForwardVideoInLimit() {
    if (!playerProgressVisible.value) return;

    toForwardVideo();
  }

  /**
   * 视频后退（原逻辑，立即 seek）
   * @param second 秒数，默认：15
   */
  function toBackOffVideo(second = 15, seekAfterPause = false) {
    if (seekAfterPause) attachPauseAfterSeekOnce();

    let currentTime = playerStore.currentTime - second;
    if (currentTime < 0) {
      currentTime = 0;
    }

    toSeekVideo(currentTime);
    playerStore.$patch({
      currentTime,
    });
  }

  /**
   * 视频后退（合并高频点击，批量 seek）
   */
  function toBackOffVideoBuffered(second = 15, seekAfterPause = false) {
    scheduleSeek(-second, seekAfterPause);
  }

  /**
   * 不显示进度条，键盘左右按键seek对应失效
   */
  function toBackOffVideoInLimit() {
    if (!playerProgressVisible.value) return;

    toBackOffVideo();
  }

  // ========= 其他相关的业务 ==========

  /** 重新播放 */
  function toRestart(): void {
    toSeekVideo(0);
    toPlay();
  }

  /** 直播时移-返回直播 */
  function toReturnLive() {
    toSeekVideo(-1);
  }

  /** 切换无延迟播放 */
  function toSetLowLowLatency(isLowLatency = true) {
    playerStore.$patch({
      isLowLatency,
      isAudioPlayerMode: false,
    });
    layoutStore.$patch({
      mobilePlayerIsPageFullscreen: false,
    });

    // 保存延迟选项到 localStorage
    setLatencySettings({ isLowLatency });

    window.setTimeout(() => {
      getEmitter().emit(appEvents.player.ResetUpPlayer);
    }, 0);
    getWatchCore().logger.info(
      LoggerName.LowLatencyPlayer,
      'low-latency-player-switch',
      String(isLowLatency),
    );
  }

  /** 切换移动端播放器页面全屏 */
  function toToggleMobilePageFullscreen() {
    layoutStore.$patch({
      mobilePlayerIsPageFullscreen: !layoutStore.mobilePlayerIsPageFullscreen,
    });
  }

  /** 退出网页全屏 */
  function toExitWebPageFullscreen() {
    if (playerStore.isLowLatency) {
      toToggleMobilePageFullscreen();
    } else {
      getWatchCore().player.exitWebPageFullScreen();
    }
  }

  return {
    toPlay,
    toTryPlay,

    toPause,
    toPauseInLimit,
    toStop,
    forcePausePlay,

    toFreezePlay,
    toRefresh,
    toTogglePlay,
    toTogglePlayInLimit,

    toChangeVolume,
    toIncreaseVolume,
    toReductionVolume,

    toToggleBarrageMobileSettingVisible,
    toToggleBarrageShow,
    toChangeBarrageSpeed,
    toChangeBarrageSize,
    toChangeBarrageAlpha,
    toChangeBarrageLocation,

    toChangeLine,

    toChangeQualityLevel,
    listenLevelChangeToShowTips,

    toChangeRate,

    toSeekVideo,
    toForwardVideo,
    toForwardVideoBuffered,
    toForwardVideoInLimit,
    toBackOffVideo,
    toBackOffVideoBuffered,
    toBackOffVideoInLimit,

    toRestart,
    toReturnLive,
    toSetLowLowLatency,

    toToggleMobilePageFullscreen,
    toExitWebPageFullscreen,
  };
};
