import { isString } from '@/assets/utils/string';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { InitialResponse } from '@polyv/utils/virtual-list';
import { ChatReplayMsgType, ChatReplayRequestHistoryMode } from '@polyv/live-watch-sdk';
import { useContractHistory } from './contract-history-hook';
import { useFilterSpecialMsgHook } from './filter-chat-msg-hook';
import { ChatMsgListHookOptions, RequestHistoryCommonResult } from './types';
import { appEvents } from '@/app/app-events';

/**
 * @hook 请求聊天室重放历史
 */
export const useRequestHistoryReplayHook = (
  hookOptions: ChatMsgListHookOptions,
  getStore: () => {
    chatMsgStore: ReturnType<typeof useChatMsgStore>;
    watchAppStore: ReturnType<typeof useWatchAppStore>;
  },
): RequestHistoryCommonResult => {
  const watchAppStore = getStore().watchAppStore;
  const getWatchCore = watchAppStore.getWatchCore;

  const watchCore = getWatchCore();
  const chatMsgStore = getStore().chatMsgStore;
  const getEmitter = watchAppStore.getEmitter;
  const { contractHistoryData } = useContractHistory(hookOptions);
  const { filterSpecialMsgList } = useFilterSpecialMsgHook();

  /**
   * 请求聊天室历史消息
   */
  async function requestChatHistory(start = 0, mode?: ChatReplayRequestHistoryMode) {
    const reqMode = mode || ChatReplayRequestHistoryMode.Init;

    const reMsg = (() => {
      const historyData = chatMsgStore.getHistoryData<ChatReplayMsgType>();
      if (reqMode === ChatReplayRequestHistoryMode.Next) {
        return historyData[historyData.length - 1];
      }

      if (reqMode === ChatReplayRequestHistoryMode.Pre) {
        return historyData[0];
      }

      return undefined;
    })();

    const data = await watchCore.chat.getChatMsgReplayHistoryList({
      mode: reqMode,
      replayMsg: reMsg,
      count: chatMsgStore.batchCount,
    });

    chatMsgStore.historyEnd = data.length < chatMsgStore.batchCount;

    // data.forEach((chatMsg, index) => {
    //   const realIndex = start + index;
    //   chatMsgStore.setRealIndexById(chatMsg.id, realIndex);
    // });

    return {
      data,
      realStartIndex: start,
      realEndIndex: start + data.length - 1,
    };
  }

  /**
   * 加载初始数据
   */
  async function loadInitialData(): Promise<InitialResponse<ChatReplayMsgType>> {
    chatMsgStore.resetChatMsgStore();
    const result = await requestChatHistory();
    const data = result.data;
    chatMsgStore.resetHistoryData(data);

    // if (data.length) {
    //   chatMsgStore.setRealStartIndex(result.realStartIndex);
    //   chatMsgStore.setRealEndIndex(result.realEndIndex);
    // }

    getEmitter().emit(appEvents.chat.LoadInitialData);

    return {
      data: filterSpecialMsgList(data),
      reachedFootBoundary: true,
      reachedHeadBoundary: data.length < chatMsgStore.batchCount,
    };
  }

  /**
   * 加载最新的数据
   */
  async function loadNextData(ref: unknown): Promise<ChatReplayMsgType[]> {
    if (!isString(ref)) {
      throw new Error('loadNextData fail, ref is not string');
    }

    const historyLength = chatMsgStore.getHistoryData().length;
    if (historyLength === 0) {
      return [];
    }

    const id = ref;
    let data: ChatReplayMsgType[] = [];

    // ref 对应的 historyData 下标
    let refIndex = chatMsgStore.findHistoryIndex(id);
    if (refIndex === -1) {
      return [];
    }

    // 从 historyData 中截取数据返回
    let sliceStart = refIndex + 1;
    if (sliceStart > historyLength - 1) {
      sliceStart = historyLength - 1;
    }

    let sliceEnd = refIndex + chatMsgStore.batchCount + 1;
    if (sliceEnd > historyLength - 1) {
      sliceEnd = historyLength - 1;
    }

    let needRequest = false;
    // 此时如果是数组尾部的一批，且 realStartIndex 非 0，则请求接口获取
    if (sliceEnd - sliceStart < chatMsgStore.batchCount && chatMsgStore.getRealStartIndex() !== 0) {
      needRequest = true;
    }

    if (needRequest && chatMsgStore.getRealStartIndex() !== 0) {
      const reqEnd = chatMsgStore.getRealStartIndex() - 1;
      let reqStart = reqEnd - chatMsgStore.batchCount;
      reqStart = reqStart < 0 ? 0 : reqStart;
      const result = await requestChatHistory(reqStart, ChatReplayRequestHistoryMode.Next);
      chatMsgStore.concatHistoryData(result.data, 'tail');
      // chatMsgStore.setRealStartIndex(result.realStartIndex);
      // 数据新增，refIndex 需要重新获取
      refIndex = chatMsgStore.findHistoryIndex(id);
    }

    sliceStart = refIndex + 1;
    sliceEnd = refIndex + chatMsgStore.batchCount + 1;

    data = chatMsgStore.getHistoryData<ChatReplayMsgType>().slice(sliceStart, sliceEnd);

    setTimeout(() => {
      contractHistoryData();
    }, 50);

    return filterSpecialMsgList(data);
  }

  /**
   * 加载更旧的数据
   */
  async function loadPreviousData(ref: unknown): Promise<ChatReplayMsgType[]> {
    if (!isString(ref)) {
      throw new Error('loadPreviousData fail, ref is not string');
    }

    const batchCount = chatMsgStore.batchCount;
    const id = ref;
    let data: ChatReplayMsgType[] = [];

    // ref 对应的 historyData 下标
    let refIndex = chatMsgStore.findHistoryIndex(id);

    // ref 下标小于页数，需要请求一批历史消息
    if (refIndex < batchCount) {
      const result = await requestChatHistory(
        chatMsgStore.getRealEndIndex() + 1,
        ChatReplayRequestHistoryMode.Pre,
      );
      chatMsgStore.concatHistoryData(result.data, 'header');
      chatMsgStore.setRealEndIndex(result.realEndIndex);
      // 数据新增，refIndex 需要重新获取
      refIndex = chatMsgStore.findHistoryIndex(id);
    }

    // 从 historyData 中截取数据返回
    const sliceStart = refIndex - batchCount < 0 ? 0 : refIndex - batchCount;
    const sliceEnd = refIndex;
    data = chatMsgStore.getHistoryData<ChatReplayMsgType>().slice(sliceStart, sliceEnd);

    setTimeout(() => {
      contractHistoryData();
    }, 50);
    return filterSpecialMsgList(data);
  }

  return {
    loadInitialData,
    loadNextData,
    loadPreviousData,
  };
};
