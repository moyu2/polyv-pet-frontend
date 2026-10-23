import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { onBeforeMount, onMounted } from 'vue';

function plvInterval(
  fn: AnyFunc,
  intervalTime: number,
  options?: {
    maxCount?: number;
    immediate?: boolean;
  },
): { clear: () => void } {
  const { maxCount = Infinity, immediate = false } = options || {};

  let timer: number;
  let intervalCount = 0;

  const innerInterval = () => {
    timer = window.setTimeout(() => {
      fn();
      intervalCount++;

      if (intervalCount < maxCount) {
        innerInterval();
      } else {
        window.clearTimeout(timer);
      }
    }, intervalTime);
  };

  if (immediate) {
    fn();
  }
  innerInterval();

  return {
    clear: () => {
      // 处理 intervalTime 过少的情况，比如 100ms
      window.setTimeout(() => {
        window.clearTimeout(timer);
      }, 0);
    },
  };
}

/**
 * 轮询 hook
 * @param callback 回调函数
 * @param time 轮询时间，单位：毫秒
 */
export const usePolling = (callback: () => unknown, time = 3000) => {
  const watchAppStore = useWatchAppStore();
  const webviewStore = useWebviewStore();

  let timer: ReturnType<typeof plvInterval> | undefined;

  function startPolling() {
    removePolling();
    timer = plvInterval(() => {
      if (watchAppStore.isPageActive || webviewStore.curWebviewPageIsActive) {
        callback();
      }
    }, time);
  }

  function removePolling() {
    timer && timer.clear();
    timer = undefined;
  }

  onMounted(() => {
    startPolling();
  });

  onBeforeMount(() => {
    removePolling();
  });

  return {
    startPolling,
    removePolling,
  };
};
