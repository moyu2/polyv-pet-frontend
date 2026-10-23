import { ref, unref, watch } from 'vue';
import { ClickOutsideTargets, useClickOutside } from '../use-click-outside';

/**
 * @hook 面板显隐
 * @description 在点击面板外部时自动关闭
 */
export const usePanelVisible = (target: ClickOutsideTargets) => {
  /** 显示状态 */
  const visible = ref(false);

  /** 显示面板 */
  function showPanel() {
    visible.value = true;
  }

  /** 隐藏面板 */
  function hidePanel() {
    visible.value = false;
  }

  /** 切换面板显示 */
  function togglePanel() {
    if (visible.value) {
      hidePanel();
    } else {
      showPanel();
    }
  }

  /** 处理点击外层 */
  function onClickOutside() {
    hidePanel();
  }

  const { listenClickOutSide, removeListenClickOutSide } = useClickOutside(
    target,
    onClickOutside,
    false,
  );

  watch(
    () => unref(visible),
    () => {
      if (unref(visible)) {
        listenClickOutSide();
      } else {
        removeListenClickOutSide();
      }
    },
    {
      immediate: true,
    },
  );

  return {
    visible,
    showPanel,
    hidePanel,
    togglePanel,
  };
};
