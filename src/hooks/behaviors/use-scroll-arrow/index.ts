import { ref, nextTick } from 'vue';
import { useWindowResizeListener } from '../../core/use-window-resize-listener';

/**
 * @hook 根据滚动内容处理横向滚动条与箭头显示
 * */
export const useHorizontalScrollArrow = () => {
  /** 滚动节点 */
  const scrollRef = ref<HTMLDivElement>();
  /** 左箭头是否显示 */
  const leftArrowVisible = ref(false);
  /** 右箭头是否显示 */
  const rightArrowVisible = ref(false);

  /** 重置箭头显示状态 */
  async function resetArrowVisible() {
    await nextTick();

    if (!scrollRef.value) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.value;

    if (scrollWidth > clientWidth) {
      rightArrowVisible.value = true;
    } else {
      rightArrowVisible.value = false;
    }

    if (scrollLeft > 0) {
      leftArrowVisible.value = true;
    } else {
      leftArrowVisible.value = false;
    }
  }

  /** 处理节点滚动事件 */
  function onScrollEvent() {
    resetArrowVisible();
  }

  /** 处理左箭头点击 */
  function onLeftArrowClick() {
    if (!leftArrowVisible.value || !scrollRef.value) {
      return;
    }

    scrollRef.value.scrollLeft = 0;
  }

  /** 处理右箭头点击 */
  function onRightArrowClick() {
    if (!rightArrowVisible.value || !scrollRef.value) {
      return;
    }

    scrollRef.value.scrollLeft = scrollRef.value.scrollWidth;
  }

  useWindowResizeListener(resetArrowVisible, {
    autoListen: true,
  });

  return {
    scrollRef,
    leftArrowVisible,
    rightArrowVisible,
    resetArrowVisible,
    onScrollEvent,
    onLeftArrowClick,
    onRightArrowClick,
  };
};
