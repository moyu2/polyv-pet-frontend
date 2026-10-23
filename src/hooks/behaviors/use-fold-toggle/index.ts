import { Ref, ref } from 'vue';

export enum FoldToggleState {
  /** 收起 */
  Fold = 'fold',
  /** 展开 */
  UnFold = 'unfold',
}

/**
 * Dom 展开/收起 行为 hook
 * @hook
 */
export const useFoldToggleBehavior = (refDom: Ref<HTMLElement | undefined>, maxHeight: number) => {
  /** 是否显示触发器 */
  const foldTriggerVisible = ref(false);

  /** 当前触发器状态 */
  const foldTriggerState = ref(FoldToggleState.Fold);

  function setFoldCondition() {
    if (!refDom.value) {
      console.warn('[useFoldToggleBehavior] setFoldCondition not find el');
      return;
    }

    refDom.value.style.setProperty('max-height', `${maxHeight}px`);
    if (refDom.value.scrollHeight > maxHeight) {
      foldTriggerVisible.value = true;
      foldTriggerState.value = FoldToggleState.Fold;
    }
  }

  /** 切换触发器状态 */
  function toggleFoldTriggerState() {
    if (!refDom.value) {
      console.warn('[useFoldToggleBehavior] setFoldCondition not find el');
      return;
    }

    if (!foldTriggerVisible.value) {
      console.warn('[useFoldToggleBehavior] foldTriggerVisible is false');
      return;
    }

    if (foldTriggerState.value === FoldToggleState.Fold) {
      // 从收起到展开
      foldTriggerState.value = FoldToggleState.UnFold;
      refDom.value.style.setProperty('max-height', `${refDom.value.scrollHeight}px`);
    } else {
      // 从展开到收起
      foldTriggerState.value = FoldToggleState.Fold;
      refDom.value.style.setProperty('max-height', `${maxHeight}px`);
    }
  }

  return {
    foldTriggerVisible,
    foldTriggerState,

    setFoldCondition,
    toggleFoldTriggerState,
  };
};
