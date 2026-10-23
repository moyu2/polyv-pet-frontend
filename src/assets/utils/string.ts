/**
 * @file 跟字符串相关的工具方法
 */
/**
 * 将字符串中的&nbsp;转换为空格
 * 背景：新版观看在做英文自动折行时，如果后端返回的富文本字符串包含&nbsp;，依然会存在换行切割单词的问题，因此需要做这个转换
 * 影响：如果出现连续空格的情况，使用该方法转换后，只会存在一个空格；目前会在使用的地方增加white-space: pre-wrap处理
 * 目前应用范围：对后端返回的富文本字符串进行转换，包括直播介绍、报名观看的隐私政策
 * @param str 需要处理的字符串
 */
export function nbspToSpace(str: string): string {
  return String(str).replace(/&nbsp;/g, ' ');
}

export function isString(target: unknown): target is string {
  return typeof target === 'string';
}

/**
 * html字符串提取纯文本
 */
export function htmlStr2Text(htmlStr: string): string | null {
  if (!htmlStr) return '';
  const dom = document.createElement('div');
  dom.innerHTML = htmlStr;
  return dom.textContent;
}

export function replaceStrTemplate(strTemplate: string, data: Record<string, unknown>): string {
  return strTemplate.replace(/\{(.*?)\}/g, (_, key) => {
    const res = data[key] || '';
    return res as string;
  });
}
