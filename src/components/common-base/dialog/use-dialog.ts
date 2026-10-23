import { PropUtils, emitFunc, updateModelEmit } from '@polyv/vue-components';

export const dialogCommonProps = () => ({
  /** 显示状态，默认：false，支持 .sync */
  visible: PropUtils.bool.def(false),
  /** 弹层标题 */
  title: PropUtils.string.def(''),
  /** 是否插入到 body 中，默认：true */
  appendToBody: PropUtils.bool.def(true),
  /** 是否显示关闭，默认：true */
  closable: PropUtils.bool.def(true),
});

export const dialogPcProps = () => ({
  ...dialogCommonProps(),
  /** 是否隐藏头部的边框，默认：false */
  hideHeaderBorder: PropUtils.bool.def(false),
  /** 是否显示蒙层挡板 ,默认：true */
  mask: PropUtils.bool.def(true),
  /** 打开窗口后是否禁用页面的滚动，不开启 mask 下默认不锁定 */
  bodyLocked: PropUtils.bool.def(false),
  /** 弹层宽度，默认 560  */
  width: PropUtils.number.def(560),
  /** 弹层高度，默认 0  */
  height: PropUtils.number.def(0),
  /** 圆角，默认 false */
  round: PropUtils.bool.def(false),
  /** 点击蒙层关闭弹窗，默认：false */
  closeOnClickMask: PropUtils.bool.def(false),
  /** 窗口是否可以拖拽，默认: false */
  draggable: PropUtils.bool.def(false),
  /** 用于计算定位的元素 */
  positionComputedElem: PropUtils.string.def(''),
  /** 渲染到某个元素中 */
  mountEl: PropUtils.string.def(''),
});

export const dialogMobileProps = () => ({
  ...dialogCommonProps(),
  /** 是否显示头部标题区，默认：true */
  showHeader: PropUtils.bool.def(true),
  /** 是否显示底部区，默认：true */
  showFooter: PropUtils.bool.def(true),
  /** 弹层主体样式 */
  contentStyle: PropUtils.object().def({}),
  /** 禁止body滚动，默认：true */
  bodyLocked: PropUtils.bool.def(true),
  /** 点击蒙层关闭弹窗，默认：true */
  closeOnClickMask: PropUtils.bool.def(true),
  /** 蒙层透明度，默认：0.6 */
  maskOpacity: PropUtils.number.def(0.6),
  /** 自定义关闭 */
  customClose: PropUtils.func(),
});

export const dialogEmits = () => ({
  ...updateModelEmit<'visible', boolean>('visible'),
  open: emitFunc<void>(),
  opened: emitFunc<void>(),
  close: emitFunc<void>(),
  closed: emitFunc<void>(),
});
