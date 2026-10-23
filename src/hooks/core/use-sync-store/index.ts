/**
 * @file 观看页应用 Store 数据同步 Hook
 */

import { useAuthStore } from '@/store/use-auth-store';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useChatStore } from '@/store/use-chat-store';
import { useCommonStore } from '@/store/use-common-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useFinanceStore } from '@/store/use-finance-store';
import { useIdentityStore } from '@/store/use-identity-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useInviteStore } from '@/store/use-invite-store';
import { useLangStore } from '@/store/use-lang-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { useMicroActivityStore } from '@/store/use-micro-activity-store';
import { useMultiMeetingStore } from '@/store/use-multi-meeting-store';
import { useAdvertStore } from '@/store/use-advert-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { usePlayerStore } from '@/store/use-player-store';
import { useRedpackStore } from '@/store/use-redpack-store';
import { useShareStore } from '@/store/use-share-store';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { useThemeStore } from '@/store/use-theme-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useWeixinStore } from '@/store/use-weixin-store';
import { useWithdrawStore } from '@/store/use-withdraw-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { useEnrollStore } from '@/store/use-enroll-store';

export const useSyncStoreForWatchApp = () => {
  const commonStore = useCommonStore();

  const channelStore = useChannelStore();
  const channelInfoStore = useChannelInfoStore();
  const viewerStore = useViewerStore();

  const layoutStore = useLayoutStore();
  const themeStore = useThemeStore();

  const shareStore = useShareStore();
  const inviteStore = useInviteStore();
  const multiMeetingStore = useMultiMeetingStore();
  const identityStore = useIdentityStore();

  /**
   * 初始化 watchApp 时同步 Store
   * @desc 引导页和观看页共用的数据需要在应用初始化时同步
   */
  function syncStoreBeforeWatchAppInited() {
    commonStore.syncCommonStore();

    channelStore.syncChannelStore();
    channelInfoStore.syncChannelInfo();
    identityStore.syncIdentityStore();
    viewerStore.syncViewerInfo();

    layoutStore.syncLayoutStore();
    themeStore.syncThemeStore();

    shareStore.syncShareStore();
    inviteStore.syncInviteInfo();
    multiMeetingStore.syncMultiMeetingStore();
  }

  return {
    syncStoreBeforeWatchAppInited,
  };
};

export const useSyncStoreForWatchCore = () => {
  const watchAppStore = useWatchAppStore();
  const channelStore = useChannelStore();
  const channelInfoStore = useChannelInfoStore();
  const channelMenuStore = useChannelMenuStore();
  const themeStore = useThemeStore();

  const authStore = useAuthStore();
  const weixinStore = useWeixinStore();
  const langStore = useLangStore();

  const financeStore = useFinanceStore();
  const liveBookingStore = useLiveBookingStore();
  const multiMeetingStore = useMultiMeetingStore();

  /**
   * PolyvWatchCoreEvents.WatchCoreSetuped 钩子同步 Store
   * @desc 同步需要响应授权变化或者接口变化的数据
   * @warn 优先使用 watchCore 对应模块的钩子同步，如果模块没有对应的钩子，才在这里统一同步
   */
  function syncStoreAfterWatchCoreSetuped() {
    watchAppStore.syncWatchAppStore();
    channelStore.syncChannelStore();
    channelInfoStore.syncChannelInfo();
    channelMenuStore.syncChannelMenus();
    themeStore.syncThemeStore();

    authStore.syncAuthStore();
    weixinStore.syncWeixinStore();
    langStore.syncLangStore();

    liveBookingStore.syncLiveBookingStore();
    financeStore.syncFinanceStore();
    multiMeetingStore.syncMultiMeetingStore();
  }

  return {
    syncStoreAfterWatchCoreSetuped,
  };
};

export const useSyncStoreForWatchPage = () => {
  const channelMenuStore = useChannelMenuStore();
  const chatStore = useChatStore();
  const playerStore = usePlayerStore();
  const playbackStore = usePlaybackStore();
  const interactReceiveStore = useInteractReceiveStore();

  const redpackStore = useRedpackStore();
  const withdrawStore = useWithdrawStore();
  const donateStore = useDonateStore();
  const shareStore = useShareStore();
  const inviteStore = useInviteStore();
  const microActivityStore = useMicroActivityStore();
  const pageAdvertStore = useAdvertStore();
  const enrollStore = useEnrollStore();

  const viewerStore = useViewerStore();
  const subtitleStore = useSubtitleStore();
  const webviewStore = useWebviewStore();

  /**
   * 进入到观看页前同步 Store
   * @desc 同步进入到观看页面才需要用到的数据
   */
  function syncStoreBeforeWatchPageInited() {
    channelMenuStore.syncChannelMenus();
    chatStore.syncChatStore();
    playerStore.syncPlayerStore();
    playbackStore.syncPlaybackStore();
    interactReceiveStore.syncInteractStore();

    redpackStore.syncRedpackStore();
    withdrawStore.syncWithdrawStore();
    donateStore.syncDonateStore();
    shareStore.syncShareStore();
    inviteStore.syncInviteInfo();
    microActivityStore.syncMicroActivityStore();
    pageAdvertStore.syncAdvertStore();
    enrollStore.syncEnrollInfo();

    webviewStore.syncWebviewInfo();
    /**
     * 检查是否需要实名认证
     * @description 不影响页面进入流程，无需 await
     */
    viewerStore.syncNeedRealNameAuth();

    subtitleStore.syncSubtitleConfig();
  }

  function syncStoreAfterWatchPageInited() {
    // 直播实时字幕 || 存在回放字幕
    if (subtitleStore.subtitleRealTimeEnabled || subtitleStore.replaySubtitleList.length) {
      subtitleStore.initSubtitleSourceTranslateLanguageOptionMap();
      // 在确认有字幕功能后，从本地存储初始化字幕设置
      subtitleStore.initSubtitleSettingsFromStorage();
    }
  }

  return {
    syncStoreBeforeWatchPageInited,
    syncStoreAfterWatchPageInited,
  };
};
