/**
 * @file 播放器控制栏 hook
 */
import { translate } from '@/assets/lang';
import { isMobile } from '@/assets/utils/browser';
import { numberAccuracy } from '@/assets/utils/number';
import { useChannelStore } from '@/store/use-channel-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useDocStore } from '@/store/use-doc-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { usePlayerStore } from '@/store/use-player-store';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { LiveStatus, PlayStatus, QualityLevelType } from '@polyv/live-watch-sdk';
import { formatSeconds } from '@polyv/utils/date';
import { computed, unref } from 'vue';
import { appEvents } from '@/app/app-events';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';

/** 播放器设置节点 */
type PlayerSettingItem<V = string> = {
  text: string;
  value: V;
  active: boolean;
};

export const usePlayerControl = () => {
  const channelStore = useChannelStore();
  const playerStore = usePlayerStore();
  const playbackStore = usePlaybackStore();
  const connectMicStore = useConnectMicStore();
  const docStore = useDocStore();
  const subtitleStore = useSubtitleStore();

  const { getEmitter } = useMultiPolyvWatchApp();

  /** 播放按钮提示文案 */
  const playButtonTips = computed<string>(() => {
    let text = '';
    if (playerStore.playStatus === PlayStatus.Pause) {
      text = translate('player.play');
    } else {
      text = translate('player.pause');
    }

    return text;
  });

  const forwardButtonTips = computed<string>(() => {
    return translate('player.fastForwardBackward.forward');
  });

  const backwardButtonTips = computed<string>(() => {
    return translate('player.fastForwardBackward.back');
  });

  /**
   * 直播时隐藏播放按钮，不允许暂停
   */
  const noPauseWhenLive = computed(() => {
    return !playerStore.stopLivePlayEnabled && channelStore.liveStatus === LiveStatus.Live;
  });

  /** 回放时隐藏播放|暂停按钮 */
  const noPauseWhenPlayback = computed(() => {
    return (
      !playerStore.playbackShowPlayButtonEnabled && channelStore.liveStatus === LiveStatus.Playback
    );
  });

  /**
   * 是否显示倍速按钮
   */
  const rateButtonVisible = computed(() => {
    return channelStore.liveStatus === LiveStatus.Playback && playerStore.playbackMultiplierEnabled;
  });

  /** hook 内部使用，最基础的播放器按钮判断逻辑 */
  const __basePlayBtnVisible = computed(() => {
    if (!playerStore.playerControlEnabled) {
      return false;
    }

    // 连麦时隐藏播放器按钮
    if (connectMicStore.isConnectMicing) {
      return false;
    }

    return (
      // 业务逻辑支持播放
      playerStore.isPlayMode &&
      // 播放器初始化完毕
      playerStore.playerInited
    );
  });

  /** 播放器控制栏的播放按钮是否显示 */
  const playerControlPlayBtnVisible = computed<boolean>(() => {
    if (!__basePlayBtnVisible.value) {
      return false;
    }

    const isNotAllowPause = noPauseWhenLive.value || noPauseWhenPlayback.value;

    return !isNotAllowPause;
  });

  /** 正常情况下，大的播放按钮是否显示 */
  const normalPlayButtonVisible = computed<boolean>(() => {
    if (!__basePlayBtnVisible.value) {
      return false;
    }
    return (
      // 暂停中状态或者没有播放过
      !playerStore.isPlayStarted || playerStore.playStatus === PlayStatus.Pause
    );
  });

  /**
   * 是否需要显示大的暂停播放按钮-for 暖场
   */
  const needBigPlayerBtnForWarmup = computed(() => {
    const isPause = playerStore.playStatus === PlayStatus.Pause;

    return playerStore.showWarmUpImg && playerStore.existWarmUpVideo && isPause;
  });

  /** 是否显示手动播放提示 */
  const manualPlayTipsVisible = computed<boolean>(() => {
    return (
      playerStore.playerControlEnabled &&
      channelStore.liveStatus === LiveStatus.Live &&
      !playerStore.supportAutoPlay &&
      !playerStore.isPlayStarted &&
      !connectMicStore.isConnectMicing &&
      !channelStore.isSeminarHostInGroup
    );
  });

  /** RTC 播放器暂停播放的提示 */
  const rtcPlayerPauseTipVisible = computed<boolean>(() => {
    return (
      playerStore.playerControlEnabled &&
      channelStore.liveStatus === LiveStatus.Live &&
      playerStore.isLowLatency &&
      playerStore.isPlayStarted &&
      playerStore.playStatus === PlayStatus.Pause
    );
  });

  /** 是否显示刷新按钮 */
  const refreshButtonVisible = computed<boolean>(() => {
    if (!playerStore.playerControlEnabled) return false;

    if (playerStore.supportLiveTimeShift) return false;

    return playerStore.supportRefresh;
  });

  /** 音量设置是否显示 */
  const volumeSettingVisible = computed<boolean>(() => {
    if (!playerStore.playerControlEnabled) return false;

    return !connectMicStore.isConnectMicing;
  });

  /** 倍速设置是否显示 */
  const rateSettingVisible = computed<boolean>(() => {
    return (
      playerStore.playerControlEnabled &&
      playbackStore.isPlaybacking &&
      playerStore.rateList.length > 0 &&
      rateButtonVisible.value
    );
  });

  const fastForwardBackwardVisible = computed(() => {
    return (
      playerStore.playerControlEnabled &&
      playerStore.fastForwardBackwardEnabled &&
      playbackStore.isPlaybacking
    );
  });

  /** 可选的倍速列表 */
  const rateSettingList = computed(() => {
    const rates = playerStore.rateList;
    const settingList: PlayerSettingItem<number>[] = [];
    rates.forEach(rate => {
      settingList.push({
        text: `${numberAccuracy(rate)}x`,
        value: rate,
        active: rate === playerStore.currentRate,
      });
    });

    return settingList;
  });

  /** 线路设置是否显示 */
  const lineSettingVisible = computed<boolean>(() => {
    return playerStore.lineCount > 1 && channelStore.liveStatus === LiveStatus.Live;
  });

  /** 线路设置列表 */
  const lineSettingList = computed(() => {
    const settingList: PlayerSettingItem<number>[] = [];

    for (let i = 0; i < playerStore.lineCount; i++) {
      settingList.push({
        text: `${translate('player.line')}${i + 1}`,
        value: i,
        active: playerStore.currentLine === i,
      });
    }

    return settingList;
  });

  /** 清晰度设置是否显示 */
  const qualitySettingVisible = computed<boolean>(() => {
    if (playerStore.supportLiveTimeShift && playerStore.currentTime !== playerStore.durationTime)
      return false;

    return (
      playerStore.qualityLevels.length > 1 &&
      [LiveStatus.Live, LiveStatus.Playback].includes(channelStore.liveStatus)
    );
  });

  /** 过滤清晰度切换文本 */
  function filterQualityText(levelType: QualityLevelType): string {
    let text = '未知';
    switch (levelType) {
      case QualityLevelType.auto:
        text = translate('player.quality.auto');
        break;
      case QualityLevelType.sd:
        text = translate('player.quality.sd');
        break;
      case QualityLevelType.hd:
        text = translate('player.quality.hd');
        break;
      case QualityLevelType.fhd:
        text = translate('player.quality.fhd');
        break;
    }

    return text;
  }

  /** 清晰度设置列表 */
  const qualitySettingList = computed(() => {
    const settingList: PlayerSettingItem<number>[] = [];

    for (let i = 0; i < playerStore.qualityLevels.length; i++) {
      const item = playerStore.qualityLevels[i];
      settingList.push({
        text: filterQualityText(item.type),
        value: item.level,
        active: playerStore.currentQualityLevel === item.level,
      });
    }

    return settingList;
  });

  /** 延迟模式切换列表 */
  const latencyModeSettingList = computed<PlayerSettingItem<boolean>[]>(() => {
    return [
      {
        text: translate('player.latencyMode.low'),
        value: true,
        active: playerStore.isLowLatency,
      },
      {
        text: translate('player.latencyMode.normal'),
        value: false,
        active: !playerStore.isLowLatency,
      },
    ];
  });

  /** 延迟模式切换是否显示 */
  const latencyModeSettingVisible = computed<boolean>(() => {
    if (!playerStore.playerControlEnabled) return false;

    return playerStore.supportLowLatency;
  });

  /** 控制栏设置是否显示（PC 端） */
  const playerSettingVisible = computed<boolean>(() => {
    if (!playerStore.playerControlEnabled) {
      return false;
    }

    if (connectMicStore.isConnectMicing) {
      return false;
    }

    return (
      unref(lineSettingVisible) ||
      unref(qualitySettingVisible) ||
      unref(latencyModeSettingVisible) ||
      unref(subtitleStore.replaySubtitleVisible) ||
      unref(subtitleStore.liveSubtitlesEnable)
    );
  });

  /** 是否显示文档视频区域切换按钮 */
  const switchScreenButtonVisible = computed(() => {
    return docStore.canRenderDoc;
  });

  /** 播放器进度条是否显示 */
  const playerProgressVisible = computed<boolean>(() => {
    if (!playerStore.playerControlEnabled) return false;

    /** 回放进度条是否显示 */
    let playbackProgressVisible = playbackStore.isPlaybacking && playerStore.durationTime !== 0;

    if (!playerStore.playbackProgressBarEnabled) {
      playbackProgressVisible = false;
    }

    return playbackProgressVisible || playerStore.supportLiveTimeShift;
  });

  /** 回放时间是否显示 */
  const playbackTimeVisible = computed<boolean>(() => {
    return (
      playerStore.playerControlEnabled &&
      playbackStore.isPlaybacking &&
      playerStore.playbackProgressBarEnabled
    );
  });

  /** 当前播放时间文案 */
  const currentTimeText = computed(() => {
    return formatSeconds(playerStore.currentTime, { segments: 3 });
  });

  /** 播放总时长文案 */
  const durationTimeText = computed(() => {
    return formatSeconds(playerStore.durationTime, { segments: 3 });
  });

  /** 音视频模式切换是否显示 */
  const playerModeSwitcherVisible = computed<boolean>(() => {
    if (!playerStore.playerControlEnabled) return false;

    const isSupportPlayScene =
      channelStore.liveStatus === LiveStatus.Live || playbackStore.isPlaybacking;

    return (
      // 音视频切换配置支持
      channelStore.audioModeSwitchEnabled &&
      // 播放场景支持
      isSupportPlayScene &&
      // 不支持无延迟播放器
      !playerStore.isLowLatency
    );
  });

  /**
   * 弹幕速度切换按钮是否显示
   */
  const barrageSpeedButtonVisible = computed(() => {
    if (!playerStore.playerControlEnabled) return false;

    if (!playerStore.barrageSetting.barrageEnabled) {
      return false;
    }

    // 由于 PC 端的弹幕由页面创建，不使用播放器自带，因此 PC 固定显示
    if (!isMobile) {
      return true;
    }
    return playerStore.supportBarrageSpeed;
  });

  /**
   * 弹幕字号切换按钮是否显示
   */
  const barrageSizeButtonVisible = computed(() => {
    if (!playerStore.playerControlEnabled) return false;

    if (!playerStore.barrageSetting.barrageEnabled) {
      return false;
    }

    // 由于 PC 端的弹幕由页面创建，不使用播放器自带，因此 PC 固定显示
    if (!isMobile) {
      return true;
    }
    return playerStore.supportBarrageSize;
  });

  /**
   * 弹幕透明度切换按钮是否显示
   */
  const barrageAlphaButtonVisible = computed(() => {
    if (!playerStore.playerControlEnabled) return false;

    if (!playerStore.barrageSetting.barrageEnabled) {
      return false;
    }
    return playerStore.supportBarrageAlpha;
  });

  /**
   * 弹幕透位置切换按钮是否显示
   */
  const barrageLocationButtonVisible = computed(() => {
    if (!playerStore.playerControlEnabled) return false;

    if (!playerStore.barrageSetting.barrageEnabled) {
      return false;
    }
    return playerStore.supportBarrageLocation;
  });

  /**
   * 弹幕配置是否可用
   */
  const barrageSettingEnabled = computed(() => {
    return (
      barrageSpeedButtonVisible.value ||
      barrageSizeButtonVisible.value ||
      barrageAlphaButtonVisible.value
    );
  });

  /**
   * 直播时移"返回直播"按钮是否显示
   */
  const timeShiftReturnLiveButtonVisible = computed(() => {
    return (
      playerStore.playerControlEnabled &&
      playerStore.supportLiveTimeShift &&
      channelStore.liveStatus === LiveStatus.Live &&
      playerStore.currentTime !== playerStore.durationTime
    );
  });

  /** 添加历史播放进度提示监听 */
  const addHistoryTipsListener = () => {
    const showHistoryTips = (duration: number) => {
      playerStore.$patch({
        historyDuration: duration || 0,
      });
    };

    // 历史播放进度提示
    getEmitter().on(appEvents.player.ShowHistoryTips, showHistoryTips);

    return {
      dispose: () => {
        getEmitter().off(appEvents.player.ShowHistoryTips, showHistoryTips);
      },
    };
  };

  return {
    playButtonTips,
    playerControlPlayBtnVisible,
    needBigPlayerBtnForWarmup,
    normalPlayButtonVisible,
    manualPlayTipsVisible,
    rtcPlayerPauseTipVisible,
    refreshButtonVisible,
    volumeSettingVisible,

    rateSettingVisible,
    rateSettingList,

    lineSettingVisible,
    lineSettingList,

    filterQualityText,
    qualitySettingVisible,
    qualitySettingList,

    latencyModeSettingList,
    latencyModeSettingVisible,

    playerSettingVisible,
    switchScreenButtonVisible,
    playerProgressVisible,
    playbackTimeVisible,
    currentTimeText,
    durationTimeText,

    playerModeSwitcherVisible,

    barrageSpeedButtonVisible,
    barrageSizeButtonVisible,
    barrageAlphaButtonVisible,
    barrageLocationButtonVisible,
    barrageSettingEnabled,

    timeShiftReturnLiveButtonVisible,

    noPauseWhenLive,
    noPauseWhenPlayback,
    fastForwardBackwardVisible,
    forwardButtonTips,
    backwardButtonTips,

    addHistoryTipsListener,
  };
};

/**
 * 播放器控制栏连麦控制 hook
 */
export const usePlayerControlConnectMic = () => {
  const connectMicStore = useConnectMicStore();

  /** 主讲头衔 */
  const masterActor = computed(() => {
    if (connectMicStore.masterIsSelf) {
      return translate('connectMic.me');
    }
    if (connectMicStore.masterMicItem?.isTeacher) {
      return translate('connectMic.teacher');
    }

    return '';
  });

  /**
   * 主讲昵称
   */
  const masterNickname = computed(() => {
    const nickname = connectMicStore.masterMicItem?.nickname || '';
    const actor = unref(masterActor) ? `(${unref(masterActor)})` : '';
    return `${nickname}${actor}`;
  });

  return {
    masterActor,
    masterNickname,
  };
};
