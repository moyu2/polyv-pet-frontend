import { Ref } from 'vue';
import type { Placement } from '@popperjs/core';
import { PopperArrowOptions } from './_hooks/use-popper-arrow';

export type PopperOffset = [number, number];

/** 弹层触发方式 */
export type PopperTrigger = 'click' | 'hover' | 'focus' | 'long-press' | 'custom';

export interface UsePopperOptions {
  popperVisible?: boolean | Ref<boolean>;
  /** 触发节点 ref */
  referenceRef?: HTMLElement | Ref<HTMLElement | undefined>;
  /** 弹层节点 ref */
  popperRef?: HTMLElement | Ref<HTMLElement | undefined>;
  /** 输入框节点 ref，用于聚焦显示的交互 */
  inputRef?: HTMLInputElement | Ref<HTMLInputElement | undefined>;
  /** 弹层是否禁用 */
  popperDisabled?: boolean | Ref<boolean>;
  /** 触发方式 */
  trigger?: PopperTrigger | Ref<PopperTrigger>;
  /** 鼠标移入延迟显示时间 */
  mouseEnterDelay?: number | Ref<number>;
  /** 鼠标移出延迟隐藏时间 */
  mouseLeaveDelay?: number | Ref<number>;
  /** 弹层位置 */
  placement?: Placement | Ref<Placement>;
  /** 弹层偏移量 */
  popperOffset?: PopperOffset | Ref<PopperOffset>;
  /** 是否显示箭头，默认：false */
  arrow?: boolean | PopperArrowOptions | Ref<boolean | PopperArrowOptions>;
  /** 强制 outSideClick 关闭，默认：false */
  forceOutSideClickHide?: boolean | Ref<boolean>;
  /** outSideClick 关闭时是否延迟，默认：false */
  outSideClickDelayHide?: boolean | Ref<boolean>;
  /** 弹层宽度跟随触发节点，默认：false */
  followReferenceWidth?: boolean | Ref<boolean>;
  /** 是否插入到 body 中，默认：true */
  appendToBody?: boolean;
  /** 渲染到某个元素中(Dom节点选择器) */
  mountEl?: string;
  /** 强制 zIndex，默认 null */
  forceZIndex?: number | null;
}

export interface PopperVisibleResult {
  /** 弹层显示状态 */
  popperVisible: Ref<boolean>;
  /** 显示弹层 */
  showPopper: () => void;
  /** 隐藏弹窗 */
  hidePopper: () => void;
  /** 切换弹层显示状态 */
  togglePopper: () => void;
  /** 延迟显示弹层 */
  delayShowPopper: (delay?: number) => void;
  /** 延迟隐藏弹层 */
  delayHidePopper: (delay?: number) => void;
}

export interface PopperElements {
  referenceElem: HTMLElement | undefined;
  popperElem: HTMLElement | undefined;
  inputElem: HTMLElement | undefined;
}

export interface OnPopperEventParams {
  /** 触发节点是否已隐藏 */
  isReferenceHidden: boolean;
}

export interface PopperOptions
  extends Required<Omit<UsePopperOptions, 'popperVisible'>>,
    PopperVisibleResult {
  /** 获取相关 dom 节点 */
  getElement: () => PopperElements;
  /** 处理弹层事件 */
  onPopperEvent: (params: OnPopperEventParams) => void;
}
