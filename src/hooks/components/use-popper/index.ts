/**
 * @file 弹层相关 hook
 */
import { $ } from '@polyv/utils/dom';
import { ref, unref, watchEffect } from 'vue';

import { getRefElem } from '@polyv/vue-components';
import { useAppendTo } from '@/hooks/behaviors/use-append-to';
import { useAutoTopmostToShow } from '@/hooks/components/use-popper/use-auto-topmost-show';

import { usePopperCore } from './_hooks/use-popper-core';
import { usePopperInteractive } from './_hooks/use-popper-interactive';
import { usePopperVisible } from './_hooks/use-popper-visible';
import { usePopperArrow } from './_hooks/use-popper-arrow';
import { OnPopperEventParams, PopperOffset, PopperOptions, UsePopperOptions } from './_popper-type';

/**
 * @hook 弹出层 hook
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export const usePopper = (options: UsePopperOptions = {}) => {
  /** 触发节点 ref */
  const referenceRef = options.referenceRef ?? ref();
  /** 弹层节点 ref */
  const popperRef = options.popperRef ?? ref();
  /** 输入框节点 ref，用于聚焦显示的交互 */
  const inputRef = options.inputRef ?? ref();
  /** 弹层是否禁用 */
  const popperDisabled = options.popperDisabled ?? ref(false);
  /** 触发方式 */
  const trigger = options.trigger ?? ref('click');
  /** hover 触发鼠标移入延迟显示 */
  const mouseEnterDelay = options.mouseEnterDelay ?? ref(100);
  /** hover 触发鼠标移入延迟显示 */
  const mouseLeaveDelay = options.mouseLeaveDelay ?? ref(100);
  /** 弹层位置 */
  const placement = options.placement ?? ref('bottom');
  /** 弹层偏移量 */
  const popperOffset = options.popperOffset ?? ref<PopperOffset>([0, 0]);
  /** 是否创建箭头 */
  const arrow = options.arrow ?? ref(false);
  /** 强制 outSideClick 关闭 */
  const forceOutSideClickHide = options.forceOutSideClickHide ?? ref(false);
  /** outSideClick 关闭时是否延迟 */
  const outSideClickDelayHide = options.outSideClickDelayHide ?? ref(false);
  /** 弹层宽度跟随触发节点 */
  const followReferenceWidth = options.followReferenceWidth ?? ref(false);
  /** 强制 ZIndex */
  const forceZIndex = options.forceZIndex ?? null;

  const appendToBody = options.appendToBody ?? true;
  const mountEl = options.mountEl ?? '';

  if (!appendToBody && !mountEl) {
    console.warn('[use-popper] need mountEl');
  }

  const { popperVisible, showPopper, hidePopper, togglePopper, delayShowPopper, delayHidePopper } =
    usePopperVisible(options);

  // 获取节点信息
  function getElement() {
    return {
      referenceElem: getRefElem(referenceRef) as HTMLElement | undefined,
      popperElem: getRefElem(popperRef) as HTMLElement | undefined,
      inputElem: getRefElem(inputRef) as HTMLElement | undefined,
    };
  }

  /** 处理弹层 SDK 的事件 */
  function onPopperEvent(params: OnPopperEventParams) {
    const { isReferenceHidden } = params;
    // 滚动中触发层已隐藏，则将弹层一起隐藏
    if (isReferenceHidden && unref(popperVisible)) {
      hidePopper();
    }
  }

  watchEffect(() => {
    const { referenceElem, popperElem } = getElement();
    if (unref(followReferenceWidth) && unref(popperVisible) && referenceElem && popperElem) {
      const clientWidth = referenceElem.clientWidth;
      $(popperElem).css({
        width: `${clientWidth}px`,
      });
    }
  });

  const popperOptions: PopperOptions = {
    referenceRef,
    popperRef,
    inputRef,
    popperDisabled,
    trigger,
    mouseEnterDelay,
    mouseLeaveDelay,
    placement,
    popperOffset,
    arrow,
    forceOutSideClickHide,
    outSideClickDelayHide,
    followReferenceWidth,
    popperVisible,
    appendToBody,
    mountEl,
    forceZIndex,
    showPopper,
    hidePopper,
    togglePopper,
    delayShowPopper,
    delayHidePopper,
    getElement,
    onPopperEvent,
  };

  const popperAppendDom = appendToBody
    ? document.body
    : (document.querySelector(mountEl) as HTMLElement);
  useAppendTo(popperRef, popperAppendDom);
  usePopperArrow(popperOptions);
  usePopperInteractive(popperOptions);
  useAutoTopmostToShow(popperVisible, popperRef);
  const { updatePopper } = usePopperCore(popperOptions);

  return {
    ...popperOptions,
    updatePopper,
  };
};
