import { ChatMsgRedpaperReceiveType } from '@polyv/live-watch-sdk';
import { computed, unref } from 'vue';
import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';

export const useRedpaperReceiveMsg = () => {
  const { chatMsg } = useChatMsgDataInject<ChatMsgRedpaperReceiveType>();

  /** 领取人昵称 */
  const receiveNick = computed<string>(() => {
    return unref(chatMsg).nick;
  });

  /** 是否红包雨 */
  const isRedpaperRain = computed<boolean>(() => {
    return unref(chatMsg).type.includes('rain');
  });

  /** 是否答题红包 */
  const isRedpaperQuestion = computed<boolean>(() => {
    return unref(chatMsg).type.includes('question');
  });

  /** 是否口令红包 */
  const isRedpaperPassword = computed<boolean>(() => {
    return unref(chatMsg).type.includes('password');
  });

  /** 是否领取完 */
  const isOver = computed<boolean>(() => {
    return unref(chatMsg).isOver;
  });

  return {
    receiveNick,
    isRedpaperRain,
    isRedpaperPassword,
    isOver,
    isRedpaperQuestion,
  };
};
