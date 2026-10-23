/** 当前浏览器是否支持 filter 样式 */
export const supportsFilterStyle = 'filter' in document.body.style;

export function getElement(selector: string | HTMLElement): HTMLElement | null {
  if (selector instanceof HTMLElement) {
    return selector;
  }
  return document.querySelector(selector);
}

/**
 * 格式化样式数值
 * @param size 数值或数值字符串
 */
export function formatStyleSize(size?: string | number): string | undefined {
  if (typeof size === 'string') {
    return size;
  }

  if (typeof size === 'number') {
    return `${size}px`;
  }

  return size;
}

/**
 * 判断是否是否在 input 等可编辑的表单元素中
 */
export function isFocusActiveForm(): boolean {
  const activeElem = document.activeElement;
  if (!activeElem) {
    return false;
  }
  const tagName = activeElem.tagName.toLowerCase();

  // 可编辑的 div
  if (tagName === 'div' && activeElem.getAttribute('contenteditable')) {
    return true;
  }

  // 表单元素
  const tagNames = ['input', 'textarea'];
  return tagNames.includes(tagName);
}

/**
 * 判断是否已滚动接近底部
 * @param $el Dom节点
 */
export function isScrollNearBottom($el?: HTMLElement | null) {
  if (!$el) return false;

  return Math.ceil($el.scrollTop + $el.clientHeight) >= Math.floor($el.scrollHeight);
}
