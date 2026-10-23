import { ChatMsgCustomerMessageType } from '@polyv/live-watch-sdk';
import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';

export const useCustomerMsg = () => {
  const { chatMsg } = useChatMsgDataInject<ChatMsgCustomerMessageType>();

  return {
    chatMsg,
  };
};
