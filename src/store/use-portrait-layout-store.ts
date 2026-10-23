import { translate } from '@/assets/lang';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { LiveStatus } from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { useChannelStore } from './use-channel-store';
import { useChatStore } from './use-chat-store';
import { useDocStore } from './use-doc-store';
import { usePageStore } from './use-page-store';
import { usePlaybackStore } from './use-playback-store';
import { usePlayerStore } from './use-player-store';
import { useWebviewStore } from './use-webview-store';

export enum PortraitChatTabName {
  /** 聊天室 */
  'Chat' = 'Chat',
  /** 提问区 */
  'Ask' = 'Ask',
}

export interface PortraitLayoutStoreState {
  /** 移动端竖屏播放器是否支持全屏 */
  portraitPlayerFullscreenEnabled: Ref<boolean>;
  /** 移动端竖屏全屏按钮是否可见 */
  portraitPlayerFullscreenBtnVisible: ComputedRef<boolean>;
  /**
   * 是否移动端播放器竖屏页面全屏
   * @warn 更新该标识位时需要同步更新 mobilePlayerIsPageFullscreen
   * */
  portraitPlayerIsPageFullscreen: Ref<boolean>;
  /** 竖屏轮播屏当前索引 */
  carouselActiveIndex: Ref<number>;
  /** 是否在主屏 */
  isMainCarouselScreen: ComputedRef<boolean>;
  /** 是否在空白屏 */
  isBlankCarouselScreen: ComputedRef<boolean>;
  /** 切到主屏 */
  switchToMainCarouselScreen: () => void;
  /** 切到空白屏 */
  switchToBlankCarouselScreen: () => void;
  /** 竖屏文档容器内容渲染高度 */
  portraitDocContentHeight: ComputedRef<number>;
  /** 竖屏文档容器渲染高度 */
  portraitDocWrapHeight: ComputedRef<number>;
  /** 竖屏观看布局高度 */
  portraitWatchLayoutHeight: Ref<number>;
  /** 频道信息位置 */
  channelInfoSeat: ComputedRef<0 | 1>;
  /** 竖屏消息区激活的 Tab 栏 */
  portraitMessageTabCurrentName: Ref<PortraitChatTabName>;
  /** 竖屏消息输入框占位符 */
  portraitMessageInputPlaceholder: ComputedRef<string>;
  /** 竖屏消息输入框是否显示 */
  portraitMessageInputVisible: Ref<boolean>;
  /** 竖屏在线用户列表入口是否显示 */
  portraitOnlineListEntranceVisible: ComputedRef<boolean>;
  /** 竖屏文档位置切换按钮是否可见 */
  portraitDocSideSwitchVisible: ComputedRef<boolean>;
}

export interface PortraitStore extends PortraitLayoutStoreState {}

/**
 * 竖屏布局 store
 */
export const usePortraitLayoutStore = defineStore<'portraitLayout', PortraitStore>(
  'portraitLayout',
  () => {
    const channelStore = useChannelStore();
    const pageStore = usePageStore();
    const playbackStore = usePlaybackStore();
    const playerStore = usePlayerStore();
    const docStore = useDocStore();
    const webviewStore = useWebviewStore();
    const chatStore = useChatStore();
    const connectMicStore = useConnectMicStore();

    /** 移动端竖屏播放器是否支持全屏 */
    const portraitPlayerFullscreenEnabled = ref(true);

    /** 是否移动端播放器竖屏页面全屏 */
    const portraitPlayerIsPageFullscreen = ref(false);

    /** 移动端竖屏全屏按钮是否可见 */
    const portraitPlayerFullscreenBtnVisible = computed(() => {
      if (docStore.canRenderDoc) {
        return false;
      }

      if (
        !playerStore.playerInited ||
        playerStore.isPortraitResolutionRate ||
        // CDN 播放器 Android 系统下未播放前全屏会导致页面卡死
        !playerStore.isPlayStarted
      ) {
        return false;
      }

      if (channelStore.liveStatus === LiveStatus.Playback && portraitPlayerIsPageFullscreen.value) {
        return false;
      }

      return portraitPlayerFullscreenEnabled.value;
    });

    /** 移动端竖屏文档位置切换按钮是否可见 */
    const portraitDocSideSwitchVisible = computed(() => {
      if (
        !docStore.canRenderDoc ||
        !playerStore.playerInited ||
        playerStore.isPortraitResolutionRate ||
        !playerStore.isPlayStarted ||
        connectMicStore.masterMicItem
      ) {
        return false;
      }

      return true;
    });

    /** 竖屏轮播屏当前索引 */
    const carouselActiveIndex = ref(1);

    /** 是否在主屏 */
    const isMainCarouselScreen = computed(() => {
      return carouselActiveIndex.value === 1;
    });

    /** 是否在空白屏 */
    const isBlankCarouselScreen = computed(() => {
      return carouselActiveIndex.value === 0;
    });

    /** 切到主屏 */
    const switchToMainCarouselScreen = () => {
      carouselActiveIndex.value = 1;
    };

    /** 切到空白屏 */
    const switchToBlankCarouselScreen = () => {
      carouselActiveIndex.value = 0;
    };

    /** 竖屏消息区激活的 Tab 栏 */
    const portraitMessageTabCurrentName = ref(PortraitChatTabName.Chat);

    /** 输入框占位符 */
    const portraitMessageInputPlaceholder = computed(() => {
      let placeholder = chatStore.chatInputPlaceholder;

      if (unref(portraitMessageTabCurrentName) === PortraitChatTabName.Ask) {
        placeholder = translate('ask.input.placeholder');
      }

      if (chatStore.chatRoomLongTimeNotUsed || chatStore.chatExited) {
        placeholder = translate('chat.roomClosed');
      }

      return placeholder;
    });

    /** 竖屏消息输入框是否显示 */
    const portraitMessageInputVisible = ref(false);

    /** 竖屏文档容器内容渲染高度 */
    const portraitDocContentHeight = computed<number>(() => {
      const pageClientWidth = pageStore.pageClientWidth;
      const documentProportion = docStore.documentProportion;

      // 最小高度为 9:16
      const minHeight = pageClientWidth * (9 / 16);
      // 最大高度为 3:4
      const maxHeight = pageClientWidth * (3 / 4);

      if (!documentProportion) {
        return minHeight;
      }

      let wrapHeight = pageClientWidth / documentProportion;
      if (wrapHeight >= maxHeight) {
        wrapHeight = maxHeight;
      }
      if (wrapHeight <= minHeight) {
        wrapHeight = minHeight;
      }
      return wrapHeight;
    });

    /** 竖屏文档容器渲染高度 */
    const portraitDocWrapHeight = computed<number>(() => {
      if (!docStore.canRenderDoc || !docStore.documentSwitch || webviewStore.isSmallWindow) {
        return 0;
      }

      return portraitDocContentHeight.value;
    });

    const portraitWatchLayoutHeight = ref(0);

    /** 频道信息位置 */
    const channelInfoSeat = computed<0 | 1>(() => {
      if (isBuildForFeedMainMode()) {
        return 1;
      }

      if (
        channelStore.isPptChannel &&
        (channelStore.liveStatus === LiveStatus.Live || playbackStore.isPlaybacking)
      ) {
        return 0;
      }
      return 1;
    });

    const portraitOnlineListEntranceVisible = computed(() => channelStore.onlineListEnabled);

    return {
      portraitPlayerFullscreenEnabled,
      portraitPlayerFullscreenBtnVisible,
      portraitPlayerIsPageFullscreen,
      carouselActiveIndex,
      isMainCarouselScreen,
      isBlankCarouselScreen,
      switchToMainCarouselScreen,
      switchToBlankCarouselScreen,
      portraitMessageTabCurrentName,
      portraitDocContentHeight,
      portraitDocWrapHeight,
      channelInfoSeat,
      portraitMessageInputPlaceholder,
      portraitMessageInputVisible,
      portraitOnlineListEntranceVisible,
      portraitWatchLayoutHeight,
      portraitDocSideSwitchVisible,
    };
  },
);
