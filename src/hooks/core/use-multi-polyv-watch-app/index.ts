import { useWatchAppStore } from '@/store/use-watch-app-store';

/**
 * 处理 touch 事件
 */
const useMultiPolyvWatchAppTouch = () => {
  let startY = 0;
  let allowBubbling = false;

  function onTouchStart(event: TouchEvent) {
    startY = event.touches[0].clientY;
    allowBubbling = false;
  }

  function onTouchMove(event: TouchEvent) {
    if (allowBubbling) return;

    const currentY = event.touches[0].clientY;
    const deltaY = Math.abs(currentY - startY);

    if (deltaY > 150) {
      allowBubbling = true;
    } else {
      event.stopImmediatePropagation();
    }
  }

  function onTouchEnd(event: TouchEvent) {
    allowBubbling = false;
    console.log('onTouchEnd', event);
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};

export const useMultiPolyvWatchAppScroll = () => {
  const watchAppStore = useWatchAppStore();

  function scrollIntoView(el: HTMLElement, opts?: boolean | ScrollIntoViewOptions | undefined) {
    if (!watchAppStore.isPageActive) return;

    el.scrollIntoView(opts);
  }

  return {
    scrollIntoView,
  };
};

export const useMultiPolyvWatchApp = () => {
  const watchAppStore = useWatchAppStore();

  function getWatchCore() {
    return watchAppStore.getWatchCore();
  }

  function getEmitter() {
    return watchAppStore.getEmitter();
  }

  function getAppRootElement() {
    return watchAppStore.getAppRootElement();
  }

  function getAppBodyElement(): HTMLElement {
    return watchAppStore.getAppBodyElement();
  }

  function getPolyvWatchApp() {
    return watchAppStore.getPolyvWatchApp();
  }

  function getAppElement() {
    return watchAppStore.getAppElement();
  }

  return {
    getWatchCore,
    getEmitter,
    getAppRootElement,
    getAppBodyElement,
    getAppElement,
    getPolyvWatchApp,
    ...useMultiPolyvWatchAppScroll(),
    ...useMultiPolyvWatchAppTouch(),
  };
};
