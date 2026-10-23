import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import {
  InteractiveEntranceData,
  useInteractReceiveStore,
} from '@/store/use-interact-receive-store';

/**
 * @hook 互动-抽奖-中奖记录入口
 */
export const useLotteryRecordEntrance = () => {
  const { getEmitter } = useGlobalInject();

  const interactReceiveStore = useInteractReceiveStore();

  /** 中奖记录入口数据 */
  const lotteryRecordEntranceData: InteractiveEntranceData = {
    type: 'lottery-record',
    name: 'interact.lottery.record',
    icon: require('../images/icon-lottery-record.png'),
    icon2: require('../images/icon-lottery-record_p.png'),
    onClick: () => getEmitter().emit(appEvents.iar.OpenLotteryRecordDialog, true),
  };

  /** 设置中奖记录二次入口 */
  const setLotteryRecordEntrance = () => {
    interactReceiveStore.setInteractiveEntrance(lotteryRecordEntranceData);
  };

  /** 移除中奖记录二次入口 */
  const removeLotteryRecordEntrance = () => {
    interactReceiveStore.removeInteractiveEntrance(lotteryRecordEntranceData.type);
  };

  return {
    lotteryRecordEntranceData,
    setLotteryRecordEntrance,
    removeLotteryRecordEntrance,
  };
};
