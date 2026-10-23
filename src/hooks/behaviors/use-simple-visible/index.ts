/**
 * @file 简单的显隐 hook
 */

import { onBeforeUnmount, ref, unref, watch } from 'vue';

export interface SimpleVisibleOptions {
  /** 是否自动关闭，默认：false */
  autoClose?: boolean;
  /** 自动关闭时间，单位：毫秒，默认：5 * 1000 */
  autoCloseTime?: number;
  /** 显示时回调 */
  showCallback?: () => void;
  /** 隐藏时回调 */
  hideCallback?: () => void;
  /** 更新回调 */
  changeCallback?: (visible: boolean) => void;
}

/**
 * 简单的显隐 hook
 * @param defaultVisible 默认显示状态，默认：false
 */
export const useSimpleVisible = (defaultVisible = false, options: SimpleVisibleOptions = {}) => {
  const { autoClose = false, autoCloseTime = 5 * 1000 } = options;

  const visible = ref(defaultVisible);

  /**
   * 设置显示状态
   * @param _visible 显示状态，默认：true
   */
  function setVisible(_visible = true) {
    if (visible.value === _visible) return;

    visible.value = _visible;
    if (_visible) {
      options.showCallback && options.showCallback();
    } else {
      options.hideCallback && options.hideCallback();
    }

    options.changeCallback && options.changeCallback(_visible);
  }

  /** 显示 */
  function show() {
    setVisible(true);
  }

  /** 关闭 */
  function close() {
    setVisible(false);
  }

  /** 切换显示状态 */
  function toggle() {
    if (unref(visible)) {
      close();
    } else {
      show();
    }
  }

  let closeTimer: number | undefined;

  /** 设置关闭定时器 */
  function setCloseTimer() {
    removeCloseTimer();
    closeTimer = window.setTimeout(() => {
      close();
    }, autoCloseTime);
  }

  /** 移除关闭定时器 */
  function removeCloseTimer() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
    }
  }

  // 自动关闭处理
  watch(
    () => unref(visible),
    () => {
      if (!autoClose) {
        return;
      }

      if (!visible.value) {
        removeCloseTimer();
        return;
      }
      setCloseTimer();
    },
    {
      immediate: true,
    },
  );

  onBeforeUnmount(() => {
    removeCloseTimer();
  });

  return {
    visible,
    setVisible,
    show,
    close,
    toggle,
  };
};
