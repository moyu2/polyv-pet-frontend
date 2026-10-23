import { formatStyleSize } from '@/assets/utils/dom';
import { PropUtils, VueProps } from '@polyv/vue-components';
import { computed } from 'vue';
import { CSSProperties } from 'vue/types/jsx';

export const iframeRenderProps = () => ({
  /** 地址 */
  src: PropUtils.looseString,
  /** 高度，默认：600 */
  height: PropUtils.oneOfType<string | number>([String, Number]).def(600),
  /** 自动高度，为 true 时优先级高于传入的高度，默认 false */
  autoHeight: PropUtils.bool.def(false),
});

export const useIframeRender = (options: { props: VueProps<typeof iframeRenderProps> }) => {
  const { props } = options;

  const iframeSrc = computed(() => props.src);

  const wrapStyle = computed(() => {
    const styles: CSSProperties = {};

    if (!props.autoHeight && props.height) {
      styles.height = formatStyleSize(props.height);
    }

    return styles;
  });

  return {
    iframeSrc,
    wrapStyle,
  };
};
