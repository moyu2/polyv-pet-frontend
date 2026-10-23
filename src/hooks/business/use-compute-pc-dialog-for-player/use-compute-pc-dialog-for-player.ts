import {
  PC_MAIN_PLAYER_SELECTOR,
  PC_PLAYER_FULL_SCREEN_SELECTOR,
} from '@/assets/constants/selector';
import { computed, nextTick, ref, watch } from 'vue';
import { useLayoutStore } from '@/store/use-layout-store';
import { DialogInstance } from '@/components/common-base/dialog/pc-dialog';

/**
 * 用于处理挂载到 PC 端播放器区域的弹窗
 */
export const useComputePcDialogForPlayer = () => {
  const dialogRef = ref<DialogInstance>();

  const layoutStore = useLayoutStore();

  /** 弹层渲染节点 */
  const dialogMountEl = computed(() => {
    return layoutStore.isFullscreen ? PC_PLAYER_FULL_SCREEN_SELECTOR : '';
  });

  /** 弹层位置计算节点，只有需要在播放器区域展示的才需要 */
  const positionComputedElem = computed(() => {
    return layoutStore.isFullscreen ? PC_PLAYER_FULL_SCREEN_SELECTOR : PC_MAIN_PLAYER_SELECTOR;
  });

  watch(
    () => layoutStore.isFullscreen,
    () => {
      nextTick(() => {
        if (dialogRef.value) {
          dialogRef.value.setMountEl();
          dialogRef.value.handleDocumentEventToReset();
        }
      });
    },
  );

  return {
    dialogRef,
    dialogMountEl,
    positionComputedElem,
  };
};
