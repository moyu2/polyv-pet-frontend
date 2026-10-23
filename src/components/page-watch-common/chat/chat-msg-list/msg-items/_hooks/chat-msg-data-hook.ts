import { VueProps } from '@polyv/vue-components';
import { ChatMsgType, ChatMsgQuoteType } from '@polyv/live-watch-sdk';
import { computed, ComputedRef, inject, InjectionKey, provide, unref } from 'vue';
import { ChatMsgItemCategory, chatMsgItemProps } from '../use-chat-msg-item';

/**
 * 聊天室消息数据上下文
 */
export interface ChatMsgDataContext<MsgType extends ChatMsgType = ChatMsgType> {
  category: ComputedRef<ChatMsgItemCategory>;
  /** 聊天消息 */
  chatMsg: ComputedRef<MsgType>;
  /** 上一条消息 */
  prevChatMsg: ComputedRef<MsgType | undefined>;
  /** 下一条消息 */
  nextChatMsg: ComputedRef<MsgType | undefined>;
  /** 消息 id */
  msgId: ComputedRef<string>;
  /** 消息引用内容 */
  msgQuote: ComputedRef<ChatMsgQuoteType | undefined>;
}

const MSG_DATA_INJECT_KEY: InjectionKey<ChatMsgDataContext> = Symbol('MsgData');

/**
 * 注入聊天室消息数据
 * @param context
 */
export const useChatMsgDataProvide = (context: ChatMsgDataContext) => {
  provide(MSG_DATA_INJECT_KEY, context);
};

/**
 * 获取聊天室消息数据的注入
 */
export const useChatMsgDataInject = <
  MsgType extends ChatMsgType = ChatMsgType,
>(): ChatMsgDataContext<MsgType> => {
  return inject(MSG_DATA_INJECT_KEY) as ChatMsgDataContext<MsgType>;
};

/**
 * 聊天室消息数据 hook
 * @param props
 * @param autoProvide
 */
export const useChatMsgData = (props: VueProps<typeof chatMsgItemProps>, autoProvide = true) => {
  const chatMsg = computed(() => props.chatMsg);
  const category = computed(() => props.category);
  const prevChatMsg = computed(() => props.prevChatMsg);
  const nextChatMsg = computed(() => props.nextChatMsg);

  /** 消息 id */
  const msgId = computed(() => unref(chatMsg).id);

  /** 引用内容 */
  const msgQuote = computed<ChatMsgQuoteType | undefined>(() => {
    const chatMsgVal = unref(chatMsg);
    if ('quote' in chatMsgVal) {
      return chatMsgVal.quote;
    }
    return undefined;
  });

  const chatMsgDataContext: ChatMsgDataContext = {
    category,
    chatMsg,
    prevChatMsg,
    nextChatMsg,
    msgId,
    msgQuote,
  };

  if (autoProvide) {
    useChatMsgDataProvide(chatMsgDataContext);
  }

  return chatMsgDataContext;
};
