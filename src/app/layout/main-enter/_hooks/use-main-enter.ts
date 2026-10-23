import { watch, onBeforeMount, nextTick } from 'vue';
import { emitFunc, VueEmit } from '@polyv/vue-components';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { usePageStore } from '@/store/use-page-store';
import { useAuthStore } from '@/store/use-auth-store';
import { useShareStore } from '@/store/use-share-store';
import { useInviteStore } from '@/store/use-invite-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { useWindowResizeListener } from '@/hooks/core/use-window-resize-listener';
import { useScreenOrientHook } from '@/hooks/core/use-screen-orient';
import { useWeixinShareConfigUpdate } from '@/hooks/platform/use-weixin/use-weixin-config';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { AuthSpecialQueryParams } from '@/components/page-splash-common/auth/hooks/use-auth-special';

import { tabletLoadDesktopTemplate } from '@/assets/utils/browser';

import { useGlobalInject } from '@/app/use-global-inject';
import { DirectBusinessPageType } from '@/app/layout/direct-business-page/type';
import { useIarSetup } from '@/app/layout/main-enter/_hooks/use-iar-setup';
import { useLiveActivitySetup } from '@/app/layout/main-enter/_hooks/use-live-activity-setup';
import { useConnectMicSetup } from '@/app/layout/main-enter/_hooks/use-connect-mic-setup';
import { useEmotionSetup } from './use-emotion-setup';
import { useIdentityStore } from '@/store/use-identity-store';
import { useWatchAICoreSetup } from './use-watch-ai-core-setup';
import { usePlayerFullscreenCleanup } from './use-player-fullscreen-cleanup';
import { useLangStore } from '@/store/use-lang-store';

/**
 * 页面尺寸初始化设置
 */
export const usePageSizeSetup = () => {
  const pageStore = usePageStore();
  const { isSmallWindow } = storeDefinitionToRefs(useWebviewStore);

  function savePageSize() {
    pageStore.resetUpPageSize();
    document.documentElement.style.setProperty(
      '--plv-watch-full-screen-vw',
      `${pageStore.pageClientWidth}px`,
    );
    document.documentElement.style.setProperty(
      '--plv-watch-full-screen-vh',
      `${pageStore.pageClientHeight}px`,
    );
  }

  watch(isSmallWindow, () => {
    setTimeout(() => {
      savePageSize();
    }, 300);
  });

  useWindowResizeListener(
    () => {
      savePageSize();
    },
    {
      autoListen: true,
      immediately: true,
    },
  );

  if (tabletLoadDesktopTemplate) {
    useScreenOrientHook({
      autoListenCb: () => {
        setTimeout(() => {
          savePageSize();
        }, 0);
      },
    });
  }
};

export const mainEnterEmits = () => ({
  /**
   * 页面挂载
   * @warn 由于 main 组件只是一个容器，在真正的页面组件挂载前可能就会触发 mounted 了，所以 main 组件改用这个事件来等效 mounted
   * */
  'page-mounted': emitFunc<void>(),
});

export const useMainEnter = (options: {
  emit: VueEmit<typeof mainEnterEmits>;
  watchLoader?: () => Promise<unknown>;
}) => {
  const { emit, watchLoader } = options;
  const { removeQueryParam } = useQueryParams();

  const { getWatchCore } = useGlobalInject();

  const { loadIarSDK } = useIarSetup();
  const { setupLiveActivities } = useLiveActivitySetup();

  const { loadWatchAICore } = useWatchAICoreSetup();

  const { setupEmotionParser } = useEmotionSetup();

  const { setupConnectMic } = useConnectMicSetup();

  // 销毁播放器时复位全屏状态（页面维度统一处理，覆盖 PC/移动横屏/移动竖屏）
  usePlayerFullscreenCleanup();

  const { updateWeixinShareConfig } = useWeixinShareConfigUpdate();

  const watchCore = getWatchCore();

  const watchAppStore = useWatchAppStore();
  const authStore = useAuthStore();
  const shareStore = useShareStore();
  const inviteStore = useInviteStore();
  const playbackStore = usePlaybackStore();
  const langStore = useLangStore();

  const webviewStore = useWebviewStore();

  const { isGuest } = storeDefinitionToRefs(useIdentityStore);

  /**
   * 拦截观看页页面初始化
   * @desc 存在需要拦截的情况下，拦截器内部会自行处理，调用方需要终止初始化函数继续执行
   * @returns 是否需要拦截
   * */
  function interceptWatchPageLoad() {
    const needTargetSession = watchCore.channel.getTargetSessionEnabled();
    const inTargetSession = watchCore.inTargetSession();

    if (needTargetSession && !inTargetSession) {
      watchAppStore.setDirectBusinessPage({
        pageType: DirectBusinessPageType.SessionSelectPage,
      });
      return true;
    }

    return false;
  }

  watch(
    () => watchAppStore.shouldShowSplash,
    async newVal => {
      if (watchAppStore.shouldShowForceAuth) {
        return;
      }

      if (newVal === false) {
        const needIntercept = interceptWatchPageLoad();
        if (needIntercept) return;

        if (watchLoader) {
          await watchLoader();
        }
        // 从引导页进入观看页
        await watchAppStore.setupLiveWatch();
      }
    },
    {
      immediate: true,
    },
  );

  /** 移除 url 上的授权参数 */
  function removeUrlAuthQueryParams() {
    if (!authStore.isAuthorized) return;

    removeQueryParam([
      'forceUserAuth',
      'name',
      'password',
      'phoneAuthToken',
      ...AuthSpecialQueryParams,
    ]);
  }

  usePageSizeSetup();

  onBeforeMount(() => {
    removeQueryParam(['snapshotPage']);

    // 设置表情解析器
    setupEmotionParser();
  });

  watch(
    () => playbackStore.currentPlaybackTarget,
    () => {
      if (playbackStore.currentPlaybackTarget) {
        nextTick(() => {
          playbackStore.appendPlaybackQueueParams();
        });
      }
    },
  );

  // 在 onMounted 之后触发
  async function onPageMounted() {
    console.log('[render] main-enter mounted');
    emit('page-mounted');

    // 处理当前链接的参数拼接
    removeUrlAuthQueryParams();
    shareStore.appendShareQueueParams();
    inviteStore.appendInviteQueueParams();
    playbackStore.appendPlaybackQueueParams();

    await langStore.checkLangCache();

    // 页面组件 mounted 后需要再更新一遍分享配置，确保数据正确
    updateWeixinShareConfig();

    // 初始化 webview 逻辑
    if (webviewStore.isPlvWebview) {
      await webviewStore.initWebviewBridge();
    }

    await loadIarSDK();

    // 处理需要等观看页加载完后的逻辑
    if (watchAppStore.watchPageInited) {
      loadWatchAICore();

      if (webviewStore.isPlvWebview) {
        // 进入观看页后初始化webview
        webviewStore.initWebview();
      }

      // 互动大屏活动仅在观看页初始化，且不阻塞聊天室连接
      setupLiveActivities().catch(error => {
        console.error('[live-activity] setup failed', error);
      });

      // 连接聊天室以及初始化连麦，游客登录不需连麦
      await watchAppStore.setupWatchCoreConnect();
      // 延迟设置连麦功能
      setTimeout(() => {
        if (!isGuest.value) {
          setupConnectMic();
        }
      }, 0);
    }
  }

  return {
    onPageMounted,
  };
};
