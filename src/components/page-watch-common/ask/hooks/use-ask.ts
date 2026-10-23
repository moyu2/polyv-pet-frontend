import { useChannelStore } from '@/store/use-channel-store';
import { computed, nextTick, onBeforeUnmount, onMounted, Ref, ref, unref } from 'vue';

import {
  AskEvents,
  AskMsgType,
  ChatMsgSource,
  ChatMsgSpeakType,
  AskEventsRelations,
} from '@polyv/live-watch-sdk';
import { uuidV4 } from '@polyv/utils/string';

import { useAskStore } from '@/store/use-ask-store';
import { AskMsgListInstance } from '../ask-msg-list/use-ask-msg-list';
import { translate } from '@/assets/lang';
import { useGlobalInject } from '@/app/use-global-inject';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { useViewerStore } from '@/store/use-viewer-store';

/**
 * 倒序查找数组
 */
function reverseFindIndex<T>(
  arr: T[],
  predicate: (value: T, index: number, array: T[]) => boolean,
): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i], i, arr)) {
      return i;
    }
  }
  return -1;
}

export interface UseAskOptions {
  askMsgListRef: Ref<AskMsgListInstance | undefined>;
}

export const useAsk = (options: UseAskOptions) => {
  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();

  const { askMsgListRef } = options;

  const channelStore = useChannelStore();
  const askStore = useAskStore();

  const viewerStore = useViewerStore();
  const { needInterruptUserClick } = useInterruptUserClick();

  /** 页数，默认为 0，请求接口时会自动加 1 */
  const pageNumber = ref(0);
  const pageSize = ref(10);
  const isNoMore = ref(false);

  /** 提问消息列表 */
  const askMsgList = ref<AskMsgType[]>([]);

  /** 默认消息的 id */
  const placeholderMsgId = uuidV4();

  /** 提问是否可以发送图片 */
  const questionImageEnabled = ref(false);

  /** 输入框是否禁用 */
  const inputDisabled = computed(() => {
    return needInterruptUserClick.value || !viewerStore.hasNickname;
  });

  /** 提问区输入框占位符 */
  const askInputPlaceholder = computed(() => {
    return translate('ask.input.placeholder');
  });

  /** 渲染的消息列表 */
  const askMsgRenderList = computed<AskMsgType[]>(() => {
    const list = [...unref(askMsgList)];

    if (channelStore.teacherInfo && askStore.askWelcomeText) {
      const time = list[0] ? list[0].time : Date.now();

      // 插入默认消息
      const placeholderMsg: ChatMsgSpeakType = {
        id: placeholderMsgId,
        time,
        msgSource: ChatMsgSource.Speak,
        user: channelStore.teacherInfo,
        content: askStore.askWelcomeText,
      };
      list.unshift(placeholderMsg);
    }

    return list;
  });

  async function __updateAskMsgList(list: AskMsgType[]) {
    askMsgList.value = [...list, ...askMsgList.value];

    const askMsgListInstance = unref(askMsgListRef);
    if (pageNumber.value === 1) {
      askMsgListInstance?.scrollToBottom();
    } else {
      await askMsgListInstance?.scrollToFirstRecord();
    }

    await nextTick();
    askMsgListInstance?.recordFirstElem();
  }

  /** 获取提问消息列表 */
  async function getAskMsgList() {
    if (isNoMore.value) {
      return;
    }

    const result = await watchCore.ask.getAskHistoryByUserId({
      pageNumber: pageNumber.value + 1,
      pageSize: pageSize.value,
    });

    pageNumber.value = result.pageNumber;
    pageSize.value = result.pageSize;
    isNoMore.value = pageNumber.value >= result.totalPages;

    __updateAskMsgList(result.contents);
  }

  /**
   * 根据消息内容删除提问， 倒序查找
   * @param askMsg
   */
  function removeMsgByContent(askMsg: ChatMsgSpeakType) {
    const reverseIndex = reverseFindIndex(askMsgList.value, item => {
      return item.msgSource === ChatMsgSource.Speak && item.content.indexOf(askMsg.content) !== -1;
    });

    if (reverseIndex !== -1) {
      askMsgList.value.splice(reverseIndex, 1);
    }
  }

  /**
   * 根据id删除提问
   * @param id
   */
  function removeMsgById(id: string) {
    const index = askMsgList.value.findIndex(item => {
      return item.id === id;
    });

    if (index !== -1) {
      askMsgList.value.splice(index, 1);
    }
  }

  function replaceMsg(id: string, askMsg: AskMsgType) {
    const reverseIndex = reverseFindIndex(askMsgList.value, item => {
      return item.id === id;
    });

    if (reverseIndex !== -1) {
      askMsgList.value.splice(reverseIndex, 1, askMsg);
    }
  }

  function onScrollNearTop() {
    getAskMsgList();
  }

  /** 滚动显示最新消息 */
  function scrollToNew() {
    const askMsgListInstance = unref(askMsgListRef);
    askMsgListInstance?.scrollToBottom();
  }

  function hideMoreMsg() {
    askStore.hideMoreMsg();
  }

  /** 处理提问相关事件 */
  function onAskEvent(evt: { askMsg: AskMsgType }) {
    askMsgList.value.push(evt.askMsg);
    const askMsgListInstance = unref(askMsgListRef);
    const isNearBottom = askMsgListInstance?.checkScrollToBottom();
    if (!isNearBottom && !evt.askMsg.isLocal) {
      askStore.showMoreMsg();
    }
  }

  function onSendBadWord() {
    const watchCore = getWatchCore();
    watchCore.ask.sendSystemMsg(translate('ask.badWord'));
  }

  function onReplaceMessage(evt: AskEventsRelations[AskEvents.ReplaceAskMessage]) {
    replaceMsg(evt.id, evt.askMsg);
  }

  function onRemoveMessage(evt: AskEventsRelations[AskEvents.RemoveAskMessage]) {
    if (evt.askMsg && evt.askMsg.msgSource === ChatMsgSource.Speak) {
      removeMsgByContent(evt.askMsg);
    } else if (evt.id) {
      removeMsgById(evt.id);
    }
  }

  function onRemoveSingleQuestion(evt: AskEventsRelations[AskEvents.RemoveSingleQuestion]) {
    removeMsgById(evt.id);
  }

  function onRemoveAskUser(evt: AskEventsRelations[AskEvents.RemoveAskUser]) {
    if (evt.userId !== viewerStore.viewerId) {
      return;
    }
    askMsgList.value = [];
  }

  function bindAskEvent() {
    const watchCore = getWatchCore();
    watchCore.ask.eventEmitter.on(AskEvents.StudentQuestion, onAskEvent);
    watchCore.ask.eventEmitter.on(AskEvents.TeacherAnswer, onAskEvent);
    watchCore.ask.eventEmitter.on(AskEvents.SystemMessage, onAskEvent);
    watchCore.ask.eventEmitter.on(AskEvents.SendBadWord, onSendBadWord);
    watchCore.ask.eventEmitter.on(AskEvents.ReplaceAskMessage, onReplaceMessage);
    watchCore.ask.eventEmitter.on(AskEvents.RemoveAskMessage, onRemoveMessage);
    watchCore.ask.eventEmitter.on(AskEvents.RemoveSingleQuestion, onRemoveSingleQuestion);
    watchCore.ask.eventEmitter.on(AskEvents.RemoveAskUser, onRemoveAskUser);
  }

  function unbindAskEvent() {
    const watchCore = getWatchCore();
    watchCore.ask.eventEmitter.off(AskEvents.StudentQuestion, onAskEvent);
    watchCore.ask.eventEmitter.off(AskEvents.TeacherAnswer, onAskEvent);
    watchCore.ask.eventEmitter.off(AskEvents.SystemMessage, onAskEvent);
    watchCore.ask.eventEmitter.off(AskEvents.SendBadWord, onSendBadWord);
    watchCore.ask.eventEmitter.off(AskEvents.ReplaceAskMessage, onReplaceMessage);
    watchCore.ask.eventEmitter.off(AskEvents.RemoveAskMessage, onRemoveMessage);
    watchCore.ask.eventEmitter.off(AskEvents.RemoveSingleQuestion, onRemoveSingleQuestion);
    watchCore.ask.eventEmitter.off(AskEvents.RemoveAskUser, onRemoveAskUser);
  }

  onMounted(() => {
    getAskMsgList();
    const askSetting = watchCore.ask.getAskSetting();
    questionImageEnabled.value = askSetting.questionImageEnabled;

    bindAskEvent();
  });

  onBeforeUnmount(() => {
    unbindAskEvent();
  });

  return {
    askMsgListRef,
    askMsgList,
    askMsgRenderList,

    inputDisabled,
    askInputPlaceholder,
    questionImageEnabled,

    onScrollNearTop,
    scrollToNew,
    hideMoreMsg,
  };
};

/**
 * 提问新消息提醒 hook
 */
export const useAskReminder = (hookOptions: { onAskMsg: () => void }) => {
  const { getWatchCore } = useGlobalInject();

  const { onAskMsg } = hookOptions;
  const askStore = useAskStore();

  /** 提问消息红点提示是否可见 */
  const askReminderVisible = computed(() => {
    return askStore.askReminderVisible;
  });

  /** 更新提问新消息提醒可见状态 */
  function updateAskReminderVisible(visible: boolean) {
    askStore.$patch({
      askReminderVisible: visible,
    });
  }

  /**
   * 监听聊天室消息
   */
  function listenAskMsg() {
    unlistenAskMsg();
    const watchCore = getWatchCore();
    watchCore.ask.eventEmitter.on(AskEvents.TeacherAnswer, onAskMsg);
    watchCore.ask.eventEmitter.on(AskEvents.StudentQuestion, onAskMsg);
  }

  function unlistenAskMsg() {
    const watchCore = getWatchCore();
    watchCore.ask.eventEmitter.off(AskEvents.TeacherAnswer, onAskMsg);
    watchCore.ask.eventEmitter.off(AskEvents.StudentQuestion, onAskMsg);
  }

  onMounted(() => {
    listenAskMsg();
  });

  onBeforeUnmount(() => {
    unlistenAskMsg();
  });

  return {
    askReminderVisible,
    updateAskReminderVisible,
  };
};

export const useAskSdk = () => {
  const { getWatchCore } = useGlobalInject();

  const askSdk = ref();

  async function getAskSdk() {
    const watchCore = getWatchCore();
    return watchCore.ask.getAskSdk();
  }

  onMounted(async () => {
    askSdk.value = await getAskSdk();
    askSdk.value.setup();
  });

  return {
    askSdk,
  };
};
