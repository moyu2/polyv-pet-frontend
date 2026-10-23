/**
 * @file 聊天室消息时间相关 hook
 */
import { DATE_FORMAT_HM, DATE_FORMAT_SLASH } from '@/assets/constants/date-format';
import { formatDate } from '@polyv/utils/date';
import { computed, ComputedRef, inject, InjectionKey, provide, unref } from 'vue';
import { ChatMsgDataContext } from './chat-msg-data-hook';

/** 消息间隔时间 */
const MSG_TIME_GAP = 2 * 60 * 1000;

export interface ChatMsgTimeContext {
  /** 是否显示消息的时间 */
  showMsgTime: ComputedRef<boolean>;
  /** 消息时间文案 */
  msgTimeText: ComputedRef<string>;
}

export const MSG_TIME_INJECT_KEY: InjectionKey<ChatMsgTimeContext> = Symbol('MsgTime');

/**
 * 注入聊天室消息时间
 * @param context 聊天室消息用户上下文
 */
export const useChatMsgTimeProvide = (context: ChatMsgTimeContext) => {
  provide(MSG_TIME_INJECT_KEY, context);
};

/**
 * 获取聊天室消息时间的注入
 */
export const useChatMsgTimeInject = () => {
  return inject(MSG_TIME_INJECT_KEY) as ChatMsgTimeContext;
};

/**
 * 聊天室消息时间 hook
 * @param chatMsgData
 * @param autoProvide
 */
export const useChatMsgTime = (chatMsgData: ChatMsgDataContext, autoProvide = true) => {
  const { chatMsg, prevChatMsg } = chatMsgData;

  /**
   * 是否显示消息的时间
   */
  const showMsgTime = computed<boolean>(() => {
    const prevMsg = unref(prevChatMsg);
    const msg = unref(chatMsg);

    if (!prevMsg) {
      return false;
    }

    if (msg.time - prevMsg.time > MSG_TIME_GAP) {
      return true;
    }

    return false;
  });

  /**
   * 消息时间文案
   */
  const msgTimeText = computed<string>(() => {
    const time = unref(chatMsg).time;
    const tdtime = new Date().toLocaleDateString();
    const showTime = new Date(time);
    const ottime = showTime.toLocaleDateString();
    let timeContent = '';

    if (tdtime !== ottime) {
      timeContent = formatDate(time, DATE_FORMAT_SLASH);
    } else {
      timeContent = formatDate(time, DATE_FORMAT_HM);
    }

    return timeContent;
  });

  const chatMsgTimeContext: ChatMsgTimeContext = {
    showMsgTime,
    msgTimeText,
  };

  if (autoProvide) {
    useChatMsgTimeProvide(chatMsgTimeContext);
  }

  return chatMsgTimeContext;
};
