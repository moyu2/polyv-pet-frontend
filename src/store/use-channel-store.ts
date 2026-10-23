/**
 * @file 频道 store
 */
import {
  ChannelAudioMode,
  ChannelScene,
  ChannelStreamTrackConfig,
  ChannelStreamTrackType,
  LiveStatus,
  SmsConfig,
  StreamType,
  TeacherInfoType,
  ChannelNewScene,
  ChannelAnchorInfo,
  ExternalTrialWatchInfo,
  ProductIconConfig,
  DescShowPosition,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { useWatchAppStore } from './use-watch-app-store';

export interface ChannelStoreState {
  /** 频道号 */
  channelId: Ref<string>;
  /** 频道直播状态 */
  liveStatus: Ref<LiveStatus>;
  /** 当前最新的直播场次号 */
  currentSessionId: Ref<string>;
  /** 观看页地址 */
  watchUrl: Ref<string>;
  /** 是否为普通直播频道 */
  isAloneChannel: ComputedRef<boolean>;
  /** 是否为三分屏频道 */
  isPptChannel: ComputedRef<boolean>;
  /** 是否为研讨会频道 */
  isSeminarChannel: ComputedRef<boolean>;
  /** 研讨会频道是否处于"内部研讨"状态  */
  privateSeminarChannel: ComputedRef<boolean>;
  /** 研讨会主持是否在分组讨论中 */
  isSeminarHostInGroup: Ref<boolean>;
  /** 研讨会白板课件开关，关闭时研讨会频道不展示文档 */
  seminarWhiteboardCoursewareEnabled: Ref<boolean>;
  /** 渠道 id */
  promoteId: Ref<string | undefined>;
  /** 音频模式 */
  audioMode: Ref<ChannelAudioMode>;
  /** 是否可以“切换音视频模式” */
  audioModeSwitchEnabled: Ref<boolean>;
  /** 当前频道是否为特殊的音频直播 */
  isCustomLiveAudioMode: ComputedRef<boolean>;
  /** 讲师信息 */
  teacherInfo: Ref<TeacherInfoType | undefined>;
  /** 关联的主讲详情 */
  anchorDetail: Ref<ChannelAnchorInfo | undefined>;
  /** 当前直播推流类型 */
  currentStreamType: Ref<StreamType | undefined>;
  /** 是否导播台推流 */
  isNewGuideStream: Ref<boolean>;
  /** 流多轨配置 */
  streamTrackConfig: Ref<ChannelStreamTrackConfig | undefined>;
  /** 是否支持流多轨 */
  supportMultiStreamTrack: ComputedRef<boolean>;
  /** 短信功能全局配置 */
  smsConfig: Ref<SmsConfig>;
  /** 在线列表开关 */
  onlineListEnabled: Ref<boolean>;
  /** 管理员公告跑马灯开关 */
  managerBulletinMarqueeEnabled: Ref<boolean>;
  /** 是否支持渲染管理员公告跑马灯 */
  managerBulletinMarqueeRenderEnabled: ComputedRef<boolean>;
  /** 是否压缩直播介绍中的内容图片 */
  compressImageEnabled: Ref<boolean>;
  /** PC观看页直播介绍位置（bottomMenu-底部菜单 asideMenu-右侧菜单） */
  descShowPosition: Ref<DescShowPosition>;
  /** 是否为小班课场景 */
  isSmallClassChannel: ComputedRef<boolean>;
  /** 商品库横屏位置 */
  productEntryLandscapePosition: Ref<string>;
  /** 商品库图标配置 */
  productIconConfig: Ref<ProductIconConfig | undefined>;
  /** 外部授权试看信息 */
  externalTrialWatch: Ref<ExternalTrialWatchInfo | null>;
}

export interface ChannelStoreActions {
  /** 同步频道 Store 数据 */
  syncChannelStore: () => void;
  /** 同步外部授权试看信息 */
  syncExternalTrialWatch: () => void;
}

/** 频道 store */
export interface ChannelStore extends ChannelStoreState, ChannelStoreActions {}

export const useChannelStore = defineStore<'channel', ChannelStore>('channel', () => {
  const watchAppStore = useWatchAppStore();

  /** 频道号 */
  const channelId = ref('');

  /** 频道直播状态 */
  const liveStatus = ref<LiveStatus>(LiveStatus.End);

  /** 当前直播场次号 */
  const currentSessionId = ref('');

  /** 观看页地址 */
  const watchUrl = ref('');

  /** 频道场景 */
  const channelScene = ref<ChannelScene>();

  /**
   * 频道直播场景
   */
  const channelNewScene = ref<ChannelNewScene>();

  /** 是否为普通直播频道 */
  const isAloneChannel = computed(() => unref(channelScene) === ChannelScene.Alone);

  /** 是否为三分屏频道 */
  const isPptChannel = computed(() => unref(channelScene) === ChannelScene.Ppt);

  /** 是否为研讨会频道 */
  const isSeminarChannel = computed(() => unref(channelScene) === ChannelScene.Seminar);

  /** 是否为小班课场景频道 */
  const isSmallClassChannel = computed(() => unref(channelNewScene) === ChannelNewScene.SmallClass);

  /** 研讨会频道是否处于"内部研讨"状态 */
  const privateSeminarChannel = computed(() => {
    if (!isSeminarChannel.value) return false;

    return liveStatus.value !== LiveStatus.Live && liveStatus.value !== LiveStatus.Playback;
  });

  /** 研讨会主持是否在分组讨论中 */
  const isSeminarHostInGroup = ref(false);

  /** 研讨会白板课件开关，关闭时研讨会频道不展示文档 */
  const seminarWhiteboardCoursewareEnabled = ref(true);

  /** 渠道 id */
  const promoteId = ref<string>();

  /** 音频模式 */
  const audioMode = ref(ChannelAudioMode.NormalAudio);

  /** 是否可以“切换音视频模式” */
  const audioModeSwitchEnabled = ref(false);

  /** 当前频道是否为特殊的音频直播 */
  const isCustomLiveAudioMode = computed(
    () => audioMode.value === ChannelAudioMode.CustomLiveAudio,
  );

  /** 当前直播推流类型 */
  const currentStreamType = ref<StreamType>();
  /** 是否导播台推流 */
  const isNewGuideStream = ref(false);

  /** 流多轨配置 */
  const streamTrackConfig = ref<ChannelStreamTrackConfig>();

  /** 是否支持流多轨 */
  const supportMultiStreamTrack = computed(() => {
    if (!streamTrackConfig.value) return false;

    return streamTrackConfig.value.type !== ChannelStreamTrackType.Single;
  });

  /** 讲师信息 */
  const teacherInfo = ref<TeacherInfoType>();

  /** 关联的主讲详情 */
  const anchorDetail = ref<ChannelAnchorInfo>();

  /** 短信功能全局配置 */
  const smsConfig = ref<SmsConfig>({
    smsImageCaptchaEnabled: true,
  });

  /** 在线列表开关 */
  const onlineListEnabled = ref(false);

  /** 管理员公告跑马灯开关 */
  const managerBulletinMarqueeEnabled = ref(true);

  /** 商品库横屏位置 */
  const productEntryLandscapePosition = ref('chat');
  /** 商品库图标配置 */
  const productIconConfig = ref<ProductIconConfig>();

  /** 外部授权试看信息 */
  const externalTrialWatch = ref<ExternalTrialWatchInfo | null>(null);

  /** 是否支持渲染管理员公告跑马灯 */
  const managerBulletinMarqueeRenderEnabled = computed(() => {
    if (isPptChannel.value || isSeminarChannel.value) return false;

    if (liveStatus.value !== LiveStatus.Live) return false;

    return true;
  });

  /** 是否压缩直播介绍中的内容图片 */
  const compressImageEnabled = ref(true);

  /** PC观看页直播介绍位置 */
  const descShowPosition = ref(DescShowPosition.BottomMenu);

  /** 同步频道 Store 数据 */
  function syncChannelStore(): void {
    const watchCore = watchAppStore.getWatchCore();

    channelScene.value = watchCore.channel.getChannelScene();
    liveStatus.value = watchCore.channel.getLiveStatus();
    currentSessionId.value = watchCore.channel.getCurrentSessionId();
    promoteId.value = watchCore.channel.getPromoteId();
    watchUrl.value = watchCore.channel.getChannelWatchUrl();
    teacherInfo.value = watchCore.channel.getTeacherInfo();
    onlineListEnabled.value = watchCore.channel.getOnlineListEnabled();
    managerBulletinMarqueeEnabled.value = watchCore.channel.getManagerBulletinMarqueeEnabled();
    const descSetting = watchCore.channel.getDescSetting();
    compressImageEnabled.value = descSetting.compressImageEnabled;
    descShowPosition.value = descSetting.descShowPosition;
    seminarWhiteboardCoursewareEnabled.value =
      watchCore.channel.getSeminarWhiteboardCoursewareEnabled();

    streamTrackConfig.value = watchCore.channel.getChannelStreamTrackConfig();
    audioMode.value = watchCore.channel.getAudioMode();
    audioModeSwitchEnabled.value = watchCore.channel.getAudioModeSwitchEnabled();
    productEntryLandscapePosition.value = watchCore.channel.getProductEntryLandscapePosition();
    productIconConfig.value = watchCore.channel.getProductIconConfig();

    smsConfig.value = watchCore.sms.getSmsConfig();
    channelNewScene.value = watchCore.channel.getNewScene();
    syncExternalTrialWatch();
  }

  /** 同步外部授权试看信息 */
  function syncExternalTrialWatch(): void {
    const watchCore = watchAppStore.getWatchCore();

    externalTrialWatch.value = watchCore.trial.getExternalTrialWatch();
  }

  return {
    channelId,
    liveStatus,
    currentSessionId,
    watchUrl,
    isAloneChannel,
    isPptChannel,
    isSeminarChannel,
    privateSeminarChannel,
    isSeminarHostInGroup,
    seminarWhiteboardCoursewareEnabled,
    promoteId,
    audioMode,
    audioModeSwitchEnabled,
    isCustomLiveAudioMode,
    teacherInfo,
    anchorDetail,
    currentStreamType,
    isNewGuideStream,
    onlineListEnabled,
    managerBulletinMarqueeEnabled,
    managerBulletinMarqueeRenderEnabled,
    compressImageEnabled,
    descShowPosition,
    isSmallClassChannel,
    channelNewScene,
    productEntryLandscapePosition,
    productIconConfig,
    externalTrialWatch,

    streamTrackConfig,
    supportMultiStreamTrack,

    smsConfig,

    syncChannelStore,
    syncExternalTrialWatch,
  };
});
