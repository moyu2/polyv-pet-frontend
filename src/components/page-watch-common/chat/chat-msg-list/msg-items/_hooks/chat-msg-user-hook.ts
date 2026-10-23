/**
 * @file 聊天消息用户相关 hook
 */
import { fitProtocol } from '@/assets/utils/url';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { useChatStore } from '@/store/use-chat-store';
import { useCommonStore } from '@/store/use-common-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { ChatMessageUser, ChatMsgType, ChatUserType } from '@polyv/live-watch-sdk';
import { ComputedRef, InjectionKey, computed, inject, provide, unref } from 'vue';
import { useHideChatMsgActorHook } from '../../hooks/hide-chat-msg-hook';
import { useLayoutStore } from '@/store/use-layout-store';

/**
 * 聊天室消息用户上下文
 */
export interface ChatMsgUserContext {
  /** 消息的用户信息 */
  msgUser: ComputedRef<ChatMessageUser | undefined>;
  /** 消息的用户昵称 */
  msgUserNick: ComputedRef<string>;
  /** 消息的用户头像 */
  msgUserAvatar: ComputedRef<string>;
  /** 消息的用户类型 */
  msgUserType: ComputedRef<ChatUserType | undefined>;
  /** 消息的用户头衔 */
  msgUserActor: ComputedRef<string | undefined>;
  /** 消息的用户提问区标签 */
  msgUserQuestionLabels: ComputedRef<string[]>;
  /** 是否隐藏消息的用户头衔 */
  hideUserActor: ComputedRef<boolean>;
  /** 是否隐藏消息的用户头像 */
  hideUserAvatar: ComputedRef<boolean>;
  /** 是否为自己发言 */
  isSelfMsg: ComputedRef<boolean>;
  /** 是否为特殊用户 */
  isSpecialUser: ComputedRef<boolean>;
}

/**
 * 聊天消息用户相关 hook
 * @param chatMsgRef 聊天消息响应式对象
 */
export const useChatMsgUserBasic = (chatMsgRef: ResponsiveRef<ChatMsgType | undefined>) => {
  const viewerStore = useViewerStore();
  const chatStore = useChatStore();
  const chatMsgStore = useChatMsgStore();
  const commonStore = useCommonStore();
  const layoutStore = useLayoutStore();

  const { needHideActorByUserType } = useHideChatMsgActorHook();

  /**
   * 消息的用户信息
   */
  const msgUser = computed<ChatMessageUser | undefined>(() => {
    if (!chatMsgRef.value) {
      return;
    }
    return chatMsgStore.getChatMsgUser(chatMsgRef.value);
  });

  /**
   * 消息的用户昵称
   */
  const msgUserNick = computed<string>(() => {
    const user = unref(msgUser);
    return user?.nick ?? '';
  });

  /**
   * 消息的用户头像
   */
  const msgUserAvatar = computed<string>(() => {
    const user = unref(msgUser);
    return fitProtocol(user?.pic ?? commonStore.plvDefaultResource.defaultViewerAvatar);
  });

  /**
   * 是否隐藏消息的用户头像
   */
  const hideUserAvatar = computed<boolean>(() => {
    if (layoutStore.isPortraitWatchLayout) {
      return !chatStore.chatSetting.portraitChatMessageAvatarDisplay;
    }
    return !chatStore.chatSetting.chatMessageAvatarDisplay;
  });

  /**
   * 消息的用户类型
   */
  const msgUserType = computed<ChatUserType | undefined>(() => {
    const user = unref(msgUser);
    return user?.userType;
  });

  /**
   * 消息的用户头衔
   */
  const msgUserActor = computed<string | undefined>(() => {
    const user = unref(msgUser);
    return user?.actor;
  });

  /**
   * 消息的用户头衔
   */
  const msgUserQuestionLabels = computed<string[]>(() => {
    const user = unref(msgUser);
    return user && user.label && Array.isArray(user.label.question) ? user.label.question : [];
  });

  /**
   * 是否为自己发言
   */
  const isSelfMsg = computed<boolean>(() => {
    return unref(msgUser)?.userId === viewerStore.viewerId;
  });

  /**
   * 是否隐藏消息的用户头衔
   * */
  const hideUserActor = computed<boolean>(() => {
    return !msgUserActor.value || needHideActorByUserType(msgUserType.value);
  });

  /**
   * 是否为特殊用户
   */
  const isSpecialUser = computed<boolean>(() => {
    if (!chatMsgRef.value) {
      return false;
    }
    return chatMsgStore.isSpecialUserMsg(chatMsgRef.value);
  });

  const chatMsgUserContext: ChatMsgUserContext = {
    msgUser,
    msgUserNick,
    msgUserAvatar,
    msgUserType,
    msgUserActor,
    msgUserQuestionLabels,
    isSelfMsg,
    isSpecialUser,
    hideUserActor,
    hideUserAvatar,
  };

  return chatMsgUserContext;
};

export const MSG_USER_INJECT_KEY: InjectionKey<ChatMsgUserContext> = Symbol('MsgUser');

/**
 * 注入聊天室消息用户
 * @param context
 */
export const useChatMsgUserProvide = (context: ChatMsgUserContext) => {
  provide(MSG_USER_INJECT_KEY, context);
};

/**
 * 获取聊天室消息用户的注入
 */
export const useChatMsgUserInject = () => {
  return inject(MSG_USER_INJECT_KEY) as ChatMsgUserContext;
};

type UseChatMsgUserOptions = {
  /** 聊天消息响应式对象 */
  chatMsg: ResponsiveRef<ChatMsgType | undefined>;
};

/**
 * 聊天室消息用户 hook
 * @param options
 * @param autoProvide
 */
export const useChatMsgUser = (options: UseChatMsgUserOptions, autoProvide = true) => {
  const { chatMsg } = options;

  const chatMsgUserContext = useChatMsgUserBasic(chatMsg);

  if (autoProvide) {
    useChatMsgUserProvide(chatMsgUserContext);
  }

  return chatMsgUserContext;
};
