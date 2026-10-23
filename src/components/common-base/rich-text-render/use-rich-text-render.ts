import { PropUtils, VueProps } from '@polyv/vue-components';
import { useResizeOssImage } from '@/hooks/business/use-resize-oss-image';
import { computed } from 'vue';

/**
 * <rich-text-render> props 配置
 */
export const richTextRenderProps = () => ({
  /** html 富文本内容 */
  htmlContent: PropUtils.string.def(''),
  /** 是否跟随页面多皮肤，默认 true */
  followPageSkin: PropUtils.bool.def(true),
  /** 是否压缩内容图片 */
  shouldCompressImgs: PropUtils.bool.def(true),
});

export const useRichTextRender = (options: { props: VueProps<typeof richTextRenderProps> }) => {
  const { props } = options;

  const { resizeHtmlContentImg } = useResizeOssImage();

  /** 用于渲染的富文本内容 */
  const renderHtmlContent = computed<string>(() => {
    return props.shouldCompressImgs ? resizeHtmlContentImg(props.htmlContent) : props.htmlContent;
  });

  return {
    renderHtmlContent,
  };
};
