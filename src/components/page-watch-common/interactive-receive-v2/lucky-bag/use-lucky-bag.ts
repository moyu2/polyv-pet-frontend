import { useGlobalInject } from '@/app/use-global-inject';
import { PolyvLuckyBag } from '@polyv/live-watch-sdk';
import { useIarTarget } from '../_hooks/use-iar-target';

export const useLuckyBagTarget = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const { targetInited, getIarTarget } = useIarTarget<PolyvLuckyBag.LuckyBag>(() => {
    return watchCore.interactReceive.getLuckyBagV2();
  });

  return {
    targetInited,
    getIarTarget,
  };
};
