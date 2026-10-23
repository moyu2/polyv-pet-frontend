import { onBeforeUnmount, onMounted } from 'vue';
import { debounce } from 'lodash-es';

/**
 * @hook 监听 windows resize 事件
 */
export const useWindowResizeListener = (
  callback: () => unknown,
  opts?: {
    /** 是否自动监听，默认 false */
    autoListen?: boolean;
    /** 自动监听后立即执行回调，默认 false */
    immediately?: boolean;
    /** 回调防抖时长，默认不防抖 */
    debounceTime?: number;
  },
) => {
  const {
    autoListen = false,
    immediately = false,

    debounceTime = 0,
  } = opts || {};

  const debounceFunc = debounceTime === 0 ? callback : debounce(callback, debounceTime);

  /** 监听 resize 事件 */
  function bindWindowResize() {
    unbindWindowResize();
    window.addEventListener('resize', debounceFunc);
  }

  /** 移除 resize 事件监听 */
  function unbindWindowResize() {
    window.removeEventListener('resize', debounceFunc);
  }

  if (autoListen) {
    onMounted(() => {
      bindWindowResize();
      if (immediately) {
        callback();
      }
    });
  }

  onBeforeUnmount(() => {
    unbindWindowResize();
  });

  return {
    bindWindowResize,
    unbindWindowResize,
  };
};
