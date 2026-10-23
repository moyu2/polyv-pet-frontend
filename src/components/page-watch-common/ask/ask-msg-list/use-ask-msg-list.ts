import { TAB_NAME_ASK } from '@/assets/constants/tab-name';
import { PropUtils, emitFunc, VueEmit } from '@polyv/vue-components';
import { ScrollListInstance, useScrollList } from '@/hooks/behaviors/use-scroll-list';
import { useLayoutStore } from '@/store/use-layout-store';
import { AskMsgType } from '@polyv/live-watch-sdk';
import { watch } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AskMsgListInstance extends ScrollListInstance {}

export const askMsgListProps = () => ({
  /** 提问消息列表 */
  askMsgList: PropUtils.array<AskMsgType>().isRequired,
});

export const askMsgListEmits = () => ({
  'near-top': emitFunc<void>(),
  'near-bottom': emitFunc<void>(),
  'scroll-to-new': emitFunc<void>(),
});

export const useAskMsgList = (options: { emit: VueEmit<typeof askMsgListEmits> }) => {
  const { emit } = options;
  const layoutStore = useLayoutStore();

  const { scrollRef, scrollListInstance, onScrollEvent, scrollToBottom } = useScrollList({
    firstElemIndex: 1,
    getBufferTop: scrollEl => {
      // 需要隐藏前端主动插入的主讲第一条发言信息
      const firstElementHeight = scrollEl.firstElementChild?.clientHeight || 0;
      return firstElementHeight * 2;
    },
    nearTopCallback: () => {
      emit('near-top');
    },
    nearBottomCallback: () => {
      emit('near-bottom');
    },
  });

  // 切到提问 Tab 时自动滚到最底部
  watch(
    () => [layoutStore.mobileMenuCurrentName, layoutStore.pcAsideTabCurrentName],
    () => {
      if (
        layoutStore.mobileMenuCurrentName === TAB_NAME_ASK ||
        layoutStore.pcAsideTabCurrentName === TAB_NAME_ASK
      ) {
        scrollToBottom();
      }
    },
  );

  const askMsgListInstance: AskMsgListInstance = scrollListInstance;

  function scrollToNew() {
    emit('scroll-to-new');
  }

  return {
    scrollRef,
    askMsgListInstance,
    onScrollEvent,
    scrollToNew,
  };
};
