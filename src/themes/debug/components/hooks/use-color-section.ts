/**
 * @file ColorSection 组件的 props 和 emits 定义
 * 遵循项目规范：使用 PropUtils 定义 props，使用 emitFunc 定义 emits
 */
import { PropUtils, emitFunc } from '@polyv/vue-components';
import type { DebugColorListItem } from '../../constants/debug-colors';

/** Props 定义 */
export function colorSectionProps() {
  return {
    /** 标签文本 */
    label: PropUtils.string.def(''),
    /** 当前选中的颜色值 */
    currentColor: PropUtils.string.def('#000000'),
    /** 颜色列表 */
    colorList: PropUtils.array<DebugColorListItem>().def([]),
  };
}

/** Emits 定义 */
export function colorSectionEmits() {
  return {
    /** 颜色变化事件 */
    'color-change': emitFunc<string>(),
  };
}
