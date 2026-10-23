import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { computed } from 'vue';

export const useSeatTable = () => {
  const { getEmitter, getWatchCore } = useGlobalInject();

  const interactReceiveStore = useInteractReceiveStore();

  const watchCore = getWatchCore();
  const seatTableSdk = watchCore.interactReceive.getSeatTable();

  /** 座位文案 */
  const seatText = computed(() => {
    const seatPosition = interactReceiveStore.seatPosition;
    if (seatPosition) {
      return translate('seatTable.seatText', {
        row: seatPosition.row.toString(),
        column: seatPosition.column.toString(),
      });
    }
    return null;
  });

  /**
   * 设置云席 SDK
   */
  async function setupSeatTable() {
    await watchCore.interactReceive.setupSeatTable();
    interactReceiveStore.$patch({
      seatTableSdkInited: true,
    });
  }

  /**
   * 处理显示用户信息
   */
  function onShowUserCard(info: unknown) {
    getEmitter().emit(appEvents.interaction.OpenSeatTableUserCard, info);
  }

  function RefreshSeatTableFollowList() {
    getEmitter().emit(appEvents.interaction.RefreshSeatTableFollowList);
  }

  return {
    seatTableSdk,
    seatText,
    setupSeatTable,
    onShowUserCard,
    RefreshSeatTableFollowList,
  };
};
