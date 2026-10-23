import { ImagePreviewOptions } from '@/plugins/polyv-ui/types';
import { PlvImagePreview } from '@/plugins/polyv-ui/admin-import';

/**
 * 浏览图片
 * @param images 图片地址
 * @param options 选项
 */
export const previewImage = (images: string | string[] = [], options: ImagePreviewOptions = {}) => {
  return PlvImagePreview(images, options);
};

/**
 * 点击图片进行预览
 * @param event 事件对象
 */
export function clickImgToPreview(event: Event) {
  const target = event.target;

  if (target instanceof HTMLImageElement) {
    previewImage(target.src);
  }
}
