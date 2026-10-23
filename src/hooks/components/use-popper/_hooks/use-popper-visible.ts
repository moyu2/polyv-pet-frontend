/**
 * @file popper 弹层显示状态 hook
 */
import { isRef, onBeforeUnmount, Ref, ref, unref } from 'vue';
import { PopperVisibleResult } from '../_popper-type';

export type UsePopperVisibleOptions = {
  popperVisible?: boolean | Ref<boolean>;
};

export const usePopperVisible = (options: UsePopperVisibleOptions = {}): PopperVisibleResult => {
  /** 弹层显示状态 */
  const popperVisible = isRef(options.popperVisible)
    ? options.popperVisible
    : ref(!!options.popperVisible);

  // 设置弹层显示状态
  function setVisible(visible = false) {
    destroyDelayShowTimer();
    destroyDelayHideTimer();
    popperVisible.value = visible;
  }

  /** 显示弹层 */
  function showPopper() {
    setVisible(true);
  }

  /** 隐藏弹层 */
  function hidePopper() {
    setVisible(false);
  }

  /** 切换弹层显示状态 */
  function togglePopper() {
    setVisible(!unref(popperVisible));
  }

  /** 显示延迟计时器 */
  let delayShowTimer: number | undefined;
  /** 隐藏延迟计时器 */
  let delayHideTimer: number | undefined;

  /** 延迟显示弹层 */
  function delayShowPopper(delay = 100) {
    destroyDelayShowTimer();
    destroyDelayHideTimer();
    if (!delay) {
      showPopper();
      return;
    }
    delayShowTimer = window.setTimeout(() => showPopper(), delay);
  }

  /** 延迟隐藏弹层 */
  function delayHidePopper(delay = 100) {
    destroyDelayShowTimer();
    destroyDelayHideTimer();
    if (!delay) {
      hidePopper();
      return;
    }
    delayHideTimer = window.setTimeout(() => hidePopper(), delay);
  }

  /** 销毁显示延迟定时器 */
  function destroyDelayShowTimer() {
    clearTimeout(delayShowTimer);
    delayShowTimer = undefined;
  }

  /** 销毁隐藏延迟定时器 */
  function destroyDelayHideTimer() {
    clearTimeout(delayHideTimer);
    delayHideTimer = undefined;
  }

  onBeforeUnmount(() => {
    destroyDelayShowTimer();
    destroyDelayHideTimer();
  });

  return {
    popperVisible,
    showPopper,
    hidePopper,
    togglePopper,
    delayShowPopper,
    delayHidePopper,
  };
};
