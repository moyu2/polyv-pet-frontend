import { UserEvents, YN, LiveStatus } from '@polyv/live-watch-sdk';
import type { WebViewBridge } from '@polyv/web-view-bridge';
import { isWebView } from '@polyv/web-view-bridge/is-webview';
import { debounce } from 'lodash-es';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref, watch, nextTick } from 'vue';
import { useInteractReceiveStore } from './use-interact-receive-store';
import { useLayoutStore } from './use-layout-store';
import { usePlayerStore } from './use-player-store';
import { useWatchAppStore } from './use-watch-app-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { getLocalStorage, setLocalStorage } from '@/assets/utils/storage';
import { isIOS } from '@/assets/utils/browser';

const PIP_STORAGE_KEY = 'AutoPIP';
const PIP_OUTSIDE_STORAGE_KEY = 'AutoOutsidePIP';

// const isIOS = false;

export interface WebviewStoreState {
  /** 是否基于保利威 webview 协议嵌入的观看页 */
  isPlvWebview: Ref<boolean>;
  /** 是否 webview 内嵌小窗状态 */
  isSmallWindow: Ref<boolean>;
  /** 当前 Webview 页面是否激活，仅用于 webview-feed */
  curWebviewPageIsActive: Ref<boolean>;
  /** 在 webview 中小窗化时，打开的小窗宽高 */
  plvWebviewDataSize: ComputedRef<{ width: number; height: number }>;
  /** 当前 webview 页面禁止拖拽 */
  webviewPageDragDisabled: ComputedRef<boolean>;
  /** Webview 后台小窗是否开启 */
  pictureInPictureEnabled: Ref<boolean>;
  /** Webview 退出应用IOS后台小窗是否开启 */
  pictureInPictureIOSEnabled: Ref<boolean>;
  /** 是否自动进入小窗播放 */
  autoPictureInPicture: Ref<boolean>;
  /** 是否自动进入系统小窗播放 */
  autoOutsidePictureInPicture: Ref<boolean>;
  /** 系统小窗设置是否可见 */
  autoOutsidePictureInPictureVisible: ComputedRef<boolean>;
}

export interface WebviewStoreActions {
  /** 初始化桥接器 */
  initWebviewBridge(): Promise<void>;
  // 初始化webview相关设置
  initWebview(): void;
  /** 获取桥接器对象 */
  getPlvWebviewBridge(): WebViewBridge | undefined;
  /** 发送用户信息 */
  sendUserInfo(enabled: boolean): void;
  /** 恢复到正常窗口 */
  toNormalWindow(): void;
  /** 进入小窗 */
  toSmallWindow(): void;
  /** 同步webview相关信息 */
  syncWebviewInfo(): void;
  /** 设置是否自动进入小窗播放 */
  setAutoPictureInPicture(val: boolean): void;
  /** 设置是否自动进入系统小窗播放 */
  setAutoOutsidePictureInPicture(val: boolean): void;
  /** 关闭当前 webview 页面 */
  closeWindow(): void;
  /** 锁定当前 webview 页面 */
  toLockDrag(trackKey: string): void;
  /** 解锁当前 webview 页面 */
  toUnlockDrag(): void;
  /** 移动到上一个 webview Feed 页面 */
  toNextWebview(): void;
  /** 移动到下一个 webview Feed 页面 */
  toPrevWebview(): void;
}

export interface WebviewStore extends WebviewStoreState, WebviewStoreActions {}

export const useWebviewStore = defineStore<'webview', WebviewStore>('webview', () => {
  const watchAppStore = useWatchAppStore();
  const { forcePausePlay, toPlay, toPause, toSeekVideo, toFreezePlay } = usePlayerAction();

  const { paramGetter } = useQueryParams();

  const playerStore = usePlayerStore();
  const layoutStore = useLayoutStore();
  const interactReceiveStore = useInteractReceiveStore();
  const playbackStore = usePlaybackStore();

  /** webview 桥接器 */
  let webviewBridge: WebViewBridge | undefined;

  /** 是否基于保利威 webview 协议嵌入的观看页 */
  const isPlvWebview = ref(isWebView());

  const pictureInPictureEnabled = ref(false);
  const pictureInPictureIOSEnabled = ref(false);
  const autoPictureInPictureStorage = getLocalStorage(PIP_STORAGE_KEY);
  const autoOutsidePictureInPictureStorage = getLocalStorage(PIP_OUTSIDE_STORAGE_KEY);
  const autoPictureInPicture = ref(autoPictureInPictureStorage !== YN.N);
  const autoOutsidePictureInPicture = ref(autoOutsidePictureInPictureStorage === YN.Y);

  /** 是否 webview 内嵌小窗状态 */
  const isSmallWindow = ref(false);
  // const isSmallWindow = ref(true);

  const __getPageIsActive = () => {
    return isWebView() ? paramGetter().watchPageInitStatus() !== 'inactive' : true;
  };

  const curWebviewPageIsActive = ref(__getPageIsActive());

  const curWebviewPageIsLockDrag = ref(false);

  // 用来记录锁住拖拽的队列
  const webviewLockDragQueue: string[] = [];

  const webviewPageDragDisabled = computed(() => {
    return (
      layoutStore.mobilePlayerIsPageFullscreen ||
      layoutStore.mobileDocIsPageFullscreen ||
      interactReceiveStore.isGoOnRedpackRain
    );
  });

  const autoOutsidePictureInPictureVisible = computed(() => {
    return isIOS && pictureInPictureIOSEnabled.value && autoPictureInPicture.value;
  });

  watch(
    () => webviewPageDragDisabled.value,
    () => {
      if (!curWebviewPageIsActive.value) {
        return;
      }

      if (webviewPageDragDisabled.value) {
        toLockDrag('webviewPageDragDisabled');
      } else {
        toUnlockDrag();
      }
    },
  );

  watch(
    () => playbackStore.currentPlaybackTarget,
    val => {
      if (val) {
        nextTick(() => {
          if (pictureInPictureEnabled.value && getPlaybackUrl()) {
            setLiveChannelInfo(autoOutsidePictureInPicture.value);
          }
        });
      }
    },
  );

  /** 在 webview 中小窗化时，打开的小窗宽高 */
  const plvWebviewDataSize = computed(() => ({
    width: playerStore.isPortraitResolutionRate ? 90 : 160,
    height: playerStore.isPortraitResolutionRate ? 160 : 90,
  }));

  const onWebviewIsActive = () => {
    console.warn('[webview-bridge-feed-flow] onWebviewIsActive');
    curWebviewPageIsActive.value = true;
    watchAppStore.getWatchCore().unFreeze();

    setTimeout(() => {
      toFreezePlay(false);
      toPlay();
    }, 100);

    // toLockDrag();
    if (!watchAppStore.isLiveWatchConnected) {
      console.warn('[webview-bridge-feed-flow] onWebviewIsActive recoverActivePageConnect');
      watchAppStore.recoverActivePageConnect();
      return;
    }

    watchAppStore.getSocket()?.connect();
  };

  const onWebviewIsInactive = () => {
    console.warn('[webview-bridge-feed-flow] onWebviewIsInactive');
    curWebviewPageIsActive.value = false;
    watchAppStore.getWatchCore().freeze();

    if (playerStore.playerInited) {
      toFreezePlay(true);
    }

    // toLockDrag();

    // 注意，页面初始化时在这里写的方法基本是无效的，只能到对应回调的地方去处理，此处只是页面初始化完成后的一般性逻辑处理
    forcePausePlay({ onceHiddenPlayButton: true });
    watchAppStore.getSocket()?.disconnect();
  };

  /** 获取暂存/回放/点播视频url */
  function getPlaybackUrl() {
    return playbackStore.currentPlaybackTarget?.playbackOptions.url;
  }

  function syncWebviewInfo() {
    const watchCore = watchAppStore.getWatchCore();
    pictureInPictureEnabled.value = watchCore.player.getPIPEnabled() && isPlvWebview.value;
    pictureInPictureIOSEnabled.value = watchCore.player.getPIPForIOSEnabled() && isPlvWebview.value;
    if (!pictureInPictureEnabled.value) {
      autoPictureInPicture.value = false;
    }

    if (isIOS && !pictureInPictureIOSEnabled.value) {
      autoOutsidePictureInPicture.value = false;
    }
  }

  /** 初始化桥接器 */
  async function initWebviewBridge() {
    if (webviewBridge || !isPlvWebview.value) {
      return;
    }

    try {
      const { WebViewBridge } = await import(
        /* webpackChunkName: "web-view-bridge" */ '@polyv/web-view-bridge'
      );
      webviewBridge = new WebViewBridge();
      await webviewBridge.connectWebViewBridge();
      console.warn('[webview-bridge-feed-flow] connect');

      __listenEvents();
    } catch (e) {
      console.warn('initWebviewBridge', e);
    }
  }

  /**
   * 初始化配置权限
   */
  function initWebview() {
    console.info('initWebview', pictureInPictureEnabled.value);
    if (pictureInPictureEnabled.value) {
      sendUserInfo(autoPictureInPicture.value);
      setLiveChannelInfo(autoOutsidePictureInPicture.value);
    }
  }

  /**
   * 监听事件
   */
  function __listenEvents() {
    // 监听 watchCore 事件
    __listenWatchCoreEvents();
    // 监听桥接器事件
    __listenBridgeEvents();
    // 监听 window 事件
    __listenWindowEvents();
  }

  function __listenWatchCoreEvents() {
    const watchCore = watchAppStore.getWatchCore();
    // 踢出当前用户时恢复正常窗口
    watchCore.user.eventEmitter.on(UserEvents.CurrentUserKicked, () => {
      if (unref(isSmallWindow)) {
        toNormalWindow();
      }
    });
  }

  function __onCallWebViewEvent(evt: { event?: string; value: Record<string, number> }) {
    const { event, value } = evt;

    console.warn(`[webview-bridge][callWebViewEvent] ${event || 'unknown'}`);
    if (event === 'isActive') {
      onWebviewIsActive();
      return;
    }

    if (event === 'isInactive') {
      onWebviewIsInactive();
      return;
    }

    if (event === 'startPlay') {
      toPlay();
      return;
    }

    if (event === 'pausePlay') {
      toPause();
      return;
    }

    // 当从系统小窗返回页面时，收到此事件，更改页面播放进度
    if (event === 'setCurrentPlaybackTime') {
      const { playbackTime } = value as Record<string, number>;
      toSeekVideo(playbackTime);
      return;
    }

    // 收到iOS回到系统小窗的事件后，发送进度给iOS
    if (event === 'getCurrentPlaybackTime') {
      const params = {
        event: 'setCurrentPlaybackTime',
        value: {
          playbackTime: watchAppStore.getWatchCore().player.getCurrentTime(),
        },
      };
      webviewBridge?.sendData('callAppEvent', { ...params });
    }
  }

  function __listenBridgeEvents() {
    if (!webviewBridge) {
      return;
    }
    // webview 被小窗化
    webviewBridge.on('changeToSmall', (event?: { isPIP: boolean }) => {
      isSmallWindow.value = true;

      // iOS 系统级小窗情况，暂停 web 播放，交由 iOS 原生播放
      if (event?.isPIP) {
        forcePausePlay();
      }
    });

    // webview 取消小窗化
    webviewBridge.on('changeToNormal', (event?: { isPIP: boolean }) => {
      isSmallWindow.value = false;

      // iOS 系统级小窗情况，恢复 web 播放
      if (event?.isPIP) {
        toPlay();
      }
      sendUserInfo(autoPictureInPicture.value);
    });

    webviewBridge.on('callWebViewEvent', __onCallWebViewEvent);
  }

  function __listenWindowEvents() {
    // 小窗发生跳转时恢复正常窗口
    window.addEventListener('beforeunload', () => {
      return new Promise<void>(resolve => {
        if (!unref(isSmallWindow)) {
          resolve();
          return;
        }

        toNormalWindow();
        setTimeout(() => {
          resolve();
        }, 200);
      });
    });
  }

  /**
   * 传参给 webview。主要是 iOS 系统级小窗需要下列信息
   */
  function sendUserInfo(enabled = true) {
    if (!webviewBridge) {
      return;
    }

    /** 小窗开启关闭设置 */
    webviewBridge.sendData('callAppEvent', {
      event: 'setEnableBackgroundPictureInPicture',
      value: { enable: enabled },
    });
    console.info('setEnableBackgroundPictureInPicture', { enabled });

    if (!autoOutsidePictureInPictureVisible.value || !autoOutsidePictureInPicture.value) {
      enabled = false;
    }

    /** ios 系统小窗设置 */
    if (!enabled) {
      webviewBridge.sendData('getLiveUserInfo', {
        userId: '',
        channelId: '',
      });
      console.info('getLiveUserInfo', {});
      return;
    }

    const watchCore = watchAppStore.getWatchCore();
    const accountId = watchCore.getAccountId();
    const channelId = watchCore.channel.getChannelId();
    const userId = watchCore.user.requiredUserId();
    const nickname = watchCore.user.requiredUserNick();
    const params = watchCore.user.getStatisticsParams();

    const data = {
      userId: accountId,
      channelId,
      customParam: {
        liveParam1: userId,
        liveParam2: nickname,
        liveParam3: '',
        liveParam4: params.param4,
        liveParam5: params.param5,
      },
    };

    /** ios 系统小窗设置 */
    webviewBridge.sendData('getLiveUserInfo', data);
    console.info('getLiveUserInfo', data);
  }

  /** 获取桥接器对象 */
  function getPlvWebviewBridge() {
    return webviewBridge;
  }

  /** 恢复到正常窗口 */
  function toNormalWindow() {
    // 当前非小窗中
    if (!unref(isSmallWindow)) {
      return;
    }

    webviewBridge?.sendData('changeToNormal', {});
  }

  function setLiveChannelInfo(enabled = true): boolean {
    if (!webviewBridge) {
      return false;
    }
    const watchCore = watchAppStore.getWatchCore();

    const liveStatus = watchCore.channel.getLiveStatus();
    let vodUrl: undefined | string;
    let videoType = LiveStatus.Playback;
    if (liveStatus === LiveStatus.Live) {
      videoType = LiveStatus.Live;
    } else {
      vodUrl = enabled ? getPlaybackUrl() : undefined;
    }

    const ability = YN.Y;
    const payload = {
      videoType,
      enableWindowAbility: ability,
      enableWindowPermissionToast: ability,
      vodUrl: vodUrl || null,
      videoSize: plvWebviewDataSize.value,
    };
    webviewBridge.sendData('getLiveChannelInfo', payload);
    console.info('getLiveChannelInfo', payload);
    return true;
  }

  /** 申请进入小窗 */
  function toSmallWindow() {
    // 当前已经小窗
    if (unref(isSmallWindow)) {
      return;
    }
    webviewBridge?.sendData('clickProduct', {
      newPage: false,
      ...plvWebviewDataSize.value,
    });
  }

  /** 关闭当前 webview 页面 */
  function closeWindow() {
    webviewBridge?.sendData('closeWindow', {});
  }

  /** 设置是否自动进入小窗播放 */
  function setAutoPictureInPicture(val: boolean) {
    autoPictureInPicture.value = val;
    sendUserInfo(val);
    setLocalStorage(PIP_STORAGE_KEY, val ? YN.Y : YN.N);
  }

  /** 设置是否自动进入系统小窗播放 */
  function setAutoOutsidePictureInPicture(val: boolean) {
    autoOutsidePictureInPicture.value = val;
    const watchCore = watchAppStore.getWatchCore();
    const liveStatus = watchCore.channel.getLiveStatus();
    if (liveStatus === LiveStatus.Live) {
      sendUserInfo(val);
    }
    setLiveChannelInfo(val);
    setLocalStorage(PIP_OUTSIDE_STORAGE_KEY, val ? YN.Y : YN.N);
  }

  /** 锁定当前 webview Feed 页面 */
  function toLockDrag(trackKey: string) {
    if (!isPlvWebview.value) return;

    if (!curWebviewPageIsActive.value) {
      // console.warn('[webview-bridge-feed-flow] try to toLockDrag but not activeWebview', trackKey);
      return;
    }

    webviewLockDragQueue.push(trackKey);
    // console.warn('[webview-bridge-feed-flow][callAppEvent] toLockDrag', trackKey);
    curWebviewPageIsLockDrag.value = true;
    webviewBridge?.sendData('callAppEvent', { event: 'toLockDrag' });
  }

  /** 解锁当前 webview Feed 页面 */
  function toUnlockDrag() {
    if (!isPlvWebview.value) return;

    if (!curWebviewPageIsActive.value) {
      // console.warn('[webview-bridge-feed-flow] try to toUnlockDrag but not activeWebview');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const popItem = webviewLockDragQueue.pop();
    // console.warn('pop webviewLockDragQueue', popItem);
    // console.warn('webviewLockDragQueue', webviewLockDragQueue);
    if (webviewPageDragDisabled.value || webviewLockDragQueue.length > 0) {
      return;
    }

    // console.warn('[webview-bridge-feed-flow][callAppEvent]  toUnlockDrag');
    curWebviewPageIsLockDrag.value = false;
    webviewBridge?.sendData('callAppEvent', { event: 'toUnlockDrag' });
  }

  /** 移动到下一个 webview Feed 页面 */
  const toNextWebview = debounce(() => {
    if (webviewPageDragDisabled.value) {
      return;
    }

    console.warn('[webview-bridge-feed-flow][callAppEvent]  toNextWebview');
    curWebviewPageIsLockDrag.value = false;
    webviewBridge?.sendData('callAppEvent', { event: 'toNextWebview' });
  }, 300);

  /** 移动到上一个 webview Feed 页面 */
  const toPrevWebview = debounce(() => {
    if (webviewPageDragDisabled.value) {
      return;
    }

    console.warn('[webview-bridge-feed-flow][callAppEvent]  toPrevWebview');
    webviewBridge?.sendData('callAppEvent', { event: 'toPrevWebview' });
  }, 300);

  return {
    isPlvWebview,
    isSmallWindow,
    pictureInPictureEnabled,
    pictureInPictureIOSEnabled,
    autoPictureInPicture,
    autoOutsidePictureInPicture,
    autoOutsidePictureInPictureVisible,
    syncWebviewInfo,
    curWebviewPageIsActive,
    plvWebviewDataSize,
    webviewPageDragDisabled,
    initWebviewBridge,
    initWebview,
    getPlvWebviewBridge,
    sendUserInfo,
    toNormalWindow,
    toSmallWindow,
    closeWindow,
    setAutoPictureInPicture,
    setAutoOutsidePictureInPicture,
    toLockDrag,
    toUnlockDrag,
    toNextWebview,
    toPrevWebview,
  };
});
