/**
 * @file 日期时间相关的工具方法
 */

/**
 * 秒数转成时长字符串
 * @param duration 秒数，单位：秒
 */
export function formatDuration(duration: number): string {
  const seconds = Math.floor(duration % 60)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((duration / 60) % 60)
    .toString()
    .padStart(2, '0');
  const hours = Math.floor(duration / 3600)
    .toString()
    .padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}
