import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { useChatStore } from '@/store/use-chat-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { RenderPosition } from '@polyv/utils/virtual-list';
import {
  ChatEvents,
  ChatEventsRelations,
  ChatMsgSource,
  ChatMsgType,
  plvInterval,
} from '@polyv/live-watch-sdk';
import { onBeforeUnmount, onMounted } from 'vue';
import { useContractHistory, useContractQueue } from './contract-history-hook';
import { useFilterRepeatMsgHook, useFilterSpecialMsgHook } from './filter-chat-msg-hook';
import { ChatMsgListHookOptions } from './types';
import { useWatchAppStore } from '@/store/use-watch-app-store';

export const useChatMsgQueue = (hookOptions: ChatMsgListHookOptions) => {
  const { getWatchCore } = useGlobalInject();

  const chatStore = useChatStore();
  const chatMsgStore = useChatMsgStore();
  const playbackStore = usePlaybackStore();
  const watchAppStore = useWatchAppStore();

  const { contractHistoryData } = useContractHistory(hookOptions);
  const { contractMsgQueue } = useContractQueue();
  const { isNotSpecialMsg } = useFilterSpecialMsgHook();
  const { filterRepeatMsg } = useFilterRepeatMsgHook(hookOptions);

  function __checkInBottom() {
    const container = hookOptions.getContainerElem();

    /** 是否在底部(50为误差值) ，UI 底部可能有一个 50px 高度的互动二次入口 */
    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const isBottom = container.scrollTop + container.clientHeight + 50 >= container.scrollHeight;

    return isBottom;
  }

  let joinTimer: ReturnType<typeof plvInterval> | undefined;

  /** 往底部添加聊天消息 */
  function __addChatMsgItems(data: ChatMsgType[]) {
    const virtualList = hookOptions.getVirtualList();
    virtualList.scrollToFoot(); // 可能会出现互动二次入口，所以需要滚动到底部
    virtualList.addBoundaryItems(data, RenderPosition.Foot, true);
    chatMsgStore.hideMoreMsg();
  }

  /**
   * 插入一条新消息到队列中
   * @param chatMsg 消息
   */
  function pushWaitMsgQueue(chatMsg: ChatMsgType): void {
    const virtualList = hookOptions.getVirtualList();

    if (chatMsgStore.getRealStartIndex() > 0) {
      if (chatMsgStore.isChatServiceMsg(chatMsg)) {
        chatMsgStore.increaseRealIndex();
      }
      chatMsgStore.showMoreMsg();
      return;
    }

    chatMsgStore.pushMsgQueue(chatMsg);
    contractMsgQueue();

    // 服务端的消息才更新 realIndex
    if (chatMsgStore.isChatServiceMsg(chatMsg)) {
      chatMsgStore.increaseRealIndex();
      chatMsgStore.setRealIndexById(chatMsg.id, 0);
      chatMsgStore.setRealStartIndex(0);
    }

    // 插入到是本地消息
    if (chatMsgStore.isLocalMsg(chatMsg)) {
      // 直接将队列消息插入，不需要延迟
      let addList = chatMsgStore.concatQueueToHistoryData(true);
      contractHistoryData();

      addList = filterRepeatMsg(addList);
      virtualList.addBoundaryItems(addList, RenderPosition.Foot, true);
    }

    checkJoinTimer();
  }

  /**
   * 检查定时器
   */
  function checkJoinTimer() {
    // 消息队列为空，则关闭定时器
    if (chatMsgStore.getMsgQueue().length === 0) {
      removeJoinTimer();
      return;
    }

    // 已有定时器则不再创建
    if (joinTimer) {
      return;
    }

    // 启动定时器用于消息出队进行渲染
    startJoinTimer();
  }

  /**
   * 开启插入定时器
   */
  function startJoinTimer() {
    removeJoinTimer();

    function __popWaitMsgQueue() {
      const msgQueue = chatMsgStore.getMsgQueue();
      const spliceCount = msgQueue.length;

      // 只能通过这种方式，才能在轮询间隔中获取对应的数据
      let renderData = msgQueue.splice(0, spliceCount);
      renderData = filterRepeatMsg(renderData);
      return renderData;
    }

    joinTimer = plvInterval(() => {
      const virtualList = hookOptions.getVirtualList();

      /** 是否到达底部边界 */
      const reachedFoot = virtualList.reachedBoundary(RenderPosition.Foot);
      // 如果还没到达底部边界，界面上展示更多消息按钮
      if (!reachedFoot || !__checkInBottom()) {
        chatMsgStore.showMoreMsg();
        return;
      }

      /** 获取需要在底部渲染的数据 */
      const renderData = __popWaitMsgQueue();
      const renderDataLen = renderData.length;

      chatMsgStore.concatHistoryData(renderData, 'tail');

      // 只有停留在列表底部，才需要渲染
      if (renderDataLen > 0) {
        __addChatMsgItems(renderData);
      } else {
        chatMsgStore.hideMoreMsg();
      }

      // 每次轮询都尝试去压缩历史数据队列
      contractHistoryData();

      checkJoinTimer();
    }, 300);
  }

  /**
   * 销毁插入定时器
   */
  function removeJoinTimer() {
    if (joinTimer) {
      joinTimer.clear();
      joinTimer = undefined;
    }
  }

  function onChatMsg(evt: ChatEventsRelations[ChatEvents.ChatMessage]) {
    const chatMsg = evt.chatMsg;

    if (watchAppStore.isPlaybackWatchUrl && evt.isChatReplayMsg) {
      return;
    }

    // 对于仅看主持人，非特殊身份，非自己发言的全部过滤掉
    if (chatStore.onlySpecialMsg && isNotSpecialMsg(chatMsg)) {
      return;
    }

    // 非聊天重放状态下，自己的打赏只接收本地插入的
    if (
      !playbackStore.chatMsgReplayEnabled &&
      chatMsg.msgSource === ChatMsgSource.Reward &&
      chatMsg.isSelf &&
      !chatMsg.isLocal
    ) {
      return;
    }

    pushWaitMsgQueue(chatMsg);
  }

  /**
   * 监听聊天室消息
   */
  function listenChatMsg() {
    unlistenChatMsg();
    const watchCore = getWatchCore();
    watchCore.chat.eventEmitter.on(ChatEvents.ChatMessage, onChatMsg);
  }

  function unlistenChatMsg() {
    const watchCore = getWatchCore();
    watchCore.chat.eventEmitter.off(ChatEvents.ChatMessage, onChatMsg);
  }

  onMounted(() => {
    listenChatMsg();
  });

  onBeforeUnmount(() => {
    removeJoinTimer();
    unlistenChatMsg();
  });

  useEventBusListener(appEvents.chat.JoinMsgQueue, onChatMsg);
};
