import { ChatMsgSystemType } from '@polyv/live-watch-sdk';
import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';

export const useSystemMsg = () => {
  const { chatMsg } = useChatMsgDataInject<ChatMsgSystemType>();

  return {
    chatMsg,
  };
};
