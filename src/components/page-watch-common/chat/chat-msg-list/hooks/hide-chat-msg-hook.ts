import { computed } from 'vue';

import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { useChatStore } from '@/store/use-chat-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { ChatMsgSource, ChatUserType } from '@polyv/live-watch-sdk';

/**
 * 消息隐藏 hook
 */
export const useHideChatMsgHook = () => {
  const chatStore = useChatStore();
  const chatMsgStore = useChatMsgStore();

  const hideChatMsgSources: ChatMsgSource[] = [];

  /** ---------- 自定义消息是否显示 ---------- */
  if (!chatStore.chatSetting.showCustomMessageEnabled) {
    hideChatMsgSources.push(ChatMsgSource.CustomerMessage);
  }

  chatMsgStore.$patch({
    hideChatMsgSources,
  });
};

/**
 * 消息头衔隐藏 hook
 */
export const useHideChatMsgActorHook = () => {
  const viewerStore = useViewerStore();

  const hideActorUserType = computed(() => {
    if (!viewerStore.needHideUserActor) return [];

    return [ChatUserType.Student, ChatUserType.Slice, ChatUserType.Listener];
  });

  function needHideActorByUserType(userType?: ChatUserType) {
    if (!viewerStore.needHideUserActor) return false;

    if (!userType) return true;
    return hideActorUserType.value.includes(userType);
  }

  return {
    hideActorUserType,
    needHideActorByUserType,
  };
};
