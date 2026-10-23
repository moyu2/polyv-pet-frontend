/**
 * @file 聊天室 store
 */

import { translate } from '@/assets/lang';
import { isMobile } from '@/assets/utils/browser';
import { ErrorVerifyType, useErrorVerify } from '@/hooks/core/use-error-verify';
import {
  ChannelMenuType,
  ChatMsgQuoteOriginType,
  ChatSetting,
  LiveStatus,
  PlvChatModule,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { useChannelMenuStore } from './use-channel-menu-store';
import { usePlaybackStore } from './use-playback-store';
import { useViewerStore } from './use-viewer-store';
import { useChannelStore } from './use-channel-store';
import { useWatchAppStore } from './use-watch-app-store';
import { useIdentityStore } from './use-identity-store';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { useLayoutStore } from './use-layout-store';
import { useThemeStore } from './use-theme-store';

export interface ChatStoreState {
  /** 聊天室设置信息 */
  chatSetting: Ref<ChatSetting>;
  /** V2 聊天室 SDK 安装完成 */
  chatSdkV2Setuped: Ref<boolean>;
  /** 是否使用 v2 版本的聊天室 UI */
  isChatUIV2: ComputedRef<boolean>;
  /** 聊天室是否长时间未使用 */
  chatRoomLongTimeNotUsed: ComputedRef<boolean>;
  /** 聊天室长时间未使用提示文案 */
  chatRoomLongTimeNotUsedText: ComputedRef<string>;
  /** 配置是否启用聊天列表 */
  chatMsgListEnabled: Ref<boolean>;
  /** 聊天室是否连接失败 */
  connectError: Ref<boolean>;
  /** 聊天室是否被退出 */
  chatExited: Ref<boolean>;
  /** 聊天室是否已关闭 */
  chatRoomIsClosed: Ref<boolean>;
  /** 表情资源加载完成  */
  emotionResourceLoaded: Ref<boolean>;
  /** 当前用户是否被踢出 */
  isKicked: Ref<boolean>;
  /** 当前用户是否被禁言 */
  isShield: Ref<boolean>;
  /** 点赞功能是否可用 */
  likeFeatureEnabled: ComputedRef<boolean>;
  /** 单击点赞开关 */
  likeSingleClickEnabled: ComputedRef<boolean>;
  /** 长按点赞开关 */
  likeHoldEnabled: ComputedRef<boolean>;
  /** 点赞图标链接 */
  likeIconUrl: ComputedRef<string>;
  /** 实时的点赞数 */
  realtimeLikes: Ref<number>;
  /** "只看特殊角色的消息"的控件是否展示 */
  onlySpecialMsgWidgetVisible: ComputedRef<boolean>;
  /** 只看特殊角色的消息（包括我本地发的） */
  onlySpecialMsg: Ref<boolean>;
  /** 聊天室在线人数 */
  onlineUserCount: Ref<number>;
  /** 聊天室区域控制栏是否可用 */
  chatInputControllerEnable: ComputedRef<boolean>;
  /** 移动端固定聊天输入框是否显示 */
  mobileChatInputFixedVisible: Ref<boolean>;
  /** 聊天室输入框占位符 */
  chatInputPlaceholder: ComputedRef<string>;
  /** 是否禁用聊天室输入框 */
  chatInputDisabled: ComputedRef<boolean>;
  /** 当前正在引用的聊天消息 */
  currentQuoteMsg: Ref<ChatMsgQuoteOriginType | undefined>;
  /** 聊天室在线人数是否展示 */
  chatOnlineNumberEnable: ComputedRef<boolean>;
}

export interface ChatStoreAction {
  /** 切换 onlySpecialMsg */
  toggleOnlySpecialMsg(): void;
  /** 同步聊天室 store */
  syncChatStore(): void;
}

export interface ChatStore extends ChatStoreState, ChatStoreAction {}

export const useChatStore = defineStore<'chat', ChatStore>('chat', () => {
  const watchAppStore = useWatchAppStore();
  const channelStore = useChannelStore();
  const channelMenuStore = useChannelMenuStore();
  const identityStore = useIdentityStore();
  const viewerStore = useViewerStore();
  const playbackStore = usePlaybackStore();
  const layoutStore = useLayoutStore();
  const themeStore = useThemeStore();
  const { paramGetter } = useQueryParams();

  const { redirectToErrorVerify } = useErrorVerify();

  /** 聊天室设置信息 */
  const chatSetting = ref<ChatSetting>(PlvChatModule.generateDefaultChatSetting());

  /** V2 聊天室 SDK 安装完成 */
  const chatSdkV2Setuped = ref(false);

  /** 是否使用 v2 版本的聊天室 UI */
  const isChatUIV2 = computed(() => {
    if (paramGetter().chatUIVersion()) {
      return paramGetter().chatUIVersion() === 'v2';
    }

    return chatSetting.value.chatUIVersion === 'v2';
  });

  /** 聊天室是否长时间未使用 */
  const chatRoomVisible = computed(() => {
    if (channelStore.privateSeminarChannel) return false;

    return chatSetting.value.watchChatEnabled;
    // return false;
  });

  const chatRoomLongTimeNotUsed = computed(() => {
    return !chatRoomVisible.value;
    // return true;
  });

  const chatRoomLongTimeNotUsedText = computed(() => {
    if (channelStore.privateSeminarChannel) {
      return translate('seminar.disabledChat');
    }

    return translate('chat.closeTips');
  });

  /** 配置是否启用聊天列表 */
  const chatMsgListEnabled = ref(true);

  /** 聊天室是否连接失败 */
  const connectError = ref(false);

  /** 聊天室是否被退出 */
  const chatExited = ref(false);

  /** 聊天室是否已关闭 */
  const chatRoomIsClosed = ref(false);

  /** 表情资源加载完成  */
  const emotionResourceLoaded = ref(false);

  /** 当前用户是否被踢出 */
  const isKicked = ref(false);

  /** 当前用户是否被禁言 */
  const isShield = ref(false);

  /** 单击点赞开关 */
  const likeSingleClickEnabled = computed(() => {
    return chatSetting.value.likeSingleClickEnabled;
  });

  /** 长按点赞开关 */
  const likeHoldEnabled = computed(() => {
    return chatSetting.value.likeHoldEnabled;
  });

  /** 点赞功能是否可用 */
  const likeFeatureEnabled = computed(() => {
    return chatSetting.value.likeEnabled && !channelStore.isSeminarChannel;
  });

  /** 点赞图标链接 */
  const likeIconUrl = computed(() => {
    const likeIconType = chatSetting.value.likeIconType;

    // 处理支持多皮肤的点赞图标
    if (likeIconType !== '0' && likeIconType !== '-1') {
      const themeMode = themeStore.currentSkinColorMode;
      return `https://s2.videocc.net/default-img/like/like-btn-${likeIconType}-${themeMode}.png`;
    }

    return chatSetting.value.likeIconUrl;
  });

  /** 实时的点赞数 */
  const realtimeLikes = ref(0);

  /**
   * "只看特殊角色的消息"的控件是否展示
   * */
  const onlySpecialMsgWidgetVisible = computed(() => {
    if (playbackStore.chatMsgReplayEnabled) return false;

    return !chatSetting.value.filterManagerMsgEnabled;
  });

  /** 只看特殊角色的消息（包括我本地发的） */
  const onlySpecialMsg = ref(false);

  /** 切换 onlySpecialMsg */
  function toggleOnlySpecialMsg() {
    onlySpecialMsg.value = !unref(onlySpecialMsg);
  }

  /** 聊天室在线人数 */
  const onlineUserCount = ref(0);

  /** 聊天区输入框控制栏是否可用 */
  const chatInputControllerEnable = computed(() => {
    if (watchAppStore.isPlaybackWatchUrl) return false;

    // 研讨会相关
    if (
      channelStore.privateSeminarChannel ||
      (channelStore.isSeminarChannel && channelStore.liveStatus === LiveStatus.Playback)
    ) {
      return false;
    }

    if (!layoutStore.isPortraitWatchLayout && (chatRoomLongTimeNotUsed.value || chatExited.value)) {
      return false;
    }

    return true;
  });

  /** 移动端固定聊天输入框是否显示 */
  const mobileChatInputFixedVisible = ref(false);

  /** 聊天室输入框占位符 */
  const chatInputPlaceholder = computed<string>(() => {
    if (chatRoomLongTimeNotUsed.value || chatExited.value) {
      return translate('chat.roomClosed');
    }

    // 聊天室被强制关闭
    if (unref(chatRoomIsClosed)) {
      return translate('chat.roomClosed2');
    }

    // 聊天区域因为业务和配置不允许发言
    if (playbackStore.chatMsgReplayEnabled || !channelMenuStore.chatMenuData.visible) {
      return translate('chat.roomClosed');
    }

    let placeholder = translate('chat.input.placeholder');

    // 针对移动端在未设置昵称下更改文案
    if (isMobile && !viewerStore.hasNickname) {
      placeholder = translate('chat.input.placeholder3');
    }

    // 后台中聊天室的占位设置
    const chatMenu = channelMenuStore.getMenuData(ChannelMenuType.Chat);
    if (chatMenu && chatMenu.content) {
      placeholder = chatMenu.content;
    }

    if (identityStore.isGuest) {
      placeholder = translate('auth.login.tips.interaction');
    }

    return placeholder;
  });

  /** 是否禁用聊天室输入框 */
  const chatInputDisabled = computed<boolean>(() => {
    // 聊天室被关闭 || 聊天重放 || 需要实名认证 || 游客登录
    if (
      unref(chatRoomIsClosed) ||
      playbackStore.chatMsgReplayEnabled ||
      viewerStore.needRealNameAuth ||
      !viewerStore.hasNickname ||
      identityStore.needIdentityGuestForceLogin
    ) {
      return true;
    }

    if (chatRoomLongTimeNotUsed.value || chatExited.value) {
      return true;
    }

    return false;
  });

  /** 当前正在引用的聊天消息 */
  const currentQuoteMsg = ref<ChatMsgQuoteOriginType>();

  /** 聊天室在线人数是否展示 */
  const chatOnlineNumberEnable = computed(() => {
    return chatSetting.value.chatOnlineNumberEnable;
  });

  function syncChatStore(): void {
    const watchCore = watchAppStore.getWatchCore();
    const setting = watchCore.chat.getChatSetting();
    chatSetting.value = setting;

    if (!onlySpecialMsg.value && setting.filterManagerMsgEnabled) {
      onlySpecialMsg.value = true;
    }

    const chatInfo = watchCore.chat.getChatInfo();
    chatExited.value = chatInfo.chatExited;
    // chatExited.value = true;
    chatRoomIsClosed.value = chatInfo.chatRoomIsClosed;
    isKicked.value = chatInfo.isKicked;
    isShield.value = chatInfo.isShield;

    realtimeLikes.value = watchCore.chat.getRealtimeLikes();

    // 如果被踢出了则跳走页面
    if (isKicked.value) {
      redirectToErrorVerify({
        errorType: ErrorVerifyType.IsKicked,
      });
    }
  }

  return {
    chatSetting,
    chatSdkV2Setuped,
    isChatUIV2,
    chatRoomLongTimeNotUsed,
    chatRoomLongTimeNotUsedText,
    chatMsgListEnabled,

    connectError,
    chatExited,
    chatRoomIsClosed,
    emotionResourceLoaded,
    isKicked,
    isShield,

    likeFeatureEnabled,
    likeSingleClickEnabled,
    likeHoldEnabled,
    likeIconUrl,
    realtimeLikes,

    onlySpecialMsgWidgetVisible,
    onlySpecialMsg,

    onlineUserCount,

    chatInputControllerEnable,
    mobileChatInputFixedVisible,
    chatInputPlaceholder,
    chatInputDisabled,
    currentQuoteMsg,

    syncChatStore,
    toggleOnlySpecialMsg,

    chatOnlineNumberEnable,
  };
});
