import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

/**
 * 滚动加载 Hook
 */
export const useScrollLoad = (
  loadMoreCallback: () => void,
  options: {
    /** 距离底部多少像素时触发加载 */
    threshold?: number;
    /** 是否禁用滚动加载 */
    disabled?: () => boolean;
  } = {},
) => {
  const { threshold = 100, disabled } = options;

  /** 滚动容器引用 */
  const scrollContainerRef = ref<HTMLElement>();

  /** 滚动事件处理 */
  function handleScroll() {
    if (disabled && disabled()) {
      return;
    }

    const container = scrollContainerRef.value;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    // 计算是否接近底部
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceToBottom <= threshold) {
      loadMoreCallback();
    }
  }

  /** 节流处理 */
  let throttleTimer: number | null = null;
  let lastExecuteTime = 0;
  const throttleDelay = 200;

  function throttledHandleScroll() {
    const now = Date.now();

    if (now - lastExecuteTime < throttleDelay) {
      if (throttleTimer) return;

      throttleTimer = requestAnimationFrame(() => {
        handleScroll();
        lastExecuteTime = Date.now();
        throttleTimer = null;
      });
    } else {
      handleScroll();
      lastExecuteTime = now;
    }
  }

  /** 绑定滚动事件 */
  function bindScrollEvent() {
    nextTick(() => {
      const container = scrollContainerRef.value;
      if (container) {
        container.addEventListener('scroll', throttledHandleScroll, { passive: true });
      }
    });
  }

  /** 移除滚动事件 */
  function unbindScrollEvent() {
    const container = scrollContainerRef.value;
    if (container) {
      container.removeEventListener('scroll', throttledHandleScroll);
    }
    if (throttleTimer) {
      cancelAnimationFrame(throttleTimer);
      throttleTimer = null;
    }
  }

  onMounted(() => {
    bindScrollEvent();
  });

  onBeforeUnmount(() => {
    unbindScrollEvent();
  });

  return {
    scrollContainerRef,
    bindScrollEvent,
    unbindScrollEvent,
  };
};
