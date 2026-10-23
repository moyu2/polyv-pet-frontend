import { PropUtils, emitFunc } from '@polyv/vue-components';
import { ButtonNativeType, ButtonSize, ButtonType } from './types';

export const normalButtonProps = () => ({
  /** 按钮文本，默认：按钮 */
  text: PropUtils.string.def('按钮'),
  /** 原生类型，默认：button */
  nativeType: PropUtils.enum<ButtonNativeType>().def(ButtonNativeType.Button),
  /** 按钮类型，默认：ButtonType.Primary */
  type: PropUtils.enum<ButtonType>().def(ButtonType.Primary),
  /** 按钮尺寸，默认：ButtonSize.Default */
  size: PropUtils.enum<ButtonSize>().def(ButtonSize.Default),
  /** 按钮是否禁用，默认：false */
  disabled: PropUtils.bool.def(false),
  /** 是否块状级按钮，默认：false */
  block: PropUtils.bool.def(false),
  /** 按钮图标 */
  icon: PropUtils.icon(),
  /** 按钮图标 class */
  iconClass: PropUtils.string,
  /** 允许禁用状态触发点击事件，默认：false */
  allowDisabledClick: PropUtils.bool.def(false),
  /** 是否停止点击事件冒泡，默认：false */
  stopClickEvent: PropUtils.bool.def(false),
});

export const normalButtonEmits = () => ({
  /** 点击事件 */
  click: emitFunc<void>(),
});
