import Vue, { onBeforeUnmount, onMounted, Ref } from 'vue';
import { getRefElem } from '@polyv/vue-components';
import { isFunction } from '@/assets/utils/function';
import { isMac } from '@/assets/utils/browser';

export type ClickOutsideTargetType = RefOrElement | string | Ref<Vue>;

export type ClickOutsideTargets = ClickOutsideTargetType | ClickOutsideTargetType[];

export type ClickOutsideTargetsFunction = () => ClickOutsideTargets;

/**
 * @hook 点击节点外部事件 hook
 * @param targets 响应式节点数组或获取方法
 * @param callback 回调方法
 * @param autoListen 自动监听，默认：true
 * @returns
 * ```
 * listenClickOutSide - 监听点击外部事件
 * removeListenClickOutSide - 移除点击外部监听事件
 * ```
 */
export const useClickOutside = (
  targets: ClickOutsideTargets | ClickOutsideTargetsFunction,
  callback: EmptyParamsFunc,
  autoListen = true,
) => {
  /** 获取用于比较的 dom 节点列表 */
  function getCompareElements(): HTMLElement[] {
    const targetElements: HTMLElement[] = [];

    const joinElem = (refTarget: ClickOutsideTargetType) => {
      // 传入的是 dom 选择器
      if (typeof refTarget === 'string') {
        const res = document.querySelectorAll(refTarget);
        res && res.forEach(e => targetElements.push(e as HTMLElement));
        return;
      }

      const elemVal = getRefElem(refTarget);
      // 已经是 dom 节点
      if (elemVal instanceof HTMLElement) {
        targetElements.push(elemVal);
      }
    };

    const res = isFunction<ClickOutsideTargetsFunction>(targets) ? targets() : targets;
    const elements = Array.isArray(res) ? res : [res];
    elements.forEach(joinElem);

    return targetElements;
  }

  /** 处理 document click 事件 */
  const handleDocumentClick = (event: MouseEvent) => {
    const clickTarget = event.target as HTMLElement;

    if (clickTarget) {
      let isInTarget = false;

      const compareElements = getCompareElements();

      compareElements.forEach(targetRef => {
        const target = getRefElem(targetRef);
        if (target instanceof HTMLElement && target.contains(clickTarget)) {
          isInTarget = true;
        }
      });

      if (!isInTarget) {
        callback();
      }
    }
  };
  let isListen = false;

  /** 监听点击外层 */
  const listenClickOutSide = () => {
    if (isListen) {
      return;
    }
    isListen = true;
    const evtName = isMac ? 'click' : 'mouseup';
    document.addEventListener(evtName, handleDocumentClick, {
      capture: true,
    });
  };

  /** 取消监听 */
  const removeListenClickOutSide = () => {
    const evtName = isMac ? 'click' : 'mouseup';
    document.removeEventListener(evtName, handleDocumentClick);
    isListen = false;
  };

  onMounted(() => {
    if (autoListen) {
      listenClickOutSide();
    }
  });

  onBeforeUnmount(() => {
    removeListenClickOutSide();
  });

  return {
    listenClickOutSide,
    removeListenClickOutSide,
  };
};
