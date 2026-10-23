import { computed, ComputedRef, ref, Ref } from 'vue';
import { defineStore } from 'pinia';
import {
  PlaybackWatchBasicInfo,
  LiveStatus,
  MobileWatchLayout,
  generateDefaultAccountInfo,
  AccountInfo,
  YN,
} from '@polyv/live-watch-sdk';

import { appEvents } from '@/app/app-events';

import {
  DirectBusinessPageType,
  DirectBusinessPageData,
  PageErrorData,
  PageErrorType,
} from '@/app/layout/direct-business-page/type';

import { useChannelStore } from './use-channel-store';
import { useAuthStore } from './use-auth-store';
import { useEnrollStore } from './use-enroll-store';
import { useIdentityStore } from './use-identity-store';
import { useLayoutStore } from './use-layout-store';
import { usePlaybackStore } from './use-playback-store';
import { usePlayerStore } from './use-player-store';
import { useDocStore } from './use-doc-store';
import { useChatStore } from './use-chat-store';
import { useFinanceStore } from './use-finance-store';
import { useConnectMicStore } from './use-connect-mic-store';

import { useSyncStoreForWatchPage } from '@/hooks/core/use-sync-store';
import { useMultiMeetingRedirect } from '@/components/page-watch-common/multi-meeting/hooks/use-multi-meeting-redirect';

import { translate } from '@/assets/lang';
import { isMobile } from '@/assets/utils/browser';
import { QueryParamsHookType, useQueryParams } from '@/hooks/core/use-query-params';
import { GlobalInjectType, useGlobalInject } from '@/app/use-global-inject';
import { useWebviewStore } from './use-webview-store';
import { useFeedInjectStore } from './use-feed-inject-store';
import { isBuildForFeedMainMode, isInjectByExternalApp } from '@/assets/utils/utils';

export interface WatchAppStoreState {
  /** 页面是否激活，仅用于 web-feed */
  isPageActive: Ref<boolean>;
  /** 不需要互动，默认为 false */
  notNeedIar: Ref<boolean>;
  /** 使用新版主题，默认为 true */
  useNewTheme: Ref<boolean>;
  /** 强制显示引导页，默认为 false */
  forceSplashPage: Ref<boolean>;

  /** 当前是否处于回放观看页地址 */
  isPlaybackWatchUrl: Ref<boolean>;
  /** 回放观看页基本信息 */
  playbackWatchBasicInfo: Ref<PlaybackWatchBasicInfo>;
  /** 当前是否为微信小程序 webview 环境 */
  isWxMiniProgram: Ref<boolean>;
  /** 是否为会议模式 */
  meetingMode: ComputedRef<boolean>;
  /** 是否 iframe 模式 */
  iframeMode: Ref<boolean>;

  /** 观看页应用初始化完毕 */
  watchAppInited: Ref<boolean>;
  /** 账户信息 */
  accountInfo: Ref<AccountInfo>;

  /** 独立业务页面关联数据 */
  directBusinessPageData: Ref<DirectBusinessPageData | undefined>;
  /** 独立业务页面类型 */
  directBusinessPageType: ComputedRef<DirectBusinessPageType | undefined>;

  /**
   * 由于单页面没有路由机制，所以通过标志位来销毁组件
   * @warn shouldShowForceAuth、shouldShowSplash、watchPageInited 三个变量只能有一个为 true
   */

  /** 是否显示强制授权页 - 强制授权页标识位（非正式用户时引导页优先，让位） */
  shouldShowForceAuth: ComputedRef<boolean>;
  /** 是否显示引导页 - 引导页渲染标识位 */
  shouldShowSplash: ComputedRef<boolean>;
  /** 直播观看页是否初始化完毕 - 直播观看页渲染标识位 */
  watchPageInited: Ref<boolean>;

  /** 直播观看页除需要 pause 的功能外已初始化 */
  isLiveWatchConnected: Ref<boolean>;

  /** 观看页聊天室 socket 已连接 */
  watchPageChatConnected: Ref<boolean>;
}

export interface WatchAppStoreActions {
  /** 设置独立错误页面 */
  setDirectBusinessPage(param: DirectBusinessPageData): void;
  /** 设置页面错误数据 */
  setPageError(param: PageErrorData): void;
  /** 重置 watchCore */
  resetUpWatchCore(): Promise<void>;
  /** 同步 watchAppStore 数据 */
  syncWatchAppStore(): void;
  /** 设置直播观看页 */
  setupLiveWatch(): Promise<void>;
  /** 恢复直播观看页部分功能的初始化 */
  recoverConnectLiveWatch(): void;
  /** 恢复激活页部分功能的初始化 */
  recoverActivePageConnect(): void;
  /** 连接聊天室 */
  setupWatchCoreConnect(): Promise<void>;

  /** 锁定当前 feed 页面 */
  toLockDrag(trackKey: string): void;
  /** 解锁当前 feed 页面 */
  toUnlockDrag(): void;
}

export interface WatchAppStore
  extends WatchAppStoreState,
    WatchAppStoreActions,
    GlobalInjectType,
    QueryParamsHookType {}

export const useWatchAppStore = defineStore<'watchApp', WatchAppStore>('watchApp', () => {
  const { getWatchCore, getEmitter } = useGlobalInject();
  const { paramGetter } = useQueryParams();

  const { syncStoreBeforeWatchPageInited, syncStoreAfterWatchPageInited } =
    useSyncStoreForWatchPage();

  const { checkRedirectSubChannel } = useMultiMeetingRedirect();

  const feedInjectStore = useFeedInjectStore();

  const authStore = useAuthStore();
  const enrollStore = useEnrollStore();
  const identityStore = useIdentityStore();

  const layoutStore = useLayoutStore();

  const channelStore = useChannelStore();
  const docStore = useDocStore();
  const playbackStore = usePlaybackStore();
  const playerStore = usePlayerStore();
  const chatStore = useChatStore();
  const connectMicStore = useConnectMicStore();

  const financeStore = useFinanceStore();
  const webviewStore = useWebviewStore();

  const __getPageIsActive = () => {
    return paramGetter().combinedBy() === 'web-feed'
      ? paramGetter().watchPageInitStatus() !== 'inactive'
      : true;
  };

  const isPageActive = ref(__getPageIsActive());

  /**
   * 不需要互动，默认为 false
   * @desc
   * 1. 这里指代的互动功能，是指互动 SDK 相关的功能，包括签到、抽奖
   * 2. 虽然不需要互动功能，但是需要加载底层的互动 SDK 核心，才能让商品库功能正常使用，
   */
  const notNeedIar = ref(
    (() => {
      return paramGetter().notNeedIar() === YN.Y;
    })(),
  );

  const useNewTheme = ref(true);

  const forceSplashPage = ref(
    (() => {
      return paramGetter().forceSplashPage() === YN.Y;
    })(),
  );

  const curPageIsLockDrag = ref(false);

  /** 当前是否处于回放观看页地址 */
  const isPlaybackWatchUrl = ref(false);

  /** 回放观看页基本信息 */
  const playbackWatchBasicInfo = ref<PlaybackWatchBasicInfo>({});

  /** 当前是否为微信小程序 webview 环境 */
  const isWxMiniProgram = ref(false);

  /** 是否为会议模式 */
  const meetingMode = computed(() => {
    // 移动端横屏下才需要进入会议模式
    if (isMobile && layoutStore.mobileWatchLayout === MobileWatchLayout.Normal) {
      return paramGetter().polyvMeeting() === 'true';
    }

    return false;
  });

  /** 是否 iframe 模式 */
  const iframeMode = ref(paramGetter().hasFrame() === '1');

  /** 独立业务页面关联数据 */
  const directBusinessPageData = ref<DirectBusinessPageData>();

  /** 独立错误页类型 */
  const directBusinessPageType = computed(() => {
    return directBusinessPageData.value?.pageType;
  });

  /** 观看页应用初始化完毕 */
  const watchAppInited = ref(false);

  /** 强制微信授权检查结果（原始值，渲染判定见 shouldShowForceAuth） */
  const forceAuthCheckResult = ref(false);

  /** 检查引导页显示条件是否成立（观看条件未过 / 需入口报名 / 风控测评） */
  function checkSplashDisplayCondition(): boolean {
    return (
      !authStore.isAuthorized ||
      enrollStore.needEnrollByEnter ||
      financeStore.shouldShowSplashByRiskEvaluation
    );
  }

  /**
   * 引导页是否优先于强制授权页
   * @desc 仅「用户体系开启 ∧ 非正式用户 ∧ 引导页显示条件成立（含强制引导页参数）」时翻转：
   * 先在引导页登录，转正后强制授权页按现状机制出现；其余人群维持现状序
   */
  function splashPriorToForceAuth(): boolean {
    // 正式用户与用户体系关频道维持现状序（体系关：强制授权页必须在引导页前）
    if (identityStore.sessionIdentity === 'formal' || !identityStore.watchUserSystemEnabled) {
      return false;
    }

    return forceSplashPage.value || checkSplashDisplayCondition();
  }

  /** 是否显示强制授权页（引导页优先时让位） */
  const shouldShowForceAuth = computed(() => {
    if (!forceAuthCheckResult.value) return false;
    return !splashPriorToForceAuth();
  });

  /** 是否显示引导页 */
  const shouldShowSplash = computed(() => {
    // 强制引导页参数优先于强制授权页（现状序）
    if (forceSplashPage.value) return true;

    if (shouldShowForceAuth.value) return false;

    return checkSplashDisplayCondition();
  });

  /** 直播观看页是否初始化完毕 */
  const watchPageInited = ref(false);

  /** 观看页需要聊天室 socket */
  const watchPageNeedChatSocket = ref(false);

  /** 直播观看页部分功能已初始化 */
  const isLiveWatchConnected = ref(false);

  /** 观看页聊天室 socket 已连接 */
  const watchPageChatConnected = ref(false);

  /** 账户信息 */
  const accountInfo = ref(generateDefaultAccountInfo());

  /** 设置页面异常数据 */
  function setPageError(param: PageErrorData) {
    // 只设置一次
    if (directBusinessPageType.value) return;

    directBusinessPageData.value = {
      pageType: DirectBusinessPageType.ErrorPage,
      data: param,
    };
  }

  /** 设置独立错误页面 */
  function setDirectBusinessPage(param: DirectBusinessPageData) {
    if (param.pageType === DirectBusinessPageType.ErrorPage) {
      setPageError(param.data);
      return;
    }

    directBusinessPageData.value = param;
  }

  /** 重置 watchCore */
  async function resetUpWatchCore(): Promise<void> {
    try {
      const watchCore = getWatchCore();
      await watchCore.setup();
    } catch (error) {
      setPageError({
        type: PageErrorType.UnknownError,
        title: translate('pageError.channel.unknowError'),
        desc: translate('pageError.channel.feedback'),
      });
      console.error('resetUpWatchCore error', error);
      // 需要抛出主流程阻塞的异常
      throw new Error('页面初始化失败！');
    }
  }

  /** 同步 watchAppStore 数据 */
  function syncWatchAppStore() {
    const watchCore = getWatchCore();

    accountInfo.value = watchCore.getAccountInfo();
    forceAuthCheckResult.value = watchCore.weixin.checkForceWxAuth();
    isPlaybackWatchUrl.value = watchCore.isPlaybackWatchByVid();
    playbackWatchBasicInfo.value = watchCore.getPlaybackWatchBasicInfo();
  }

  /** 设置观看页 */
  async function setupLiveWatch(): Promise<void> {
    // 从分会场跳转到主会场并授权成功，则跳回对应的分会场，跳转后阻止观看页渲染
    const checkResult = checkRedirectSubChannel();
    if (checkResult) {
      return;
    }

    // 同步相关 store 的数据
    syncStoreBeforeWatchPageInited();

    // 初始化当前回放对象
    await playbackStore.initCurrentPlaybackTarget();

    // 根据不同场景设置 watchPageInited 标识位
    __setWatchPageInited();

    // 同步相关 store 的数据
    syncStoreAfterWatchPageInited();
  }

  /**
   * 是否不需要连麦处理
   */
  function __notNeedRealTimeConnect() {
    /**
     * 不需要连麦，不需要连接聊天室
     * @scene vid 回放地址下，根据回放对象标志判断是否需要连接聊天室
     * @scene 研讨会处于"内部研讨"时不需要连接聊天室
     * @scene 研讨会处于回放时不需要连接聊天室
     */
    return (
      (isPlaybackWatchUrl.value &&
        playbackStore.currentPlaybackTarget &&
        !playbackStore.currentPlaybackTarget.chatConnectEnabled) ||
      channelStore.privateSeminarChannel ||
      (channelStore.isSeminarChannel && channelStore.liveStatus === LiveStatus.Playback)
    );
  }

  /** 根据不同场景设置 watchPageInited 标识位 */
  function __setWatchPageInited() {
    // 开启风险确认函时，需要暂停部分功能初始化和 Socket 链接，等到观众同意确认后再进行恢复
    if (financeStore.riskConfirmEnabled) {
      pauseConnectLiveWatch();
      watchPageInited.value = true;
      return;
    }

    const isInactiveFeedPage =
      paramGetter().watchPageInitStatus() === 'inactive' ||
      !isPageActive.value ||
      !webviewStore.curWebviewPageIsActive;

    if (
      (isInactiveFeedPage && !isLiveWatchConnected.value) ||
      (isBuildForFeedMainMode() && feedInjectStore.inFirstFeedLayout)
    ) {
      pauseInactivePageConnect();
      watchPageInited.value = true;
      return;
    }

    if (__notNeedRealTimeConnect()) {
      connectMicStore.$patch({ connectMicEnabled: false });
      watchPageInited.value = true;
      return;
    }

    // 正常进入观看页，需要建立 socket 连接
    watchPageNeedChatSocket.value = true;
    isLiveWatchConnected.value = true;
    watchPageInited.value = true;
  }

  // 处理重复连接 socket 的逻辑
  let connecting = false;
  /**
   * 设置观看核心连接 Socket 处理
   */
  async function setupWatchCoreConnect() {
    if (!watchPageNeedChatSocket.value || watchPageChatConnected.value) return;

    const watchCore = getWatchCore();
    if (connecting) {
      return;
    }

    connecting = true;
    await watchCore.connect();

    connecting = false;
    watchPageChatConnected.value = true;
  }

  /**
   * 暂停直播观看页部分功能的初始化
   * */
  function pauseConnectLiveWatch() {
    isLiveWatchConnected.value = false;

    playerStore.$patch({ playerEnabled: false });
    docStore.$patch({ docEnabled: false });
    chatStore.$patch({ chatMsgListEnabled: false });
    connectMicStore.$patch({ connectMicEnabled: false });
  }

  /**
   * 尝试恢复连麦、聊天室 socket 连接功能
   */
  async function __tryRecoverConnectRealTimeFeature() {
    if (__notNeedRealTimeConnect()) return;

    watchPageNeedChatSocket.value = true;
    await setupWatchCoreConnect();

    connectMicStore.$patch({ connectMicEnabled: true });
    getEmitter().emit(appEvents.connectMic.ResetUpConnectMic);
  }

  /**
   * 恢复直播观看页部分功能的初始化
   */
  async function recoverConnectLiveWatch() {
    if (!watchPageInited.value) return;

    isLiveWatchConnected.value = true;

    playerStore.$patch({ playerEnabled: true });
    docStore.$patch({ docEnabled: true });
    chatStore.$patch({ chatMsgListEnabled: true });

    getEmitter().emit(appEvents.player.ResetUpPlayer);
    getEmitter().emit(appEvents.doc.ResetUpDoc);
    getEmitter().emit(appEvents.chat.ResetUpChatMsgList);

    await __tryRecoverConnectRealTimeFeature();
  }

  /**
   * 暂停未激活页面部分功能的处理
   * */
  function pauseInactivePageConnect() {
    isLiveWatchConnected.value = false;

    docStore.$patch({ docEnabled: false });
    chatStore.$patch({ chatMsgListEnabled: false });
    connectMicStore.$patch({ connectMicEnabled: false });
  }

  async function recoverActivePageConnect() {
    if (!watchPageInited.value) return;

    // 当前激活状态，要优先设置状态位
    if (webviewStore.curWebviewPageIsActive || isPageActive.value) {
      isLiveWatchConnected.value = true;
    }

    isLiveWatchConnected.value = true;

    docStore.$patch({ docEnabled: true });
    chatStore.$patch({ chatMsgListEnabled: true });

    getEmitter().emit(appEvents.doc.ResetUpDoc);
    getEmitter().emit(appEvents.chat.ResetUpChatMsgList);

    await __tryRecoverConnectRealTimeFeature();
  }

  // 用来记录锁住拖拽的队列
  const pageLockDragQueue: string[] = [];

  /** 锁定当前 Feed 页面 */
  function toLockDrag(trackKey: string) {
    if (!isInjectByExternalApp()) {
      return;
    }

    if (!isPageActive.value) {
      // console.warn('[web-feed-flow] try to toLockDrag but not activeWebview', trackKey);
      return;
    }

    pageLockDragQueue.push(trackKey);
    console.warn('[web-feed-flow][callAppEvent] toLockDrag', trackKey);
    curPageIsLockDrag.value = true;
    getEmitter().emit(appEvents.global.PageToLockDrag);
  }

  /** 解锁当前 Feed 页面 */
  function toUnlockDrag() {
    if (!isInjectByExternalApp()) {
      return;
    }

    if (!isPageActive.value) {
      // console.warn('[web-feed-flow] try to toUnlockDrag but not activeWebview');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const popItem = pageLockDragQueue.pop();
    console.warn('pop pageLockDragQueue', popItem);
    // console.warn('pageLockDragQueue', pageLockDragQueue);
    if (pageLockDragQueue.length > 0) {
      return;
    }

    // console.warn('[web-feed-flow][callAppEvent]  toUnlockDrag');
    curPageIsLockDrag.value = false;
    getEmitter().emit(appEvents.global.PageToUnlockDrag);
  }

  return {
    isPageActive,
    notNeedIar,
    useNewTheme,
    forceSplashPage,

    isPlaybackWatchUrl,
    playbackWatchBasicInfo,
    isWxMiniProgram,
    meetingMode,
    iframeMode,

    directBusinessPageType,
    directBusinessPageData,
    accountInfo,
    watchAppInited,
    shouldShowForceAuth,
    shouldShowSplash,
    watchPageInited,

    setDirectBusinessPage,
    setPageError,
    resetUpWatchCore,
    syncWatchAppStore,
    setupLiveWatch,

    isLiveWatchConnected,
    recoverConnectLiveWatch,
    recoverActivePageConnect,

    watchPageChatConnected,
    setupWatchCoreConnect,

    toLockDrag,
    toUnlockDrag,

    ...useGlobalInject(),
    ...useQueryParams(),
  };
});
