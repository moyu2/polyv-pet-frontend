import { CSSProperties } from 'vue/types/jsx';
import { PropUtils } from '@polyv/vue-components';

export const loadingOverlayProps = () => {
  return {
    visible: PropUtils.bool.def(false),
    /** 覆盖层样式（用于指定覆盖区域，例如播放器容器的 top/left/width/height） */
    overlayStyle: PropUtils.object<CSSProperties>().def({}),
    zIndex: PropUtils.number.def(9),
    background: PropUtils.string.def('rgba(255, 255, 255, 0.03)'),
    spinnerSize: PropUtils.number.def(40),
    /** 是否显示 loading 文案 */
    showText: PropUtils.bool.def(true),
    /** loading 文案（为空则使用默认文案） */
    text: PropUtils.string.def(''),
  };
};
