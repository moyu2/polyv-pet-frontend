import { PropUtils, VueProps } from '@polyv/vue-components';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { ChatMsgType } from '@polyv/live-watch-sdk';
import { computed, ExtractPropTypes, unref } from 'vue';
import { GetVirtualListFn } from '../hooks/types';
import { useRedpaperMsgVisible } from './redpaper-msg/use-redpaper-msg';
import { useChatMsgComputedProvide } from './_hooks/chat-msg-computed-hook';
import { useChatMsgData } from './_hooks/chat-msg-data-hook';
import { useChatMsgTime } from './_hooks/chat-msg-time-hook';
import { useChatMsgUser } from './_hooks/chat-msg-user-hook';

/** 消息组件类别 */
export enum ChatMsgItemCategory {
  /** 聊天讨论区 */
  Chat = 'chat',
  /** 提问区 */
  Ask = 'ask',
}

export const chatMsgItemProps = () => ({
  /** 消息组件类别 */
  category: PropUtils.enum<ChatMsgItemCategory>().def(ChatMsgItemCategory.Chat),
  /** 消息滚动容器 */
  containerElem: PropUtils.oneOfType<HTMLDivElement>([HTMLDivElement]),
  /** 获取虚拟列表方法 */
  getVirtualList: PropUtils.func<GetVirtualListFn>(),
  /** 聊天消息 */
  chatMsg: PropUtils.object<ChatMsgType>().isRequired,
  /** 上一条消息 */
  prevChatMsg: PropUtils.object<ChatMsgType>(),
  /** 下一条消息 */
  nextChatMsg: PropUtils.object<ChatMsgType>(),
});

export type ChatMsgItemPropsType = ExtractPropTypes<ReturnType<typeof chatMsgItemProps>>;

export const useChatMsgItem = (options: { props: VueProps<typeof chatMsgItemProps> }) => {
  const { props } = options;
  const chatMsgStore = useChatMsgStore();

  // 消息数据
  const chatMsgDataContext = useChatMsgData(props);
  // 消息用户
  const { msgUser } = useChatMsgUser(chatMsgDataContext);
  // 消息时间
  const { showMsgTime, msgTimeText } = useChatMsgTime(chatMsgDataContext);

  const { chatMsg, prevChatMsg, nextChatMsg, msgId } = chatMsgDataContext;

  const { checkRedpaperMsgVisible } = useRedpaperMsgVisible(chatMsg);

  /** 滚动容器 */
  const containerRef = computed(() => props.containerElem);

  /**
   * 是否为同一个人连续发送的消息
   */
  const isContinuityMsg = computed<boolean>(() => {
    const prevMsg = unref(prevChatMsg);
    const msg = unref(chatMsg);

    // 没有上一条消息
    if (!prevMsg) return false;
    // 显示时间
    if (unref(showMsgTime)) return false;
    // 与上一条消息类型不同
    if (prevMsg.msgSource !== msg.msgSource) return false;

    // 与上一条消息属于同一个人
    return (
      chatMsgStore.getChatMsgUser(msg)?.userId === chatMsgStore.getChatMsgUser(prevMsg)?.userId
    );
  });

  /**
   * 是否为连续相同的消息来源
   */
  const isContinuitySourceMsg = computed<boolean>(() => {
    // 显示时间
    if (unref(showMsgTime)) return false;

    const prevMsg = unref(prevChatMsg);
    const msg = unref(chatMsg);
    return prevMsg?.msgSource === msg.msgSource;
  });

  /**
   * 是否显示当前消息
   */
  const msgVisible = computed<boolean>(() => {
    if (!checkRedpaperMsgVisible()) {
      return false;
    }

    return !chatMsgStore.hideChatMsgSources.includes(unref(chatMsg).msgSource);
  });

  function getVirtualList() {
    if (props.getVirtualList) {
      return props.getVirtualList();
    }
  }

  useChatMsgComputedProvide({
    containerRef,
    isContinuityMsg,
    isContinuitySourceMsg,
    getVirtualList,
  });

  return {
    chatMsg,
    prevChatMsg,
    nextChatMsg,
    msgId,
    msgUser,
    showMsgTime,
    msgTimeText,
    isContinuityMsg,
    msgVisible,
  };
};
