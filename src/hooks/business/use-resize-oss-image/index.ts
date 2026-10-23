import { ossCompress } from '@polyv/utils/image';
import { appendUrl } from '@/assets/utils/url';

export function appendToOssProcess(url: string, additionalParams: string) {
  const ossProcessRegex = /(x-oss-process=)([^&]*)/;
  const match = url.match(ossProcessRegex);

  if (match) {
    const existingParams = match[2];
    const newParams = `${existingParams},${additionalParams}`;
    return url.replace(ossProcessRegex, `$1${newParams}`);
  } else {
    return appendUrl(url, {
      'x-oss-process': additionalParams,
    });
  }
}

export const useResizeOssImage = () => {
  /**
   * 重置 oss 的图片尺寸
   * @param url 图片地址
   * @param width 宽度
   * @param height 高度
   */
  function resizeOSSImg(url: string, width?: number, height?: number): string {
    if (!url) {
      return url;
    }

    if (!width && !height) {
      console.warn('需要指定图片的宽度或者高度才能进行调整');
      return url;
    }

    try {
      return ossCompress(url, {
        width,
        height,
      });
    } catch (error) {
      console.warn(error);
      return url;
    }
  }

  function resizeHtmlContentImg(htmlContent: string): string {
    if (!htmlContent) {
      return '';
    }
    return htmlContent.replace(
      /(<img.*?\ssrc=)(["']?)(.+?)\2(.*?>)/gi,
      (match, before, quot, src, after) => {
        return before + '"' + resizeOSSImg(src, 1680) + '"' + ' data-src="' + src + '"' + after;
      },
    );
  }

  return {
    resizeOSSImg,
    resizeHtmlContentImg,
  };
};
