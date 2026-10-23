import { onMounted, onUnmounted, ref } from 'vue';

/**
 * 悬浮可见处理
 * @hook
 */
export const useHoverVisible = (
  hookOptions: {
    /** 自动展示，默认为 true */
    autoHover?: boolean;
    /** 自动关闭时长，默认为 3000ms */
    timeout?: number;
  } = {},
) => {
  const { autoHover = true, timeout = 3000 } = hookOptions;

  const hoverItemVisible = ref(false);

  function showHoverItem() {
    hoverItemVisible.value = true;
    setHoverItemHideTimer();
  }

  function hideHoverItem() {
    hoverItemVisible.value = false;
  }

  let closeTimer: number | undefined;

  function setHoverItemHideTimer() {
    clearHoverItemHideTimer();
    closeTimer = window.setTimeout(() => {
      hideHoverItem();
    }, timeout);
  }

  function clearHoverItemHideTimer() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
    }
  }

  function forceShowHoverItem() {
    clearHoverItemHideTimer();
    hoverItemVisible.value = true;
  }

  onMounted(() => {
    if (autoHover) {
      showHoverItem();
    }
  });

  onUnmounted(() => {
    clearHoverItemHideTimer();
  });

  return {
    hoverItemVisible,
    showHoverItem,
    forceShowHoverItem,
    hideHoverItem: setHoverItemHideTimer,
  };
};
