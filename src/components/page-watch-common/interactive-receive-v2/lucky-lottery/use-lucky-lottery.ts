import { useGlobalInject } from '@/app/use-global-inject';
import { PolyvLuckyLottery } from '@polyv/live-watch-sdk';
import { useIarTarget } from '../_hooks/use-iar-target';

export const useLotteryTarget = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const { targetInited, getIarTarget } = useIarTarget<PolyvLuckyLottery.LuckyLottery>(() => {
    return watchCore.interactReceive.getLuckyLotteryV2();
  });

  return {
    targetInited,
    getIarTarget,
  };
};
