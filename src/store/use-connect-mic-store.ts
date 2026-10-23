import { translate } from '@/assets/lang';
import {
  PlvConnectMicModule,
  ConnectMicItem,
  ConnectMicNetworkInfo,
  ConnectMicStatus,
  ConnectMicType,
  ScreenShareInfo,
  MixStreamRenderMode,
  ConnectMicFitType,
  FacingMode,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { isOpenHarmony } from '@/assets/utils/browser';
import { useLayoutStore } from './use-layout-store';
import { useWebviewStore } from './use-webview-store';
import { useWatchAppStore } from './use-watch-app-store';

export interface ConnectMicStoreState {
  /** 配置是否使用连麦 */
  connectMicEnabled: Ref<boolean>;
  /** 当前环境是否支持连麦 */
  supportConnectMic: Ref<boolean>;
  /** 当前环境是否支持切换前后摄像头 */
  supportFacingMode: Ref<boolean>;
  /** 当前前后摄像头 */
  facingMode: Ref<FacingMode>;
  /** 是否开启镜像 */
  mirrorEnabled: Ref<boolean>;
  /** 是否开启了连麦 */
  openMicStatus: Ref<boolean>;
  /** 邀请上麦状态 */
  inviteStatus: Ref<boolean>;
  /** 是否自动连麦（与 SDK connectMicInfo.autoConnect 同步，小班课自动进房等场景） */
  connectMicAutoConnect: Ref<boolean>;
  /** 连麦类型 */
  connectMicType: Ref<ConnectMicType>;
  /** 用户连麦状态 */
  connectMicStatus: Ref<ConnectMicStatus>;
  /** 连麦排序显示开关 */
  showJoinQueueNumberEnabled: Ref<boolean>;
  /** 当前连麦请求排序 */
  currentMicIndex: Ref<number>;
  /** 最大显示连麦序号 */
  maxMicIndex: Ref<number>;
  /** 是否有连麦画面被暂停 */
  isConnectMicPaused: Ref<boolean>;
  /** 是否有用户流播放失败 */
  isUserStreamPlayFailed: Ref<boolean>;
  /** 当前用户是否正在连麦中 */
  isConnectMicing: ComputedRef<boolean>;
  /** 连麦挂件是否需要渲染 */
  connectMicPendantRenderEnabled: ComputedRef<boolean>;
  /** 连麦挂件是否显示 */
  connectMicPendantVisible: ComputedRef<boolean>;
  /** 连麦列表 */
  connectMicList: Ref<ConnectMicItem[]>;
  /** 过滤后的连麦列表（移除第一画面） */
  filterConnectMicList: ComputedRef<ConnectMicItem[]>;
  /** 第一画面流对象 */
  masterMicItem: ComputedRef<ConnectMicItem | undefined>;
  /** 当前连麦用户是否为第一画面 */
  masterIsSelf: ComputedRef<boolean>;
  /** 第一画面流是否关闭摄像头 */
  masterIsVideoMuted: ComputedRef<boolean>;
  /** 第一画面流是否关闭麦克风 */
  masterIsAudioMuted: ComputedRef<boolean>;
  /** 第一画面头衔 */
  masterActor: ComputedRef<string | undefined>;
  /** 第一画面昵称 */
  masterNickname: ComputedRef<string | undefined>;
  /** 第一画面的连麦方式 */
  masterConnectMicType: ComputedRef<ConnectMicType | undefined>;
  /** 本地流对象 */
  localMicItem: ComputedRef<ConnectMicItem | undefined>;
  /** 本地流是否关闭摄像头 */
  localIsVideoMuted: ComputedRef<boolean>;
  /** 本地流是否关闭麦克风 */
  localIsAudioMuted: ComputedRef<boolean>;
  /** 本地流的连麦方式 */
  localConnectMicType: ComputedRef<ConnectMicType | undefined>;
  /** 当前是否为主讲 */
  currentIsSpeaker: Ref<boolean>;
  /** 连麦网络信息 */
  networkInfo: Ref<ConnectMicNetworkInfo>;
  /** 屏幕共享信息 */
  screenShareInfo: Ref<ScreenShareInfo>;
  /** 当前推流时能否设置摄像头 */
  supportSetupVideo: ComputedRef<boolean>;
  /** 设备采集失败 */
  isDeviceRecoverFailed: Ref<boolean>;
  /** 播放容器模式 */
  connectMicFitType: Ref<ConnectMicFitType>;
  /** 连麦setup成功 */
  micSetupSuccess: Ref<boolean>;
  /** 当前是否处于观众模式（仅拉流，不推本地流） */
  isAudience: Ref<boolean>;
  /** 地址栏连麦 UI 版本（connectMicUIVersion=v1 为旧版，未传参时默认 v2；纯血鸿蒙未传参时为 v1） */
  connectMicUIVersion: ComputedRef<'v1' | 'v2'>;
  /** 是否使用新版连麦 UI */
  isConnectMicUIV2: ComputedRef<boolean>;
}

export interface ConnectMicStoreAction {
  /** 同步连麦信息 */
  syncConnectMicInfo(): void;
  /** 同步连麦网络信息 */
  syncNetworkInfo(): void;
  /** 同步屏幕共享信息 */
  syncScreenShareInfo(): void;
  /** 同步连麦列表 */
  syncConnectMicList(): void;
  /** 设置是否有连麦画面被暂停 */
  setIsConnectMicPaused(val: boolean): void;
  /** 同步前后摄像头 */
  syncFacingMode(): void;
}

export interface ConnectMicStore extends ConnectMicStoreState, ConnectMicStoreAction {}

/**
 * 连麦 store
 */
export const useConnectMicStore = defineStore<'connectMic', ConnectMicStore>('connectMic', () => {
  const watchAppStore = useWatchAppStore();
  const layoutStore = useLayoutStore();
  const webviewStore = useWebviewStore();

  const { paramGetter } = useQueryParams();

  /** 地址栏连麦 UI 版本（统一从此处读取，勿在组件内重复拼 query） */
  const connectMicUIVersion = computed<'v1' | 'v2'>(() => {
    const v = paramGetter().connectMicUIVersion();
    if (v === 'v1') return 'v1';
    if (v === 'v2') return 'v2';
    // 未传 connectMicUIVersion：纯血鸿蒙默认旧版连麦 UI
    if (isOpenHarmony) return 'v1';
    return 'v2';
  });

  /** 是否使用新版连麦 UI（默认 v2；纯血鸿蒙未传参时为 v1；显式 connectMicUIVersion=v1 为旧版） */
  const isConnectMicUIV2 = computed(() => unref(connectMicUIVersion) !== 'v1');

  /** 配置是否使用连麦 */
  const connectMicEnabled = ref(true);

  const __connectMicInfo = PlvConnectMicModule.generateDefaultConnectMicInfo();

  /** 当前环境是否支持连麦 */
  const supportConnectMic = ref(__connectMicInfo.supportConnectMic);

  /** 当前环境是否支持切换前后摄像头 */
  const supportFacingMode = ref(__connectMicInfo.supportFacingMode);

  /** 当前前后摄像头 */
  const facingMode = ref(__connectMicInfo.facingMode);

  /** 是否开启镜像 */
  const mirrorEnabled = ref(__connectMicInfo.mirrorEnabled);

  /** 是否开启了连麦 */
  const openMicStatus = ref(__connectMicInfo.openMicStatus);

  /** 邀请上麦状态 */
  const inviteStatus = ref(__connectMicInfo.inviteStatus);

  /** 是否自动连麦 */
  const connectMicAutoConnect = ref(__connectMicInfo.autoConnect);

  /** 连麦类型 */
  const connectMicType = ref<ConnectMicType>(__connectMicInfo.connectMicType);

  /** 用户连麦状态 */
  const connectMicStatus = ref<ConnectMicStatus>(__connectMicInfo.connectMicStatus);

  /** 连麦排序显示开关 */
  const showJoinQueueNumberEnabled = ref(__connectMicInfo.showJoinQueueNumberEnabled);

  /** 当前连麦请求排序 */
  const currentMicIndex = ref(__connectMicInfo.currentMicIndex);

  /** 最大显示连麦序号 */
  const maxMicIndex = ref(50);

  /** 连麦画面填充类型 */
  const connectMicFitType = ref<ConnectMicFitType>(ConnectMicFitType.Contain);

  /** 连麦setup success */
  const micSetupSuccess = ref<boolean>(false);

  /** 当前是否处于观众模式（仅拉流，不推本地流） */
  const isAudience = ref<boolean>(false);

  /** 当前用户是否正在连麦中 */
  const isConnectMicing = computed<boolean>(() => {
    const status = unref(connectMicStatus);
    return [ConnectMicStatus.Publishing, ConnectMicStatus.Connected].includes(status);
  });

  /** 连麦挂件是否需要渲染 */
  const connectMicPendantRenderEnabled = computed(() => {
    if (!supportConnectMic.value) {
      return false;
    }

    if (isConnectMicing.value) {
      return true;
    }

    if (!webviewStore.curWebviewPageIsActive || !watchAppStore.isPageActive) {
      return false;
    }

    return openMicStatus.value || inviteStatus.value;
  });

  /** 连麦挂件是否显示 */
  const connectMicPendantVisible = computed(() => {
    return (
      !layoutStore.mobileDocIsPageFullscreen &&
      !layoutStore.mobileNormalLatencyPlayerIsFullscreen &&
      !layoutStore.mobilePlayerIsPageFullscreen &&
      !layoutStore.isPageFullscreenOrHorizontalScreen &&
      !(inviteStatus.value && !isConnectMicing.value)
    );
  });

  /** 是否有连麦画面被暂停 */
  const isConnectMicPaused = ref(false);

  /** 是否有用户流播放失败 */
  const isUserStreamPlayFailed = ref(false);

  /** 连麦列表 */
  const connectMicList: Ref<ConnectMicItem[]> = ref([]);

  /** 过滤连麦列表 */
  const filterConnectMicList = computed(() => {
    const micList = unref(connectMicList);
    const streamList = micList.filter(micItem => {
      return !micItem.isMaster;
    });
    const watchCore = watchAppStore.getWatchCore();
    return streamList.sort((prevMicItem, nextMicItem) => {
      if (nextMicItem.isLocal) {
        return 2;
      }
      if (watchCore.user.isSpecialUserType(nextMicItem.userType)) {
        return 1;
      }
      return -1;
    });
  });

  /** 第一画面流对象 */
  const masterMicItem = computed(() => {
    const micList = unref(connectMicList);
    const masterIndex = micList.findIndex(micItem => micItem.isMaster);
    return masterIndex === -1 ? undefined : micList[masterIndex];
  });

  /** 当前连麦用户是否为第一画面 */
  const masterIsSelf = computed<boolean>(() => {
    return !!unref(masterMicItem)?.isSelf;
  });

  /** 第一画面流是否关闭摄像头 */
  const masterIsVideoMuted = computed<boolean>(() => {
    return unref(masterMicItem)?.isVideoMuted ?? false;
  });

  /** 第一画面流是否关闭麦克风 */
  const masterIsAudioMuted = computed<boolean>(() => {
    return unref(masterMicItem)?.isAudioMuted ?? false;
  });

  /** 第一画面头衔 */
  const masterActor = computed<string | undefined>(() => {
    if (unref(masterIsSelf)) {
      return translate('connectMic.me');
    }
    if (unref(masterMicItem)?.isTeacher) {
      return translate('connectMic.teacher');
    }
    return undefined;
  });

  /** 第一画面昵称 */
  const masterNickname = computed<string | undefined>(() => {
    return unref(masterMicItem)?.nickname;
  });

  /** 第一画面的连麦方式 */
  const masterConnectMicType = computed<ConnectMicType | undefined>(() => {
    return unref(masterMicItem)?.currentConnectMicType;
  });

  /** 本地流对象 */
  const localMicItem = computed(() => {
    const micList = unref(connectMicList);
    const localIndex = micList.findIndex(micItem => micItem.isLocal);
    return localIndex === -1 ? undefined : micList[localIndex];
  });

  /** 本地流是否关闭摄像头 */
  const localIsVideoMuted = computed<boolean>(() => {
    return unref(localMicItem)?.isVideoMuted ?? false;
  });

  /** 本地流是否关闭麦克风 */
  const localIsAudioMuted = computed<boolean>(() => {
    return unref(localMicItem)?.isAudioMuted ?? false;
  });

  /** 本地流的连麦方式 */
  const localConnectMicType = computed<ConnectMicType | undefined>(() => {
    return unref(localMicItem)?.currentConnectMicType;
  });

  /** 当前是否为主讲 */
  const currentIsSpeaker = ref(__connectMicInfo.currentIsSpeaker);

  /** 屏幕共享信息 */
  const screenShareInfo = ref<ScreenShareInfo>(
    PlvConnectMicModule.generateDefaultScreenShareInfo(),
  );

  /** 设备采集失败 */
  const isDeviceRecoverFailed = ref(false);

  /** 同步屏幕共享信息 */
  function syncScreenShareInfo(): void {
    const watchCore = watchAppStore.getWatchCore();
    const info = watchCore.connectMic.getScreenShareInfo();
    screenShareInfo.value = info;
  }

  /** 连麦网络信息 */
  const networkInfo = ref<ConnectMicNetworkInfo>(PlvConnectMicModule.generateDefaultNetworkInfo());

  /** 同步连麦网络信息 */
  function syncNetworkInfo(): void {
    const watchCore = watchAppStore.getWatchCore();
    const info = watchCore.connectMic.getNetworkInfo();
    networkInfo.value = info;
  }

  /** 设置是否有连麦画面被暂停 */
  function setIsConnectMicPaused(val: boolean): void {
    isConnectMicPaused.value = val;
  }

  /** 当前推流时能否设置摄像头 */
  const supportSetupVideo = computed(() => {
    // 音频连麦
    if (connectMicType.value === ConnectMicType.Audio) {
      return false;
    }
    // 当前正在屏幕共享
    if (screenShareInfo.value.isScreenSharing) {
      return false;
    }
    return true;
  });

  function syncConnectMicInfo(): void {
    const watchCore = watchAppStore.getWatchCore();
    const connectMicInfo = watchCore.connectMic.getConnectMicInfo();

    supportConnectMic.value = connectMicInfo.supportConnectMic;
    openMicStatus.value = connectMicInfo.openMicStatus;
    inviteStatus.value = connectMicInfo.inviteStatus;
    connectMicAutoConnect.value = connectMicInfo.autoConnect;
    connectMicType.value = connectMicInfo.connectMicType;
    connectMicStatus.value = connectMicInfo.connectMicStatus;
    showJoinQueueNumberEnabled.value = connectMicInfo.showJoinQueueNumberEnabled;
    currentMicIndex.value = connectMicInfo.currentMicIndex;
    currentIsSpeaker.value = connectMicInfo.currentIsSpeaker;
    facingMode.value = connectMicInfo.facingMode;
    mirrorEnabled.value = connectMicInfo.mirrorEnabled;
    connectMicFitType.value =
      watchCore.channel.getMixStreamRenderMode() === MixStreamRenderMode.Cover
        ? ConnectMicFitType.Cover
        : ConnectMicFitType.Contain;

    if (connectMicInfo.connectMicStatus === ConnectMicStatus.NotConnect) {
      setIsConnectMicPaused(false);
    }

    isAudience.value = watchCore.connectMic.isAudienceModeJoined();
    supportFacingMode.value = connectMicInfo.supportFacingMode;
  }

  function syncConnectMicList(): void {
    const watchCore = watchAppStore.getWatchCore();
    connectMicList.value = watchCore.connectMic.getConnectMicList();

    isAudience.value = watchCore.connectMic.isAudienceModeJoined();
  }

  function syncFacingMode(): void {
    const watchCore = watchAppStore.getWatchCore();
    facingMode.value = watchCore.connectMic.getConnectMicInfo().facingMode;
  }

  return {
    connectMicEnabled,
    supportConnectMic,
    supportFacingMode,
    facingMode,
    mirrorEnabled,
    openMicStatus,
    inviteStatus,
    connectMicAutoConnect,
    connectMicType,
    connectMicStatus,
    showJoinQueueNumberEnabled,
    currentMicIndex,
    maxMicIndex,
    isConnectMicing,
    isConnectMicPaused,
    isUserStreamPlayFailed,
    connectMicPendantRenderEnabled,
    connectMicPendantVisible,
    connectMicList,
    filterConnectMicList,
    masterMicItem,
    masterIsSelf,
    masterIsVideoMuted,
    masterIsAudioMuted,
    masterActor,
    masterNickname,
    masterConnectMicType,
    localMicItem,
    localIsVideoMuted,
    localIsAudioMuted,
    localConnectMicType,
    currentIsSpeaker,
    supportSetupVideo,
    isDeviceRecoverFailed,
    connectMicFitType,

    networkInfo,
    syncNetworkInfo,

    screenShareInfo,
    syncScreenShareInfo,

    syncConnectMicInfo,
    syncConnectMicList,
    syncFacingMode,
    setIsConnectMicPaused,
    micSetupSuccess,
    isAudience,

    connectMicUIVersion,
    isConnectMicUIV2,
  };
});
