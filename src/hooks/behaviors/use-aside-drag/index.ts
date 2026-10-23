import { getRefElem } from '@polyv/vue-components';
import { onBeforeUnmount, onMounted, Ref, ref } from 'vue';

export interface UseAsideDragOption {
  /** 目标元素节点 */
  targetRef: Ref | HTMLElement;
  /** 获取初始定位 */
  getInitTop?: () => number;
}

/**
 * @hook 侧边拖拽
 */
export const useAsideDrag = (options: UseAsideDragOption) => {
  const { getInitTop } = options;

  /** top 定位 */
  const top = ref(0);

  let prevPageY: number | undefined;

  /** 初始化定位 */
  function initTop() {
    if (getInitTop) {
      top.value = getInitTop();
    }
  }

  onMounted(() => {
    initTop();

    const targetElem = getRefElem(options.targetRef);
    if (!targetElem) {
      return;
    }
    targetElem.addEventListener('touchstart', () => {
      prevPageY = undefined;
      bindBodyEvent();
    });
  });

  function bindBodyEvent() {
    unbindBodyEvent();
    const body = document.body;
    body.addEventListener('touchmove', onBodyTouchMove);
    body.addEventListener('touchend', onBodyTouchEnd);
    body.addEventListener('touchcancel', onBodyTouchEnd);
  }

  function unbindBodyEvent() {
    const body = document.body;
    body.removeEventListener('touchmove', onBodyTouchMove);
  }

  /** 处理 body touchmove 事件 */
  function onBodyTouchMove(event: TouchEvent) {
    const pageY = event.touches[0].pageY;

    if (typeof prevPageY === 'undefined') {
      prevPageY = pageY;
      return;
    }

    const diffY = pageY - prevPageY;

    let newTop = top.value + diffY;
    if (newTop < 0) {
      newTop = 0;
    }

    const targetElem = getRefElem(options.targetRef);
    if (targetElem && newTop > document.body.clientHeight - targetElem.clientHeight) {
      newTop = document.body.clientHeight - targetElem.clientHeight;
    }

    top.value = newTop;
    prevPageY = pageY;
  }

  function onBodyTouchEnd() {
    prevPageY = undefined;
    unbindBodyEvent();
  }

  onBeforeUnmount(() => {
    unbindBodyEvent();
  });

  return {
    top,
  };
};
