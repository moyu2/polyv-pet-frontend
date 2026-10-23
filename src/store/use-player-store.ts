/**
 * @file 播放器 store
 */
import { isMobile } from '@/assets/utils/browser';
import {
  BarrageSetting,
  BarrageLocationInfo,
  LiveStatus,
  MobileWatchLayout,
  PlayerLogoSetting,
  PlayerWarmUpSetting,
  PlayStatus,
  QualityLevelItem,
  WarmUpType,
  PlvBarrageModule,
  PlvPlayerModule,
  PlayerResolutionRatio,
  PlayerDetectionCbParams,
  PlayerLoadingDetectionType,
  PortraitPlayerScreenType,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { useChannelStore } from './use-channel-store';
import { useLayoutStore } from './use-layout-store';
import { usePlaybackStore } from './use-playback-store';
import { useWatchAppStore } from './use-watch-app-store';
import { useWebviewStore } from './use-webview-store';

export interface PlayerStoreState {
  /** 配置是否使用播放器 */
  playerEnabled: Ref<boolean>;
  /** 能否创建播放器 */
  canRenderPlayer: ComputedRef<boolean>;
  /** 业务逻辑支持播放的模式 */
  isPlayMode: ComputedRef<boolean>;
  /** 播放器 sdk 加载失败 */
  playerSdkLoadError: Ref<boolean>;
  /** 播放器脚本加载中 */
  playerScriptLoading: Ref<boolean>;
  /** 播放器是否已初始化 */
  playerInited: Ref<boolean>;
  /** 是否已开始播放 */
  isPlayStarted: Ref<boolean>;
  /** 当前播放状态 */
  playStatus: Ref<PlayStatus>;
  /**
   * 隐藏播放按钮一次
   * @desc 为了不让 feed 流页面下滑的时候看到播放按钮
   */
  onceHiddenPlayButton: Ref<boolean>;
  /** 播放器暖场设置 */
  warmUpSetting: Ref<PlayerWarmUpSetting>;
  /** 暖场渲染图片 */
  warmUpRenderCover: ComputedRef<string>;
  /** 是否存在暖场视频 */
  existWarmUpVideo: ComputedRef<boolean>;
  /** 是否显示播放器暖场图片 */
  showWarmUpImg: ComputedRef<boolean>;
  /** 是否显示播放器在“音频直播”场景下的占位区域 */
  showAudioLivePlaceholder: ComputedRef<boolean>;
  /** 播放器 logo 设置 */
  logoSetting: Ref<PlayerLogoSetting>;
  /** 弹幕设置 */
  barrageSetting: Ref<BarrageSetting>;
  /** 弹幕显示状态 */
  barrageShow: Ref<boolean>;
  /** 是否支持弹幕速度切换 */
  supportBarrageSpeed: Ref<boolean>;
  /** 弹幕速度 340 | 270 | 200 | 130 | 60 */
  barrageSpeed: Ref<number>;
  /** 弹幕速度档位 */
  barrageSpeedGrade: Ref<number>;
  /** 是否支持弹幕字号切换 */
  supportBarrageSize: Ref<boolean>;
  /** 弹幕字号 */
  barrageSize: Ref<number>;
  /** 弹幕字号档位 */
  barrageSizeGrade: Ref<number>;
  /** 是否支持弹幕字号切换 */
  supportBarrageAlpha: Ref<boolean>;
  /** 弹幕透明度 */
  barrageAlpha: Ref<number>;
  /** 弹幕默认透明度 */
  barrageDefaultAlpha: Ref<number>;
  /** 是否支持弹幕位置切换 */
  supportBarrageLocation: Ref<boolean>;
  /** 弹幕位置选项 */
  barrageLocationSetting: Ref<BarrageLocationInfo[]>;
  /** 弹幕位置当前ID */
  currentBarrageLocationIndex: Ref<number>;
  /** 弹幕位置默认ID */
  barrageLocationDefaultId: Ref<number>;
  /** 弹幕移动端设置是否显示 */
  barrageMobileSettingVisible: Ref<boolean>;
  /** 观看延迟时间，单位：毫秒 */
  delayTime: Ref<number>;
  /** 是否支持无延迟观看 */
  supportLowLatency: Ref<boolean>;
  /** 是否无延迟观看 */
  isLowLatency: Ref<boolean>;
  /** 是否支持刷新 api */
  supportRefresh: Ref<boolean>;
  /** 是否支持自动播放 */
  supportAutoPlay: Ref<boolean>;
  /** 当前音量 */
  currentVolume: Ref<number>;
  /** 总线路数 */
  lineCount: Ref<number>;
  /** 当前线路索引 */
  currentLine: Ref<number>;
  /** 可选的清晰度列表 */
  qualityLevels: Ref<QualityLevelItem[]>;
  /** 当前清晰度级别 */
  currentQualityLevel: Ref<number>;
  /** 可选的倍速列表 */
  rateList: Ref<number[]>;
  /** 当前倍速 */
  currentRate: Ref<number>;
  /** 当前播放时间，单位：秒 */
  currentTime: Ref<number>;
  /** 当前播放总时长，单位：秒 */
  durationTime: Ref<number>;
  /** 视频流宽度，仅用作比例计算 */
  resolutionWidth: Ref<number | undefined>;
  /** 视频流高度，仅用作比例计算 */
  resolutionHeight: Ref<number | undefined>;
  /** 视频流是否为竖状比例 */
  isPortraitResolutionRate: ComputedRef<boolean>;
  /** 暂无直播是否显示 */
  noneLiveVisible: ComputedRef<boolean>;
  /** 播放器控制栏是否允许显示 */
  playerControlEnabled: Ref<boolean>;
  /** 播放器控制栏是否显示 */
  playerControlVisible: Ref<boolean>;
  /** sdk 播放器 UI 控制栏是否显示 */
  sdkPlayerUIControlVisible: Ref<boolean>;
  /** 是否为音频播放器模式。注意，目前只有竖屏在使用 */
  isAudioPlayerMode: Ref<boolean>;
  /** 是否支持时间轴标记 */
  supportTimeAxisMark: Ref<boolean>;
  /** 是否支持直播时移 */
  supportLiveTimeShift: Ref<boolean>;
  /** 直播时是否显示播放按钮， 默认开 */
  stopLivePlayEnabled: Ref<boolean>;
  /** 播放器新版暂停样式开关 */
  newPlayerPauseStyleEnabled: Ref<boolean>;
  /** 回放时是否显示倍速按钮，默认开 */
  playbackMultiplierEnabled: Ref<boolean>;
  /** 回放时是否显示进度条，默认开 */
  playbackProgressBarEnabled: Ref<boolean>;
  /** 回放时是否显示左下角播放/暂停按钮，默认开 */
  playbackShowPlayButtonEnabled: Ref<boolean>;
  /** cdn播放器且处于横屏模板 */
  isCdnWithNormalLayout: Ref<boolean>;
  /** 切换清晰度提示显示状态 */
  switchQualityTipStatus: Ref<SwitchTipsStatus>;
  /** 切换线路提示显示状态 */
  switchLineTipStatus: Ref<SwitchTipsStatus>;
  /** 要切换到的清晰度 */
  switchQualityLevel: Ref<number | undefined>;
  /** 要切换到的线路 */
  switchLineLevel: Ref<number | undefined>;
  /** 显示控制栏 */
  showControl: Ref<boolean>;
  /** 流多轨 Key 值 */
  streamTrackKey: Ref<string>;
  /** 是否支持快进快退 */
  fastForwardBackwardEnabled: Ref<boolean>;
  /** 历史播放进度 */
  historyDuration: Ref<number>;
  /** 播放缓冲监测提示信息 */
  playerLoadingDetectionInfo: Ref<PlayerDetectionCbParams>;
  /** 是否有导播台竖屏流适配类 */
  hasGuidePortraitStreamFitClass: ComputedRef<boolean>;
  /** 是否需要等待执行停止流操作 */
  needWaitToStop: Ref<boolean>;
  /** 竖屏播放器画面适配类型 */
  portraitPlayerScreenType: Ref<PortraitPlayerScreenType>;
}

export enum SwitchTipsStatus {
  Hide = 'hide',
  Switching = 'switching',
  Finish = 'finish',
}

export interface PlayerStoreAction {
  /** 配置播放器 Store 数据 */
  syncPlayerStore: () => void;
  /** 同步暖场设置 */
  syncWarmUpSetting: () => void;
  /** 同步播放器信息 */
  syncPlayerInfo: () => void;
  /** 同步播放缓冲监测提示信息 */
  syncLoadingDetectionInfo: (info: PlayerDetectionCbParams) => void;
}

export interface PlayerStore extends PlayerStoreState, PlayerStoreAction {}

export const usePlayerStore = defineStore<'player', PlayerStore>('player', () => {
  const watchAppStore = useWatchAppStore();
  const channelStore = useChannelStore();
  const playbackStore = usePlaybackStore();
  const layoutStore = useLayoutStore();
  const webViewStore = useWebviewStore();

  const __defaultPlayerInfo = PlvPlayerModule.generateDefaultPlayerInfo();

  /** 配置是否使用播放器 */
  const playerEnabled = ref(true);

  /** 能否创建播放器 */
  const canRenderPlayer = computed(() => {
    // 会议模式下不支持创建播放器
    if (watchAppStore.meetingMode) {
      return false;
    }

    // 小班课场景下不渲染播放器
    if (channelStore.isSmallClassChannel && channelStore.liveStatus === LiveStatus.Live) {
      return false;
    }

    return true;
  });

  const playerSdkLoadError = ref(false);

  /** 播放器脚本加载中 */
  const playerScriptLoading = ref(false);

  /** 播放器是否已初始化 */
  const playerInited = ref(false);

  /** 是否已开始播放 */
  const isPlayStarted = ref(false);

  /** 当前播放状态 */
  const playStatus = ref<PlayStatus>(PlayStatus.Pause);

  /** 隐藏播放按钮一次 */
  const onceHiddenPlayButton = ref(false);

  /** 是否支持无延迟观看 */
  const supportLowLatency = ref(__defaultPlayerInfo.supportLowLatency);

  /** 是否无延迟观看 */
  const isLowLatency = ref(__defaultPlayerInfo.isLowLatency);

  /** 视频流宽度，仅用作比例计算 */
  const resolutionWidth = ref<number>();

  /** 视频流高度，仅用作比例计算 */
  const resolutionHeight = ref<number>();

  /**
   * 播放器比例配置
   */
  const playerResolutionRatio = ref<PlayerResolutionRatio>(
    __defaultPlayerInfo.playerResolutionRatio,
  );

  /** 视频流是否为竖状比例 */
  const isPortraitResolutionRate = computed<boolean>(() => {
    // 只有竖屏模板下，配置播放比例为竖向比例的时候，才强制视频为竖状比例
    if (
      playerResolutionRatio.value === PlayerResolutionRatio.Vertical &&
      layoutStore.mobileWatchLayout === MobileWatchLayout.Portrait
    ) {
      return true;
    }

    const width = unref(resolutionWidth);
    const height = unref(resolutionHeight);
    if (!width || !height) {
      return false;
    }
    return height > width;
  });

  /** 播放器暖场设置 */
  const warmUpSetting = ref<PlayerWarmUpSetting>({});

  /** cdn播放器且处于横屏模板 */
  const isCdnWithNormalLayout = computed<boolean>(() => {
    return !isLowLatency.value && layoutStore.mobileWatchLayout === MobileWatchLayout.Normal;
  });

  /** 存在暖场视频 */
  const existWarmUpVideo = computed(() => {
    return warmUpSetting.value.warmUpType === WarmUpType.Video;
  });

  /** 暖场封面 */
  const warmUpCover = computed(() => {
    return warmUpSetting.value.warmUpImg || '';
  });

  /** 暖场大封面 */
  const warmUpLargeCover = computed(() => {
    return warmUpSetting.value.warmUpLargeImg || '';
  });

  /** 是否有导播台竖屏流适配类 */
  const hasGuidePortraitStreamFitClass = computed(() => {
    return (
      channelStore.liveStatus === LiveStatus.Live && // 直播中
      channelStore.isNewGuideStream && // 是导播台的流
      layoutStore.isPortraitWatchLayout && // 是竖屏布局
      !!resolutionWidth.value &&
      !!resolutionHeight.value &&
      resolutionWidth.value < resolutionHeight.value // 是竖屏流
    );
  });

  /** 暖场渲染图片，既作为暖场图，又作为暖场视频的封面图 */
  const warmUpRenderCover = computed(() => {
    let result = '';
    if (isMobile && isPortraitResolutionRate.value) {
      result = warmUpLargeCover.value;
    } else {
      result = warmUpCover.value;
    }
    return result;
  });

  /** 是否显示播放器暖场图片 */
  const showWarmUpImg = computed<boolean>(() => {
    if (playbackStore.isPlaybacking) {
      return false;
    }

    // 非无延迟 PC 端不展示自定义暖场图
    if (!isLowLatency.value && !isMobile) {
      return false;
    }

    // 没有暖场视频的前提下，正常延迟移动端横屏不在观看页展示自定义暖场图
    if (isCdnWithNormalLayout.value && !existWarmUpVideo.value) {
      return false;
    }

    return (
      // 播放器已初始化
      unref(playerInited) &&
      // 有暖场封面
      !!warmUpRenderCover.value &&
      // 还没开始播放
      !unref(isPlayStarted)
    );
  });

  /** 是否显示播放器在“音频直播”场景下的占位区域 */
  const showAudioLivePlaceholder = computed<boolean>(() => {
    const isPlaying = playStatus.value === PlayStatus.Playing;

    return (
      // 播放器已初始化
      unref(playerInited) &&
      // 处于播放中状态
      isPlaying &&
      // 只有音频直播的情况
      unref(channelStore.isCustomLiveAudioMode)
    );
  });

  /** 播放器 logo 设置 */
  const logoSetting = ref<PlayerLogoSetting>(PlvPlayerModule.generateDefaultPlayerLogoSetting());

  /** 弹幕设置 */
  const barrageSetting = ref<BarrageSetting>(PlvBarrageModule.generateDefaultBarrageSetting());

  /** 弹幕显示状态 */
  const barrageShow = ref(false);

  /** 是否支持弹幕速度切换 */
  const supportBarrageSpeed = ref(__defaultPlayerInfo.supportBarrageSpeed);

  /** 弹幕速度 */
  const barrageSpeed = ref(__defaultPlayerInfo.currentBarrageSpeed);

  /** 弹幕速度档位 */
  const barrageSpeedGrade = ref(__defaultPlayerInfo.barrageSpeedDefaultGrade);

  /** 是否支持弹幕字号切换 */
  const supportBarrageSize = ref(__defaultPlayerInfo.supportBarrageSize);

  /** 弹幕字号 */
  const barrageSize = ref(__defaultPlayerInfo.currentBarrageSize);

  /** 弹幕字号档位 */
  const barrageSizeGrade = ref(__defaultPlayerInfo.barrageSizeDefaultGrade);

  /** 是否支持弹幕透明度切换 */
  const supportBarrageAlpha = ref(__defaultPlayerInfo.supportBarrageAlpha);

  /** 弹幕默认透明度 */
  const barrageAlpha = ref(__defaultPlayerInfo.currentBarrageAlpha);

  /** 弹幕默认透明度 */
  const barrageDefaultAlpha = ref(__defaultPlayerInfo.barrageDefaultAlpha);

  /** 是否支持弹幕位置切换 */
  const supportBarrageLocation = ref(__defaultPlayerInfo.supportBarrageLocation);

  /** 弹幕位置选项 */
  const barrageLocationSetting = ref<BarrageLocationInfo[]>([]);

  /** 弹幕位置当前ID */
  const currentBarrageLocationIndex = ref(__defaultPlayerInfo.currentBarrageLocationIndex);

  /** 弹幕位置默认ID */
  const barrageLocationDefaultId = ref(__defaultPlayerInfo.barrageLocationDefaultId);

  /** 弹幕设置是否显示 */
  const barrageMobileSettingVisible = ref(false);

  /** 业务逻辑支持播放的模式 */
  const isPlayMode = computed<boolean>(() => {
    if (!playerEnabled.value) return false;

    // 研讨会主持进入分组讨论
    if (channelStore.isSeminarHostInGroup) return false;

    // 回放中
    if (playbackStore.isPlaybacking) {
      return true;
    }

    // 直播中
    if (channelStore.liveStatus === LiveStatus.Live) {
      return true;
    }

    // 没有直播中，但有暖场视频
    if (warmUpSetting.value.warmUpType === WarmUpType.Video) {
      return true;
    }

    return false;
  });

  /** 播放器延迟时间 */
  const delayTime = ref(__defaultPlayerInfo.delayTime);

  /** 是否需要等待执行停止流操作 */
  const needWaitToStop = ref(__defaultPlayerInfo.needWaitToStop);

  /** 竖屏播放器画面适配类型 */
  const portraitPlayerScreenType = ref<PortraitPlayerScreenType>(
    __defaultPlayerInfo.portraitPlayerScreenType,
  );

  /** 是否支持刷新 api */
  const supportRefresh = ref(__defaultPlayerInfo.supportRefresh);

  /** 是否支持自动播放 */
  const supportAutoPlay = ref(__defaultPlayerInfo.supportAutoPlay);

  /** 当前音量 */
  const currentVolume = ref(__defaultPlayerInfo.currentVolume);

  /** 总线路数 */
  const lineCount = ref(__defaultPlayerInfo.lineCount);

  /** 当前线路索引 */
  const currentLine = ref(__defaultPlayerInfo.currentLine);

  /** 可选的清晰度列表 */
  const qualityLevels = ref<QualityLevelItem[]>([]);

  /** 当前清晰度级别 */
  const currentQualityLevel = ref<number>(__defaultPlayerInfo.currentQualityLevel);

  /** 可选的倍速列表 */
  const rateList = ref<number[]>(__defaultPlayerInfo.rateList);

  /** 当前倍速 */
  const currentRate = ref(__defaultPlayerInfo.currentRate);

  /** 当前播放时间 */
  const currentTime = ref(__defaultPlayerInfo.currentTime);

  /** 当前播放总时长 */
  const durationTime = ref(__defaultPlayerInfo.durationTime);

  /** 暂无直播是否显示 */
  const noneLiveVisible = computed<boolean>(() => {
    // 直播中
    if (channelStore.liveStatus === LiveStatus.Live) {
      return false;
    }

    // 回放中
    if (playbackStore.isPlaybacking) {
      return false;
    }

    // 非直播中但存在暖场视频
    if (warmUpSetting.value.warmUpType === WarmUpType.Video) {
      return false;
    }

    return (
      // 播放器初始化完毕
      unref(playerInited) &&
      // 没显示暖场
      !unref(showWarmUpImg)
    );
  });

  /** 是否为音频播放器模式 */
  const isAudioPlayerMode = ref(false);

  /** 播放器控制栏是否允许显示 */
  const playerControlEnabled = ref(true);

  /** 播放器控制栏是否显示 */
  const playerControlVisible = ref(false);

  /** sdk 播放器 UI 控制栏是否显示 */
  const sdkPlayerUIControlVisible = ref(false);

  /** 是否支持时间轴标记 */
  const supportTimeAxisMark = ref(__defaultPlayerInfo.supportTimeAxisMark);

  /** 是否支持直播时移 */
  const supportLiveTimeShift = ref(__defaultPlayerInfo.supportLiveTimeShift);

  /** 直播时是否显示播放按钮， 默认开 */
  const stopLivePlayEnabled = ref(__defaultPlayerInfo.stopLivePlayEnabled);

  /** 播放器新版暂停样式开关 */
  const newPlayerPauseStyleEnabled = ref(__defaultPlayerInfo.newPlayerPauseStyleEnabled);

  /** 回放时是否显示倍速按钮，默认开 */
  const playbackMultiplierEnabled = ref(__defaultPlayerInfo.playbackMultiplierEnabled);

  /** 回放时是否显示进度条，默认开 */
  const playbackProgressBarEnabled = ref(__defaultPlayerInfo.playbackProgressBarEnabled);

  /** 回放时是否显示左下角播放/暂停按钮，默认开 */
  const playbackShowPlayButtonEnabled = ref(__defaultPlayerInfo.playbackShowPlayButtonEnabled);

  /** 切换清晰度提示显示状态 */
  const switchQualityTipStatus = ref<SwitchTipsStatus>(SwitchTipsStatus.Hide);

  /** 要切换到清晰度 */
  const switchQualityLevel = ref<number | undefined>();
  /** 要切换到的线路 */
  const switchLineLevel = ref<number | undefined>();

  const switchLineTipStatus = ref<SwitchTipsStatus>(SwitchTipsStatus.Hide);
  /** 显示控制栏 */
  const showControl = ref<boolean>(false);

  /** 流多轨 Key 值 */
  const streamTrackKey = ref<string>('');

  /** 是否支持快进快退 */
  const fastForwardBackwardEnabled = ref(false);

  /** 历史播放进度 */
  const historyDuration = ref(0);

  /** 播放缓冲监测提示信息 */
  const playerLoadingDetectionInfo = ref<PlayerDetectionCbParams>({
    type: PlayerLoadingDetectionType.HIDE,
  });

  /** 同步播放器 Store 数据 */
  function syncPlayerStore() {
    const watchCore = watchAppStore.getWatchCore();

    // 播放器配置无延迟
    if (watchCore.player.supportLowLatency().support) {
      isLowLatency.value = true;
    }

    const _logoSetting = watchCore.player.getPlayerLogoSetting();
    logoSetting.value = _logoSetting;

    const _barrageSetting = watchCore.barrage.getBarrageSetting();
    barrageSetting.value = _barrageSetting;
    barrageShow.value = _barrageSetting.barrageDefaultShow;

    barrageLocationSetting.value = watchCore.barrage.getBarrageLocationSetting();

    syncWarmUpSetting();
    syncFastForwardBackwardEnabled();
  }

  /** 同步暖场设置 */
  function syncWarmUpSetting() {
    const watchCore = watchAppStore.getWatchCore();
    warmUpSetting.value = watchCore.player.getPlayerWarmUpSetting();
  }

  function syncFastForwardBackwardEnabled() {
    const watchCore = watchAppStore.getWatchCore();
    fastForwardBackwardEnabled.value = watchCore.playback.getFastForwardBackwardEnabled();
  }

  /** 同步播放器信息 */
  function syncPlayerInfo(): void {
    const watchCore = watchAppStore.getWatchCore();

    const playerInfo = watchCore.player.getPlayerInfo();

    supportLowLatency.value = playerInfo.supportLowLatency;
    supportRefresh.value = playerInfo.supportRefresh;
    supportAutoPlay.value = playerInfo.supportAutoPlay;

    lineCount.value = playerInfo.lineCount;
    currentLine.value = playerInfo.currentLine;

    qualityLevels.value = playerInfo.qualityLevels;
    currentQualityLevel.value = playerInfo.currentQualityLevel;

    rateList.value = playerInfo.rateList;
    currentRate.value = playerInfo.currentRate;
    currentTime.value = playerInfo.currentTime;
    durationTime.value = playerInfo.durationTime;

    supportBarrageSpeed.value = playerInfo.supportBarrageSpeed;
    barrageSpeed.value = playerInfo.currentBarrageSpeed;
    barrageSpeedGrade.value = playerInfo.barrageSpeedDefaultGrade;

    supportBarrageSize.value = playerInfo.supportBarrageSize;
    barrageSize.value = playerInfo.currentBarrageSize;
    barrageSizeGrade.value = playerInfo.barrageSizeDefaultGrade;

    supportBarrageAlpha.value = playerInfo.supportBarrageAlpha;
    barrageAlpha.value = playerInfo.currentBarrageAlpha;
    barrageDefaultAlpha.value = playerInfo.barrageDefaultAlpha;

    supportBarrageLocation.value = playerInfo.supportBarrageLocation;
    currentBarrageLocationIndex.value = playerInfo.currentBarrageLocationIndex;
    barrageLocationDefaultId.value = playerInfo.barrageLocationDefaultId;

    delayTime.value = playerInfo.delayTime;
    needWaitToStop.value = playerInfo.needWaitToStop;
    playStatus.value =
      !webViewStore.curWebviewPageIsActive || !watchAppStore.isPageActive
        ? PlayStatus.Pause
        : playerInfo.playStatus;
    // isLowLatency.value = playerInfo.isLowLatency;

    stopLivePlayEnabled.value = playerInfo.stopLivePlayEnabled;

    newPlayerPauseStyleEnabled.value = playerInfo.newPlayerPauseStyleEnabled;

    playbackMultiplierEnabled.value = playerInfo.playbackMultiplierEnabled;
    playbackProgressBarEnabled.value = playerInfo.playbackProgressBarEnabled;
    playbackShowPlayButtonEnabled.value = playerInfo.playbackShowPlayButtonEnabled;

    playerResolutionRatio.value = playerInfo.playerResolutionRatio;
    portraitPlayerScreenType.value = playerInfo.portraitPlayerScreenType;

    /**
     * 暂不支持三分屏场景和研讨会场景
     * 暂不支持移动端竖屏
     */
    if (
      !channelStore.isPptChannel &&
      !channelStore.isSeminarChannel &&
      !layoutStore.isPortraitWatchLayout
    ) {
      supportTimeAxisMark.value = playerInfo.supportTimeAxisMark;
      supportLiveTimeShift.value = playerInfo.supportLiveTimeShift;
    }
  }

  /** 同步播放缓冲监测提示信息 */
  function syncLoadingDetectionInfo(info: PlayerDetectionCbParams): void {
    playerLoadingDetectionInfo.value = info;
  }

  return {
    playerSdkLoadError,
    playerScriptLoading,
    playerEnabled,
    canRenderPlayer,
    isAudioPlayerMode,
    isPlayMode,
    playerInited,
    isPlayStarted,
    playStatus,
    onceHiddenPlayButton,
    warmUpSetting,
    existWarmUpVideo,
    warmUpRenderCover,
    showWarmUpImg,
    showAudioLivePlaceholder,
    logoSetting,

    barrageSetting,
    barrageShow,
    supportBarrageSpeed,
    barrageSpeed,
    supportBarrageSize,
    barrageSpeedGrade,
    barrageSize,
    barrageSizeGrade,
    barrageMobileSettingVisible,
    supportBarrageAlpha,
    barrageAlpha,
    barrageDefaultAlpha,
    supportBarrageLocation,
    barrageLocationSetting,
    barrageLocationDefaultId,
    currentBarrageLocationIndex,

    delayTime,
    supportLowLatency,
    isLowLatency,
    supportRefresh,
    supportAutoPlay,
    currentVolume,
    isCdnWithNormalLayout,

    lineCount,
    currentLine,

    qualityLevels,
    currentQualityLevel,

    rateList,
    currentRate,

    currentTime,
    durationTime,

    resolutionWidth,
    resolutionHeight,
    isPortraitResolutionRate,
    noneLiveVisible,
    playerControlEnabled,
    playerControlVisible,
    sdkPlayerUIControlVisible,

    supportTimeAxisMark,
    supportLiveTimeShift,

    stopLivePlayEnabled,
    newPlayerPauseStyleEnabled,
    playbackMultiplierEnabled,
    playbackProgressBarEnabled,
    playbackShowPlayButtonEnabled,

    syncPlayerStore,
    syncWarmUpSetting,
    syncPlayerInfo,
    syncLoadingDetectionInfo,

    switchQualityTipStatus,
    switchLineTipStatus,
    switchQualityLevel,
    switchLineLevel,
    showControl,

    streamTrackKey,
    fastForwardBackwardEnabled,
    historyDuration,

    playerLoadingDetectionInfo,
    hasGuidePortraitStreamFitClass,
    needWaitToStop,
    portraitPlayerScreenType,
  };
});
