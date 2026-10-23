/**
 * @file SkinSection 组件的 props 和 emits 定义
 * 遵循项目规范：使用 PropUtils 定义 props，使用 emitFunc 定义 emits
 */
import { PropUtils, emitFunc } from '@polyv/vue-components';
import { ChannelWatchPageSkin } from '@polyv/live-watch-sdk';

/** Props 定义 */
export function skinSectionProps() {
  return {
    /** 当前选中的皮肤 */
    currentSkin: PropUtils.string.def(''),
  };
}

/** Emits 定义 */
export function skinSectionEmits() {
  return {
    /** 皮肤变化 */
    'skin-change': emitFunc<ChannelWatchPageSkin | 'custom'>(),
  };
}
