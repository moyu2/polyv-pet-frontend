import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { type LotteryRecordInstance } from '@polyv/iar-lottery-ui';
import { type PolyvLottery } from '@polyv/live-watch-sdk';
import { ref } from 'vue';
import { useLotteryRecordEntrance } from './use-lottery-record-entrance';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';

export const useLotteryRecordList = () => {
  const { getEmitter } = useGlobalInject();

  const interactRecordStore = useInteractReceiveStore();

  const { setLotteryRecordEntrance, removeLotteryRecordEntrance } = useLotteryRecordEntrance();

  const { toInterruptUserClick } = useInterruptUserClick();

  const recordRef = ref<LotteryRecordInstance>();

  useEventBusListener(appEvents.iar.RefreshLotteryRecordList, () => {
    recordRef.value?.refreshRecord();
  });

  function onRecordList(list: PolyvLottery.LotteryRecordData[]) {
    interactRecordStore.$patch({
      lotteryWinRecords: list,
    });

    if (list.length) {
      setLotteryRecordEntrance();
    } else {
      removeLotteryRecordEntrance();
    }
  }

  function onShow() {
    // 需要先拦截用户操作
    const res = toInterruptUserClick({
      triggerSource: 'show-lottery-list',
      ignoreSetNick: true,
    });
    if (res) {
      return false;
    }

    getEmitter().emit(appEvents.global.OpenPersonalRewardDialog, 'lottery');
  }

  function onClose() {
    getEmitter().emit(appEvents.global.ClosePersonalRewardDialog);
  }

  return {
    recordRef,
    onRecordList,
    onShow,
    onClose,
  };
};
