import { onBeforeUnmount, Ref, watch } from 'vue';
import { ResizeObserver } from '@juggle/resize-observer';

export const useResizeObserver = (
  refObj: Ref<Element | undefined>,
  callback: () => unknown,
  options?: {
    autoLifeCycle: boolean;
  },
) => {
  const { autoLifeCycle = true } = options || {};

  const observer = new ResizeObserver(() => {
    callback();
  });

  watch(
    () => refObj.value,
    () => {
      if (refObj.value) {
        observer.observe(refObj.value);
      } else {
        observer.disconnect();
      }
    },
    {
      immediate: true,
    },
  );

  if (autoLifeCycle) {
    onBeforeUnmount(() => {
      observer.disconnect();
    });
  }

  return {
    observer,
  };
};
