import { isUndefined } from 'lodash-es';
import { ChatMessageUser, ChatMsgSource, ChatMsgType } from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { ref, Ref, unref } from 'vue';
import { useChatStore } from './use-chat-store';
import { useViewerStore } from './use-viewer-store';
import { useWatchAppStore } from './use-watch-app-store';

export type HistoryDataPosition = 'header' | 'tail';

export interface ChatMsgStoreState {
  /** 不显示的消息来源 */
  hideChatMsgSources: Ref<ChatMsgSource[]>;
  /** 一批消息的数量 */
  batchCount: Ref<number>;
  /** 是否已加载完聊天历史消息 */
  historyEnd: Ref<boolean>;

  /** 是否显示更多消息 */
  moreMsgVisible: Ref<boolean>;
  /** 显示更多消息 */
  showMoreMsg(): void;
  /** 隐藏更多消息 */
  hideMoreMsg(): void;

  /** 聊天消息气泡是否显示中 */
  isMsgTipsPopperVisible: Ref<boolean>;
}

export interface ChatMsgStoreAction {
  /** 根据 id 获取下标 */
  getRealIndexById(id: string): number | undefined;
  /** 根据 id 设置下标 */
  setRealIndexById(id: string, index: number): void;
  /** 根据 id 删除下表 */
  deleteRealIndexById(id: string): void;
  /** 递增所有的 realIndex */
  increaseRealIndex(): void;
  /** 获取服务端最新消息的下标 */
  getRealStartIndex(): number;
  /** 设置服务端最新消息的下标 */
  setRealStartIndex(index: number): void;
  /** 获取服务端最旧消息的下标 */
  getRealEndIndex(): number;
  /** 设置服务端最旧消息的下标 */
  setRealEndIndex(index: number): void;

  /** 获取消息列表 */
  getHistoryData<T extends ChatMsgType = ChatMsgType>(): T[];
  /** 设置消息列表 */
  resetHistoryData(list: ChatMsgType[]): void;
  /** 设置历史列表的消息对象 */
  setHistoryData(index: number, chatMsg: ChatMsgType): void;
  /** 从 historyData 中寻找下标索引 */
  findHistoryIndex(id: string): number;
  /** 根据 id 从 historyData 中寻找消息对象 */
  findHistoryById<T extends ChatMsgType = ChatMsgType>(
    id: string,
    msgSource?: ChatMsgSource,
  ): T | undefined;
  /** 根据 id 移除历史数据 */
  removeHistoryData(id: string): void;
  /** 合并到消息列表 */
  concatHistoryData(data: ChatMsgType[], position: HistoryDataPosition): void;

  /** 合并一批 queue 数据到 historyData 中 */
  concatQueueToHistoryData(isAll?: boolean): ChatMsgType[];
  /** 获取消息等待队列 */
  getMsgQueue(): ChatMsgType[];
  /** 插入消息等待队列 */
  pushMsgQueue(chatMsg: ChatMsgType): void;
  /** 设置等待队列 */
  resetMsgQueue(list: ChatMsgType[]): void;

  /** 判断聊天消息是否为服务端中存在的消息 */
  isChatServiceMsg(chatMsg: ChatMsgType): boolean;
  /** 获取消息对象中的用户信息 */
  getChatMsgUser(chatMsg: ChatMsgType): ChatMessageUser | undefined;
  /** 是否本地发送的消息 */
  isLocalMsg(chatMsg: ChatMsgType): boolean;
  /** 是否自己发送到消息 */
  isSelfMsg(chatMsg: ChatMsgType): boolean;
  /** 是否为特殊用户发送的消息 */
  isSpecialUserMsg(chatMsg: ChatMsgType): boolean;

  /** 重置聊天消息 store */
  resetChatMsgStore(): void;
}

export interface ChatMsgStore extends ChatMsgStoreState, ChatMsgStoreAction {}

/**
 * 聊天消息 store
 */
export const useChatMsgStore = defineStore<'chatMsg', ChatMsgStore>('chatMsg', () => {
  const watchAppStore = useWatchAppStore();
  const chatStore = useChatStore();
  const viewerStore = useViewerStore();

  /** 不显示的消息来源 */
  const hideChatMsgSources = ref<ChatMsgSource[]>([]);

  /** 一批消息的数量 */
  const batchCount = ref(20);

  /** 是否已加载完聊天历史消息 */
  const historyEnd = ref(false);

  /** 是否显示更多消息 */
  const moreMsgVisible = ref(false);

  /** 聊天消息气泡是否显示中 */
  const isMsgTipsPopperVisible = ref(false);

  /** 显示更多消息 */
  function showMoreMsg() {
    moreMsgVisible.value = true;
  }

  /** 隐藏更多消息 */
  function hideMoreMsg() {
    moreMsgVisible.value = false;
  }

  /** ---------- realIndex - start ---------- */
  /** 服务端聊天消息下标 */
  let msgRealIndex: UniversalParams<number | undefined> = {};

  /** 服务端最新消息的下标 */
  let realStartIndex = -1;

  /** 服务端最旧消息的下标 */
  let realEndIndex = -1;

  /** 根据 id 获取下标 */
  function getRealIndexById(id: string): number | undefined {
    return msgRealIndex[id];
  }

  /** 根据 id 设置下标 */
  function setRealIndexById(id: string, index: number): void {
    msgRealIndex[id] = index;
  }

  /** 根据 id 删除下表 */
  function deleteRealIndexById(id: string): void {
    delete msgRealIndex[id];
  }

  /**
   * 递增所有的 realIndex
   */
  function increaseRealIndex() {
    realStartIndex += 1;
    realEndIndex += 1;
    const msgRealIndexVal = msgRealIndex as UniversalParams<number>;
    Object.keys(msgRealIndexVal).forEach(key => {
      if (!isUndefined(msgRealIndexVal[key])) {
        msgRealIndexVal[key] += 1;
      }
    });
  }

  /** 获取服务端最新消息的下标 */
  function getRealStartIndex(): number {
    return realStartIndex;
  }

  /** 设置服务端最新消息的下标 */
  function setRealStartIndex(index: number): void {
    realStartIndex = index;
  }

  /** 获取服务端最旧消息的下标 */
  function getRealEndIndex(): number {
    return realEndIndex;
  }

  /** 设置服务端最旧消息的下标 */
  function setRealEndIndex(index: number): void {
    realEndIndex = index;
  }
  /** ---------- realIndex - end ---------- */

  /** ---------- msgQueue - start ---------- */
  /** 等待插入的消息队列 */
  let msgQueue: ChatMsgType[] = [];

  /** 获取消息等待队列 */
  function getMsgQueue(): ChatMsgType[] {
    return msgQueue;
  }

  /** 插入消息等待队列 */
  function pushMsgQueue(chatMsg: ChatMsgType): void {
    msgQueue.push(chatMsg);
  }

  /** 设置等待队列 */
  function resetMsgQueue(list: ChatMsgType[]): void {
    msgQueue = list;
  }
  /** ---------- msgQueue - end ---------- */

  /** ---------- historyData - start ---------- */
  /** 完整的消息列表 */
  let historyData: ChatMsgType[] = [];

  /** 获取消息列表 */
  function getHistoryData<T extends ChatMsgType = ChatMsgType>(): T[] {
    return historyData as T[];
  }

  /** 设置消息列表 */
  function resetHistoryData(list: ChatMsgType[]): void {
    historyData = list;
  }

  /**
   * 设置历史列表的消息对象
   * @param index 下标
   * @param chatMsg 消息对象
   */
  function setHistoryData(index: number, chatMsg: ChatMsgType) {
    historyData[index] = chatMsg;
  }

  /**
   * 从 historyData 中寻找下标索引
   * @param id 消息 id
   */
  function findHistoryIndex(id: string): number {
    return historyData.findIndex(chatMsg => chatMsg.id === id);
  }

  /**
   * 根据 id 从 historyData 中寻找消息对象
   * @param id 消息 id
   * @param msgSource 消息类型
   */
  function findHistoryById<T extends ChatMsgType = ChatMsgType>(
    id: string,
    msgSource?: ChatMsgSource,
  ): T | undefined {
    const historyList = historyData;
    const index = historyList.findIndex(chatMsg => {
      if (!msgSource) {
        return chatMsg.id === id;
      }
      return chatMsg.id === id && chatMsg.msgSource === msgSource;
    });
    return historyList[index] as T;
  }

  /**
   * 根据 id 移除历史数据
   * @param id 消息 id
   */
  function removeHistoryData(id: string) {
    // 从 realIndex 记录中删除，并将目标 id 之后的消息递减
    const refRealIndex = msgRealIndex[id];
    if (!isUndefined(refRealIndex)) {
      Object.keys(msgRealIndex).forEach(realKey => {
        const realIndex = msgRealIndex[realKey];
        if (!isUndefined(realIndex) && realIndex > refRealIndex) {
          msgRealIndex[realKey] = realIndex - 1;
        }
      });

      deleteRealIndexById(id);

      const _realEndIndex = getRealEndIndex();
      if (_realEndIndex >= refRealIndex) {
        setRealEndIndex(_realEndIndex - 1);
      }

      const _realStartIndex = getRealStartIndex();
      if (_realStartIndex > refRealIndex) {
        setRealStartIndex(_realStartIndex - 1);
      }
    }

    // 删除消息列表中的值
    const historyIndex = findHistoryIndex(id);
    if (historyIndex !== -1) {
      historyData.splice(historyIndex, 1);
    }
  }

  /**
   * 合并到消息列表
   * @param data 合并到消息列表
   * @param position 位置
   */
  function concatHistoryData(data: ChatMsgType[], position: HistoryDataPosition) {
    if (position === 'header') {
      historyData = data.concat(historyData);
    } else {
      historyData = historyData.concat(data);
    }
  }
  /** ---------- historyData - end ---------- */

  /**
   * 获取消息对象中的用户信息
   * @param chatMsg 消息对象
   */
  function getChatMsgUser(chatMsg: ChatMsgType): ChatMessageUser | undefined {
    if ('user' in chatMsg) {
      return chatMsg.user;
    }
  }

  /**
   * 是否本地发送的消息
   * @param chatMsg 消息
   */
  function isLocalMsg(chatMsg: ChatMsgType): boolean {
    if ('isLocal' in chatMsg) {
      return !!chatMsg.isLocal;
    }
    return false;
  }

  /**
   * 是否自己发送到消息
   * @param chatMsg 消息
   */
  function isSelfMsg(chatMsg: ChatMsgType): boolean {
    return getChatMsgUser(chatMsg)?.userId === viewerStore.viewerId;
  }

  /**
   * 是否为特殊用户发送的消息
   * @param chatMsg 消息
   */
  function isSpecialUserMsg(chatMsg: ChatMsgType): boolean {
    const user = getChatMsgUser(chatMsg);
    const userType = user?.userType;
    const actor = user?.actor;
    if (!userType) return false;
    const watchCore = watchAppStore.getWatchCore();
    return watchCore.user.isSpecialUserType(userType, actor);
  }

  /**
   * 合并 queue 数据到 historyData 中
   * @param isAll 是否将所有消息插入
   */
  function concatQueueToHistoryData(isAll = false): ChatMsgType[] {
    const queueLength = msgQueue.length;
    let spliceCount = unref(batchCount);

    if (isAll) {
      spliceCount = queueLength;
    } else if (queueLength / 2 > spliceCount) {
      spliceCount = Math.round(queueLength / 2);
    }

    const concatData = msgQueue.splice(0, spliceCount);
    if (concatData.length) {
      concatHistoryData(concatData, 'tail');
    }
    return concatData;
  }

  /**
   * 判断聊天消息是否为服务端中存在的消息
   * @param chatMsg 聊天消息
   */
  function isChatServiceMsg(chatMsg: ChatMsgType): boolean {
    let isServiceMsg = true;

    const msgSource = chatMsg.msgSource;
    // 系统消息、红包领取消息、课堂激励消息
    const otherSource = [
      ChatMsgSource.System,
      ChatMsgSource.RedpaperReceive,
      ChatMsgSource.MotivationLike,
      ChatMsgSource.Effect,
    ];
    if (otherSource.includes(msgSource)) {
      isServiceMsg = false;
    }

    // 特殊角色消息
    const isSpecial = isSpecialUserMsg(chatMsg);
    // 自己发言
    const isSelf = isSelfMsg(chatMsg);
    // 只看我和主持人
    if (chatStore.onlySpecialMsg && !(isSpecial || isSelf)) {
      isServiceMsg = false;
    }

    return isServiceMsg;
  }

  /**
   * 重置聊天消息 store
   */
  function resetChatMsgStore() {
    historyEnd.value = false;
    msgRealIndex = {};
    resetMsgQueue([]);
    resetHistoryData([]);
    setRealStartIndex(-1);
    setRealEndIndex(-1);
    hideMoreMsg();
  }

  return {
    hideChatMsgSources,
    batchCount,
    historyEnd,

    moreMsgVisible,
    showMoreMsg,
    hideMoreMsg,

    getRealIndexById,
    setRealIndexById,
    deleteRealIndexById,
    increaseRealIndex,
    getRealStartIndex,
    setRealStartIndex,
    getRealEndIndex,
    setRealEndIndex,

    getMsgQueue,
    pushMsgQueue,
    resetMsgQueue,
    concatQueueToHistoryData,

    getHistoryData,
    resetHistoryData,
    findHistoryIndex,
    setHistoryData,
    findHistoryById,
    removeHistoryData,
    concatHistoryData,

    isLocalMsg,
    getChatMsgUser,
    isSelfMsg,
    isSpecialUserMsg,
    isChatServiceMsg,

    resetChatMsgStore,

    isMsgTipsPopperVisible,
  };
});
