import { PlvPopperManager } from '@/plugins/polyv-ui/admin-import';
import { Ref, unref, watch } from 'vue';
import { getRefElem } from '@polyv/vue-components';

/** 弹出层层叠数 z-index 的 hook */
const usePopperZIndex = () => {
  /** 设置弹出层元素到最顶层 */
  const setTopmostElem = (elemRef: RefOrElement<HTMLElement | undefined>) => {
    const elem = getRefElem(elemRef);
    if (elem instanceof HTMLElement) {
      PlvPopperManager.openPopper(elem);
    }
  };

  return {
    setTopmostElem,
  };
};

/**
 * 设置根据显隐状态自动将节点层叠数置顶
 * @param visibleRef 显隐响应式
 * @param elemRef 弹出层节点响应式
 */
export const useAutoTopmostToShow = (
  visibleRef: Ref<boolean>,
  elemRef: RefOrElement<HTMLElement | undefined>,
) => {
  const { setTopmostElem } = usePopperZIndex();

  watch(
    () => unref(visibleRef),
    () => {
      if (unref(visibleRef)) {
        setTopmostElem(elemRef);
      }
    },
  );
};
