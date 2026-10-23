/**
 * @file 浏览器全屏 hook
 */
import { computed, onBeforeUnmount, ref, Ref, unref } from 'vue';

export interface FullscreenFieldData {
  /** 浏览器是否支持全屏模式的 api 字段 */
  enabledField: 'fullscreenEnabled';
  /** 获取浏览器正在全屏的 dom 节点 api 字段 */
  elementField: 'fullscreenElement';
  /** 浏览器全屏的 api 字段 */
  requestApiField: 'requestFullscreen';
  /** 浏览器退出全屏的 api 字段 */
  exitApiField: 'exitFullscreen';
  /** 浏览器全屏状态改变事件 */
  fullscreenChangeEvent: 'fullscreenchange';
}

// 各浏览器全屏接口
const apis = [
  {
    enabledField: 'fullscreenEnabled',
    elementField: 'fullscreenElement',
    requestApiField: 'requestFullscreen',
    exitApiField: 'exitFullscreen',
    fullscreenChangeEvent: 'fullscreenchange',
  },
  // New WebKit
  {
    enabledField: 'webkitFullscreenEnabled',
    elementField: 'webkitFullscreenElement',
    requestApiField: 'webkitRequestFullscreen',
    exitApiField: 'webkitExitFullscreen',
    fullscreenChangeEvent: 'webkitfullscreenchange',
  },
  // Old WebKit
  {
    enabledField: 'webkitCancelFullScreen',
    elementField: 'webkitCurrentFullScreenElement',
    requestApiField: 'webkitRequestFullScreen',
    exitApiField: 'webkitCancelFullScreen',
    fullscreenChangeEvent: 'webkitfullscreenchange',
  },
  {
    enabledField: 'mozFullScreenEnabled',
    elementField: 'mozFullScreenElement',
    requestApiField: 'mozRequestFullScreen',
    exitApiField: 'mozCancelFullScreen',
    fullscreenChangeEvent: 'mozfullscreenchange',
  },
  {
    enabledField: 'msFullscreenEnabled',
    elementField: 'msFullscreenElement',
    requestApiField: 'msRequestFullscreen',
    exitApiField: 'msExitFullscreen',
    fullscreenChangeEvent: 'MSFullscreenChange',
  },
];

let fieldData: FullscreenFieldData | undefined;

// 遍历 apis，获取当前可以用的全屏 api
for (let i = 0; i < apis.length; i++) {
  const item = apis[i];
  if (item.enabledField in document) {
    fieldData = item as FullscreenFieldData;
    break;
  }
}

/**
 * 退出浏览器全屏（复用模块级厂商前缀检测，不创建监听器）。
 * 当页面无全屏元素时为空操作。
 */
export function exitBrowserFullscreen(): void {
  if (!fieldData) return;
  if (document[fieldData.elementField]) {
    document[fieldData.exitApiField]();
  }
}

export type FullscreenElement = Element | Ref<Element>;

export type GetFullscreenElement = () => FullscreenElement;

/**
 * @hook 全屏处理
 */
export const useFullscreen = (
  elementRef: FullscreenElement | GetFullscreenElement = document.documentElement,
  options?: {
    /** 强制禁用全屏 */
    forceDisabled?: boolean;
    onFullscreenChange?: (isFullscreen: boolean) => void;
  },
) => {
  const isFullscreen = ref(false);

  const { onFullscreenChange: cbFullScreen, forceDisabled = false } = options || {};

  function setFullScreen(val: boolean) {
    isFullscreen.value = val;
    cbFullScreen && cbFullScreen(val);
  }

  /** 是否支持浏览器全屏 */
  const supportFullscreen = computed(() => {
    if (forceDisabled) return false;

    return !!fieldData;
  });

  const getFullscreenElement = () => {
    if (typeof elementRef === 'function') {
      const res = elementRef();
      return unref(res) || document.documentElement;
    }

    return unref(elementRef) || document.documentElement;
  };

  /** 全屏 */
  function requestFullscreen() {
    const element = getFullscreenElement();
    if (!fieldData || !element[fieldData.requestApiField]) {
      return;
    }
    element[fieldData.requestApiField]();
  }

  /** 退出全屏 */
  function exitFullscreen() {
    if (!fieldData) {
      return;
    }
    document[fieldData.exitApiField]();
  }

  /** 切换全屏状态 */
  function toggleFullscreen() {
    if (!fieldData) {
      return;
    }
    if (!document[fieldData.elementField]) {
      requestFullscreen();
    } else {
      exitFullscreen();
    }
  }

  /** 处理全屏事件 */
  function onFullscreenChange() {
    if (!fieldData) {
      return;
    }
    if (document[fieldData.elementField]) {
      setFullScreen(true);
    } else {
      setFullScreen(false);
    }
  }

  if (fieldData) {
    document.addEventListener(fieldData.fullscreenChangeEvent, onFullscreenChange);
  }

  onBeforeUnmount(() => {
    if (!fieldData) {
      return;
    }
    document.removeEventListener(fieldData.fullscreenChangeEvent, onFullscreenChange);
  });

  return {
    isFullscreen,
    supportFullscreen,
    requestFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
};
