/**
 * @file 和文件相关的工具方法
 */
import { changeProtocol } from '@polyv/utils/net';
import { isIframe, isMobile, isWeixin } from './browser';

/**
 * 获取文件后缀名
 * @param fileName 文件名
 */
export function getFileSuffix(fileName: string): string {
  const result = fileName.match(/[^.]+$/);
  if (!result) return '';
  return result[0].toLocaleLowerCase();
}

/**
 * 格式化文件大小
 * @param bytes 文件大小（字节）
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // 防止索引越界
  const sizeIndex = Math.min(i, sizes.length - 1);
  return parseFloat((bytes / Math.pow(k, sizeIndex)).toFixed(2)) + ' ' + sizes[sizeIndex];
}

/**
 * 根据文件扩展名推断文件类型
 * @param extension 文件扩展名
 * @returns 文件类型
 */
export function getFileTypeFromExtension(
  extension: string,
): 'pdf' | 'word' | 'ppt' | 'excel' | 'image' | 'other' {
  const ext = extension.toLowerCase();
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'word';
  if (['ppt', 'pptx'].includes(ext)) return 'ppt';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) return 'image';
  return 'other';
}

/**
 * 下载文件
 * @param fileUrl 文件地址
 * @param fileName 文件名
 */
export function downloadFile(fileUrl: string, fileName: string) {
  const path = changeProtocol(fileUrl, 'https');
  const a = document.createElement('a');
  a.setAttribute('target', '_blank');

  // 在 iframe 下上报事件到父窗口中进行下载
  if (isIframe) {
    const record = { name: 'file', path };
    window.parent.postMessage(record, '*');
    return;
  }

  // 移动端与微信
  if (isWeixin || isMobile) {
    a.href = path;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  const xhr = new window.XMLHttpRequest();
  xhr.open('GET', path, true);
  xhr.responseType = 'blob';
  xhr.onload = () => {
    const blobUrl = window.URL.createObjectURL(xhr.response);
    a.href = blobUrl;
    a.download = fileName;
    a.click();
    a.remove();
  };
  xhr.send();
}
