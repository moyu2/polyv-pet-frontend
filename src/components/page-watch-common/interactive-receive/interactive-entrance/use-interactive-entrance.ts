/**
 * @file 互动功能二次入口 hook
 */
import { computed } from 'vue';
import {
  InteractiveEntranceData,
  useInteractReceiveStore,
} from '@/store/use-interact-receive-store';
import { isFunction } from '@/assets/utils/function';

/**
 * @hook 互动二次入口
 */
export const useInteractiveEntrance = () => {
  const interactReceiveStore = useInteractReceiveStore();

  /** 入口列表是否显示 */
  const entrancesVisible = computed<boolean>(() => {
    return interactReceiveStore.interactiveEntrance.length > 0;
  });

  /**
   * 打开互动功能
   * @param entranceData 入口数据
   */
  function openInteractive(entranceData: InteractiveEntranceData) {
    // 响应对应的 onClick 回调
    if (isFunction(entranceData.onClick)) {
      entranceData.onClick();
    }
  }

  return {
    entrancesVisible,
    openInteractive,
  };
};
