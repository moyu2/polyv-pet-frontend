/**
 * @file 和图片相关的工具函数
 */

/**
 * 获取图片地址的尺寸
 * @param url 图片地址
 * @returns 尺寸与图片实例
 */
export function getImgSize(
  url: string,
): Promise<{ width: number; height: number; imgTarget: HTMLImageElement }> {
  return new Promise<{ width: number; height: number; imgTarget: HTMLImageElement }>(
    (resolve, reject) => {
      const img = new Image();
      const resolvePromise = () => {
        resolve({
          width: img.width,
          height: img.height,
          imgTarget: img,
        });
      };
      img.onload = () => {
        resolvePromise();
      };
      img.onerror = (
        event: Event | string,
        source?: string,
        lineno?: number,
        colno?: number,
        error?: Error,
      ) => {
        const reason = error?.message || '未知原因';
        reject(new Error(`获取图片尺寸失败：${reason}`));
      };
      img.src = url;
      if (img.complete) {
        resolvePromise();
      }
    },
  );
}
