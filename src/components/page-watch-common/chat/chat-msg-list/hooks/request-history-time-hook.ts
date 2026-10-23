import { isString } from '@/assets/utils/string';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { InitialResponse } from '@polyv/utils/virtual-list';
import { ChatMsgType, ChatRequestHistoryMode } from '@polyv/live-watch-sdk';
import { useContractHistory } from './contract-history-hook';
import { useFilterRepeatMsgHook } from './filter-chat-msg-hook';
import { ChatMsgListHookOptions, RequestHistoryCommonResult } from './types';
import { appEvents } from '@/app/app-events';
import { useChatStore } from '@/store/use-chat-store';

interface RequestParams {
  timestamp?: number;
  mode?: ChatRequestHistoryMode;
  count?: number;
}

export const useRequestHistoryTime = (
  hookOptions: ChatMsgListHookOptions,
  getStore: () => {
    chatMsgStore: ReturnType<typeof useChatMsgStore>;
    chatStore: ReturnType<typeof useChatStore>;
    watchAppStore: ReturnType<typeof useWatchAppStore>;
  },
): RequestHistoryCommonResult => {
  const chatMsgStore = getStore().chatMsgStore;
  const chatStore = getStore().chatStore;
  const { contractHistoryData } = useContractHistory(hookOptions);
  const { filterRepeatMsg } = useFilterRepeatMsgHook(hookOptions);

  const watchAppStore = getStore().watchAppStore;
  const getWatchCore = watchAppStore.getWatchCore;
  const getEmitter = watchAppStore.getEmitter;

  async function requestChatHistory(params: RequestParams = {}) {
    if (chatStore.chatRoomLongTimeNotUsed) {
      return [];
    }
    const watchCore = getWatchCore();
    const { mode = ChatRequestHistoryMode.Prev } = params;

    return watchCore.chat.getChatHistoryByTime({
      timestamp: params.timestamp,
      size: chatMsgStore.batchCount,
      count: params.count,
      mode,
      exclude: chatMsgStore.hideChatMsgSources,
      onlySpecialMsg: chatStore.onlySpecialMsg,
    });
  }

  /**
   * 获取聊天消息所在的相同时间戳的数量
   * @param chatMsg 聊天消息
   * @param index 聊天消息所在历史数据列表的下标
   * @param mode 排序
   */
  function findSameTimestampMsgCount(
    chatMsg: ChatMsgType,
    index: number,
    mode: ChatRequestHistoryMode,
  ): number {
    const historyData = chatMsgStore.getHistoryData();
    let count = 1;
    const currentIndex = index;

    const checkWhileJudge = () => {
      const nextMsg =
        mode === ChatRequestHistoryMode.Prev
          ? historyData[currentIndex - 1]
          : historyData[currentIndex + 1];
      return nextMsg && chatMsg.time === nextMsg.time;
    };
    let isWhileJudge = checkWhileJudge();

    while (isWhileJudge) {
      count += 1;
      isWhileJudge = checkWhileJudge();
    }

    return count;
  }

  async function loadInitialData(): Promise<InitialResponse<ChatMsgType>> {
    chatMsgStore.resetChatMsgStore();

    const data = await requestChatHistory();
    chatMsgStore.resetHistoryData(data);
    chatMsgStore.resetMsgQueue([]);

    getEmitter().emit(appEvents.chat.LoadInitialData);

    return {
      data,
      reachedFootBoundary: true,
      reachedHeadBoundary: data.length < chatMsgStore.batchCount,
    };
  }

  async function loadNextData(ref: unknown): Promise<ChatMsgType[]> {
    if (!isString(ref)) {
      throw new Error('loadNextData fail, ref is not string');
    }
    const historyData = chatMsgStore.getHistoryData();
    const historyLength = historyData.length;
    if (historyLength === 0) {
      return [];
    }

    const id = ref;
    let data: ChatMsgType[] = [];

    // ref 对应的 historyData 下标
    let refIndex = chatMsgStore.findHistoryIndex(id);
    const targetMsg = chatMsgStore.findHistoryById(id);

    if (refIndex === -1) {
      return [];
    }

    // 从 historyData 中截取数据返回
    let sliceStart = refIndex + 1;
    if (sliceStart > historyLength - 1) {
      sliceStart = historyLength - 1;
    }

    let needRequest = false;
    let sliceEnd = refIndex + chatMsgStore.batchCount + 1;
    if (sliceEnd > historyLength - 1) {
      sliceEnd = historyLength - 1;
      needRequest = true;
    }

    if (needRequest && targetMsg) {
      const lastMsg = historyData[historyLength - 1];
      const count = findSameTimestampMsgCount(
        lastMsg,
        historyLength - 1,
        ChatRequestHistoryMode.Next,
      );
      const result = await requestChatHistory({
        timestamp: lastMsg.time,
        count,
        mode: ChatRequestHistoryMode.Next,
      });
      chatMsgStore.concatHistoryData(result, 'tail');
      // 数据新增，refIndex 需要重新获取
      refIndex = chatMsgStore.findHistoryIndex(id);
    }

    sliceStart = refIndex + 1;
    sliceEnd = refIndex + chatMsgStore.batchCount + 1;

    data = chatMsgStore.getHistoryData().slice(sliceStart, sliceEnd);

    if (data.length === 0) {
      chatMsgStore.hideMoreMsg();
    }

    setTimeout(() => {
      contractHistoryData();
    }, 50);

    data = filterRepeatMsg(data);
    chatMsgStore.resetMsgQueue([]);
    return data;
  }

  async function loadPreviousData(ref: unknown): Promise<ChatMsgType[]> {
    if (!isString(ref)) {
      throw new Error('loadPreviousData fail, ref is not string');
    }

    const batchCount = chatMsgStore.batchCount;
    const id = ref;
    let data: ChatMsgType[] = [];

    // ref 对应的 historyData 下标
    let refIndex = chatMsgStore.findHistoryIndex(id);
    const targetMsg = chatMsgStore.findHistoryById(id);

    // ref 下标小于页数，需要请求一批历史消息
    if (targetMsg && refIndex < batchCount) {
      const count = findSameTimestampMsgCount(targetMsg, refIndex, ChatRequestHistoryMode.Prev);
      const result = await requestChatHistory({
        timestamp: targetMsg.time,
        count,
        mode: ChatRequestHistoryMode.Prev,
      });
      chatMsgStore.concatHistoryData(result, 'header');
      // 数据新增，refIndex 需要重新获取
      refIndex = chatMsgStore.findHistoryIndex(id);
    }

    // 从 historyData 中截取数据返回
    const sliceStart = refIndex - batchCount < 0 ? 0 : refIndex - batchCount;
    const sliceEnd = refIndex;
    data = chatMsgStore.getHistoryData().slice(sliceStart, sliceEnd);

    setTimeout(() => {
      contractHistoryData();
    }, 50);

    data = filterRepeatMsg(data);
    return data;
  }

  return {
    loadInitialData,
    loadNextData,
    loadPreviousData,
  };
};
