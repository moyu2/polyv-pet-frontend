import { ref, unref } from 'vue';

/**
 * 滚动条 hook
 */
export const useScrollBar = (elemRef: RefOrElement<HTMLElement | undefined>) => {
  /** 滚动条是否显示 */
  const scrollBarVisible = ref(false);

  /**
   * 检查滚动条是否显示
   */
  function checkScrollBarVisible() {
    if (!elemRef) {
      return;
    }
    const elem = unref(elemRef);
    if (!elem) {
      return;
    }

    scrollBarVisible.value = elem.scrollHeight > elem.clientHeight;
  }

  return {
    scrollBarVisible,
    checkScrollBarVisible,
  };
};
