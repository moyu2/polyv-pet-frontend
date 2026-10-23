import { getRefElem } from '@polyv/vue-components';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { usePageTheme } from '@/themes/use-page-theme';
import { $ } from '@polyv/utils/dom';
import { onBeforeUnmount, onMounted, Ref } from 'vue';

/**
 * @hook 处理将节点插入到某个容器中
 * @param elemRef 对应的节点
 * @param parentRef 父节点，默认：document.body
 */
export const useAppendTo = (elemRef: Ref | HTMLElement, parentRef?: Ref | HTMLElement) => {
  const { getAppBodyElement } = useMultiPolyvWatchApp();

  const { getThemeClassName } = usePageTheme();

  let _parentRef: Ref | HTMLElement = getAppBodyElement();
  if (parentRef) {
    _parentRef = parentRef;
  }

  onMounted(() => {
    const elem = getRefElem(elemRef);
    const parentElem = getRefElem(_parentRef);
    if (!elem || !parentElem) {
      console.warn('useAppendTo fail, elem is undefined');
      return;
    }

    const themeClassName = getThemeClassName();
    if (themeClassName) {
      $(elem).addClass(themeClassName);
    }

    parentElem.appendChild(elem);
  });

  onBeforeUnmount(() => {
    const elem = getRefElem(elemRef);
    if (elem && elem.parentNode) {
      elem.parentNode.removeChild(elem);
    }
  });
};
