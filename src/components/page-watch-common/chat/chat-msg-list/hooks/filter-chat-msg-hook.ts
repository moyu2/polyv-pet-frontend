import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { useChatStore } from '@/store/use-chat-store';
import { ChatMsgType } from '@polyv/live-watch-sdk';
import { ChatMsgListHookOptions } from './types';

export const useFilterSpecialMsgHook = () => {
  const chatStore = useChatStore();
  const chatMsgStore = useChatMsgStore();

  /**
   * 是否为非特殊角色的消息
   * @param chatMsg 聊天消息
   * @param excludeCurrentUser 排除当前观众，默认 true
   */
  function isNotSpecialMsg(chatMsg: ChatMsgType, excludeCurrentUser = true) {
    if (chatMsgStore.isSpecialUserMsg(chatMsg)) {
      return false;
    }

    if (excludeCurrentUser && chatMsgStore.isSelfMsg(chatMsg)) {
      return false;
    }

    return true;
  }

  /**
   * 过滤得到只有特殊角色消息的列表
   * @desc 后续只有聊天重放的列表才需要
   * @param list 聊天消息列表
   * @param excludeCurrentUser 排除当前观众，默认 true
   */
  function filterSpecialMsgList<T extends ChatMsgType = ChatMsgType>(
    list: T[],
    excludeCurrentUser = true,
  ): T[] {
    if (!chatStore.onlySpecialMsg) return list;

    return list.filter(chatMsg => !isNotSpecialMsg(chatMsg, excludeCurrentUser));
  }

  return {
    isNotSpecialMsg,
    filterSpecialMsgList,
  };
};

/**
 * 去除重复消息 hook
 */
export const useFilterRepeatMsgHook = (hookOptions: ChatMsgListHookOptions) => {
  /**
   * 过滤重复的消息
   * @param chatMsgs 消息列表
   */
  function filterRepeatMsg(chatMsgs: ChatMsgType[]): ChatMsgType[] {
    const virtualList = hookOptions.getVirtualList();

    // 当前渲染的列表
    const renderLen = virtualList.items.length;
    const renderList: ChatMsgType[] = [];
    for (let i = 0; i < renderLen; i++) {
      const chatMsg = virtualList.items.get(i);
      if (chatMsg) {
        renderList.push(chatMsg);
      }
    }

    const resultList: ChatMsgType[] = [];
    for (let i = 0; i < chatMsgs.length; i++) {
      const chatMsg = chatMsgs[i];
      const resultIndex = resultList.indexOf(chatMsg);
      const renderIndex = renderList.findIndex(item => item.id === chatMsg.id);
      // 如果列表中重复或渲染中重复则剔除
      if (resultIndex !== -1 || renderIndex !== -1) {
        continue;
      }
      resultList.push(chatMsg);
    }

    return resultList;
  }

  return {
    filterRepeatMsg,
  };
};
