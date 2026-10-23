import { isUndefined } from 'lodash-es';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { ChatMsgListHookOptions } from './types';

/**
 * 压缩历史消息列表 hook
 */
export const useContractHistory = (hookOptions: ChatMsgListHookOptions) => {
  const chatMsgStore = useChatMsgStore();

  /** 历史消息列表最大数量 */
  const maxHistoryCount = 300;
  /** 保留数量 */
  const saveHistoryCount = 200;

  /**
   * 压缩历史消息
   */
  function contractHistoryData() {
    const length = chatMsgStore.getHistoryData().length;
    if (length <= maxHistoryCount) {
      return;
    }
    const virtualList = hookOptions.getVirtualList();

    let sliceStart = length - saveHistoryCount;
    let sliceEnd = length;

    // 从渲染列表的区间前后修改 slice 位置
    const firstRenderItem = virtualList.items.first();
    const lastRenderItem = virtualList.items.last();
    if (firstRenderItem && lastRenderItem) {
      const firstRenderItemIndex = chatMsgStore.findHistoryIndex(firstRenderItem.id);
      const lastRenderItemIndex = chatMsgStore.findHistoryIndex(lastRenderItem.id);
      const renderCount = lastRenderItemIndex - firstRenderItemIndex + 1;
      // 剩余数量
      let surplusCount = saveHistoryCount - renderCount;
      surplusCount = surplusCount < 0 ? 0 : surplusCount;

      sliceStart = firstRenderItemIndex - Math.round(surplusCount / 2);
      sliceEnd = lastRenderItemIndex + Math.round(surplusCount / 2) + 1;
    }

    sliceStart = sliceStart < 0 ? 0 : sliceStart;
    sliceEnd = sliceEnd > length ? length : sliceEnd;

    const historyData = chatMsgStore.getHistoryData();
    const newHistoryData = historyData.slice(sliceStart, sliceEnd);
    const newHistoryDataLength = newHistoryData.length;
    const newFirstItem = newHistoryData[0];
    const newLastItem = newHistoryData[newHistoryDataLength - 1];

    // 重新设置 realStartIndex 为最新的值
    const newRealStartIndex = chatMsgStore.getRealIndexById(newLastItem.id);
    if (!isUndefined(newRealStartIndex)) {
      chatMsgStore.setRealStartIndex(newRealStartIndex);
    }

    // 重新设置 realEndIndex 为最新的值
    const newRealEndIndex = chatMsgStore.getRealIndexById(newFirstItem.id);
    if (!isUndefined(newRealEndIndex)) {
      chatMsgStore.setRealEndIndex(newRealEndIndex);
    }

    // 遍历被移除的节点，删除 msgRealIndex 中的属性
    for (let i = 0; i < historyData.length; i++) {
      if (i < sliceStart || i >= sliceEnd) {
        chatMsgStore.deleteRealIndexById(historyData[i].id);
      }
    }

    // 重新赋值 historyData
    chatMsgStore.resetHistoryData(newHistoryData);
  }

  return {
    contractHistoryData,
  };
};

/**
 * 压缩等待队列 hook
 */
export const useContractQueue = () => {
  const chatMsgStore = useChatMsgStore();

  /** 队列最大数量 */
  const maxQueueCount = 300;
  /** 保留数量 */
  const saveQueueCount = 200;

  /**
   * 压缩队列消息
   */
  function contractMsgQueue() {
    const length = chatMsgStore.getMsgQueue().length;
    if (length <= maxQueueCount) {
      return;
    }

    const sliceStart = length - saveQueueCount;
    const sliceEnd = length;

    const msgQueue = chatMsgStore.getMsgQueue();
    const newMsgQueue = msgQueue.slice(sliceStart, sliceEnd);
    for (let i = 0; i < sliceStart; i++) {
      chatMsgStore.deleteRealIndexById(msgQueue[i].id);
    }

    // 重新复制 msgQueue
    chatMsgStore.resetMsgQueue(newMsgQueue);
  }

  return {
    contractMsgQueue,
  };
};
