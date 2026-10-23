import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { ChatEvents } from '@polyv/live-watch-sdk';
import { onBeforeUnmount, onMounted, ref } from 'vue';

/**
 * 聊天新消息提醒 hook
 */
export const useChatReminder = (hookOptions: { onChatMsg: () => void }) => {
  const { onChatMsg } = hookOptions;

  const { getWatchCore } = useMultiPolyvWatchApp();

  /** 聊天消息红点提示是否可见 */
  const chatReminderVisible = ref(false);

  function updateChatReminderVisible(visible: boolean) {
    chatReminderVisible.value = visible;
  }

  /**
   * 监听聊天室消息
   */
  function listenChatMsg() {
    unlistenChatMsg();
    const watchCore = getWatchCore();
    watchCore.chat.eventEmitter.on(ChatEvents.ChatMessage, onChatMsg);
  }

  function unlistenChatMsg() {
    const watchCore = getWatchCore();
    watchCore.chat.eventEmitter.off(ChatEvents.ChatMessage, onChatMsg);
  }

  onMounted(() => {
    listenChatMsg();
  });

  onBeforeUnmount(() => {
    unlistenChatMsg();
  });

  return {
    chatReminderVisible,
    updateChatReminderVisible,
  };
};
