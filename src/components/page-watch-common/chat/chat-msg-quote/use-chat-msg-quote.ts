import { useChatStore } from '@/store/use-chat-store';
import { storeToRefs } from 'pinia';
import { useChatMsgUserBasic } from '../chat-msg-list/msg-items/_hooks/chat-msg-user-hook';

export const useChatMsgQuoteControl = () => {
  const chatStore = useChatStore();
  const { currentQuoteMsg } = storeToRefs(chatStore);

  const { msgUserNick } = useChatMsgUserBasic(currentQuoteMsg);

  /** 点击关闭 */
  function onClickClose() {
    chatStore.$patch({
      currentQuoteMsg: undefined,
    });
  }

  return {
    currentQuoteMsg,
    msgUserNick,
    onClickClose,
  };
};
