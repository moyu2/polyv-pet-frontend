import { throttle } from 'lodash-es';
import { nextTick, ref, unref } from 'vue';

export interface ScrollListInstance {
  /** 是否靠近底部 */
  isNearBottom(): boolean;
  /** 滚动到最底部 */
  scrollToBottom(): void;
  /** 检查当前滚动条是否靠近底部，靠近则滚到底部 */
  checkScrollToBottom(): boolean;
  /** 记录当前的第一个节点 */
  recordFirstElem(): void;
  /** 滚动到记录到首个节点 */
  scrollToFirstRecord(): Promise<void>;
}

export interface UseScrollListOptions {
  /** 默认 0 */
  getBufferTop?: (scrollEl: HTMLElement) => number;
  /** 首个节点的索引，默认：0 */
  firstElemIndex?: number;
  /** 靠近顶部回调 */
  nearTopCallback?: () => void;
  /** 靠近底部回调 */
  nearBottomCallback?: () => void;
}

/**
 * @hook 滚动列表
 */
export const useScrollList = (options: UseScrollListOptions = {}) => {
  const { firstElemIndex = 0 } = options;

  /** 滚动节点 */
  const scrollRef = ref<HTMLDivElement>();

  let firstElem: HTMLElement | undefined;

  /** 记录当前的第一个节点 */
  function recordFirstElem() {
    const scrollElem = unref(scrollRef);
    if (!scrollElem) {
      return;
    }
    const childElements = scrollElem.childNodes;
    if (childElements.length > 1) {
      firstElem = childElements[firstElemIndex] as HTMLElement;
    }
  }

  /** 滚动到记录到首个节点 */
  async function scrollToFirstRecord() {
    const scrollElem = unref(scrollRef);
    if (!scrollElem || !firstElem) {
      return;
    }
    await nextTick();
    const scrollTop = firstElem.offsetTop - firstElem.clientHeight + firstElem.clientHeight;
    scrollElem.scrollTop = scrollTop;
  }

  /** 是否靠近底部 */
  function isNearBottom(): boolean {
    const scrollElem = unref(scrollRef);
    if (!scrollElem) {
      return false;
    }

    const clientRect = Object.assign({}, scrollElem.getBoundingClientRect());
    clientRect.width = clientRect.width || clientRect.right - clientRect.left;
    clientRect.height = clientRect.height || clientRect.bottom - clientRect.top;

    // 消息列表处于非可见状态
    if (clientRect.width === 0 && clientRect.height === 0) {
      return false;
    }

    return scrollElem.scrollHeight - scrollElem.clientHeight - scrollElem.scrollTop < 120;
  }

  /** 滚动到最底部 */
  async function scrollToBottom() {
    await nextTick();
    const scrollElem = unref(scrollRef);
    if (!scrollElem) {
      return;
    }
    scrollElem.scrollTop = scrollElem.scrollHeight;
  }

  /** 检查当前滚动条是否靠近底部，靠近则滚到底部 */
  function checkScrollToBottom(): boolean {
    const isNear = isNearBottom();
    if (isNear) {
      scrollToBottom();
    }
    return !!isNear;
  }

  /** 处理滚动事件 */
  const onScrollEvent = throttle(() => {
    const scrollElem = unref(scrollRef);
    if (!scrollElem) {
      return;
    }

    const top = scrollElem.scrollTop;
    const distance = options.getBufferTop ? options.getBufferTop(scrollElem) : 0;
    if (top <= distance && options.nearTopCallback) {
      options.nearTopCallback();
    }

    if (
      scrollElem.scrollHeight - scrollElem.clientHeight - scrollElem.scrollTop < 10 &&
      options.nearBottomCallback
    ) {
      options.nearBottomCallback();
    }
  }, 300);

  /** 导出对象 */
  const scrollListInstance: ScrollListInstance = {
    isNearBottom,
    scrollToBottom,
    checkScrollToBottom,
    recordFirstElem,
    scrollToFirstRecord,
  };

  return {
    scrollRef,
    isNearBottom,
    scrollToBottom,
    checkScrollToBottom,
    scrollListInstance,
    onScrollEvent,
  };
};
