import { plvInterval } from '@polyv/live-watch-sdk';
import { throttle } from 'lodash-es';
import { onBeforeUnmount, onMounted, Ref } from 'vue';

export const useLazyLoad = (
  contentElRef: Ref<HTMLElement | undefined>,
  scrollElRef: Ref<HTMLElement | undefined>,
  options: {
    direction: 'horizontal' | 'vertical';
    buffer: () => number;
    loadMore: () => void;
  },
) => {
  const bufferDistance = () => Math.max(0, options.buffer());

  /** 检查是否在可见范围内 */
  function checkVerticalVisible() {
    if (!contentElRef.value || !scrollElRef.value) return false;

    const { top } = contentElRef.value.getBoundingClientRect();
    if (top > scrollElRef.value.clientHeight) {
      return false;
    }

    return true;
  }

  function __onVerticalScroll() {
    if (!contentElRef.value || !scrollElRef.value) return;

    if (!checkVerticalVisible()) {
      return;
    }

    const clientHeight = scrollElRef.value.clientHeight;
    const scrollHeight = scrollElRef.value.scrollHeight;
    const scrollTop = scrollElRef.value.scrollTop;

    if (Math.ceil(scrollTop + clientHeight + bufferDistance()) >= scrollHeight) {
      options.loadMore();
    }
  }

  function __onHorizontalScroll() {
    if (!contentElRef.value || !scrollElRef.value) return;

    const clientWidth = scrollElRef.value.clientWidth;
    const scrollWidth = scrollElRef.value.scrollWidth;
    const scrollLeft = scrollElRef.value.scrollLeft;

    if (Math.ceil(scrollLeft + clientWidth + bufferDistance()) >= scrollWidth) {
      options.loadMore();
    }
  }

  const onScroll = throttle(() => {
    if (options.direction === 'vertical') {
      __onVerticalScroll();
      return;
    }

    if (options.direction === 'horizontal') {
      __onHorizontalScroll();
    }
  }, 300);

  /**
   * 通过轮询，尽量满足内容区能占满滚动区，最多尝试两次
   * @warn 后续可以优化下，看看有没有比轮询更合适的方式
   */
  function tryToFillScreen() {
    const timer = plvInterval(
      () => {
        if (!contentElRef.value || !scrollElRef.value) return false;

        const scrollDistance =
          options.direction === 'vertical'
            ? scrollElRef.value.clientHeight
            : scrollElRef.value.clientWidth;

        const contentDistance =
          options.direction === 'vertical'
            ? contentElRef.value.clientHeight
            : contentElRef.value.clientWidth;

        if (contentDistance <= scrollDistance) {
          options.loadMore();
        } else {
          timer.clear();
        }
      },
      300,
      {
        maxCount: 2,
      },
    );
  }

  onMounted(() => {
    if (scrollElRef.value === document.documentElement) {
      document.addEventListener('scroll', onScroll);
    } else {
      scrollElRef.value?.addEventListener('scroll', onScroll);
    }

    tryToFillScreen();
  });

  onBeforeUnmount(() => {
    if (scrollElRef.value === document.documentElement) {
      document.removeEventListener('scroll', onScroll);
    } else {
      scrollElRef.value?.removeEventListener('scroll', onScroll);
    }
  });
};
