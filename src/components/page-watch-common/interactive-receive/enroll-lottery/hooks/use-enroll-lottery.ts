import { ref } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';

/**
 * @hook 互动-抽奖-报名抽奖
 */
export const useEnrollLottery = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();
  /** 报名抽奖实例 */
  const enrollLotterySdk = watchCore.interactReceive.getEnrollLottery();

  const dialogVisible = ref(false);

  /** 更新弹层显示状态 */
  function updateDialogVisible(visible = true) {
    dialogVisible.value = !!visible;
  }

  useEventBusListener(appEvents.interaction.OpenEnrollLottery, updateDialogVisible);

  return {
    enrollLotterySdk,
    dialogVisible,
    updateDialogVisible,
  };
};
