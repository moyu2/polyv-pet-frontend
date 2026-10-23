import { ChatMsgCustomMessageType } from '@polyv/live-watch-sdk';
import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';

export const useCustomMsg = () => {
  const { chatMsg } = useChatMsgDataInject<ChatMsgCustomMessageType>();

  return {
    chatMsg,
  };
};
