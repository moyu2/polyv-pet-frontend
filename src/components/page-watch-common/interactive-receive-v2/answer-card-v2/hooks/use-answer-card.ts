import { useGlobalInject } from '@/app/use-global-inject';
import { PolyvAnswerCard } from '@polyv/live-watch-sdk';
import { useIarTarget } from '../../_hooks/use-iar-target';

export const useAnswerCardTarget = (
  afterCreate?: (iarTarget: PolyvAnswerCard.AnswerCard) => unknown,
) => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const { targetInited, getIarTarget } = useIarTarget<PolyvAnswerCard.AnswerCard>(() => {
    return watchCore.interactReceive.getAnswerCardV2();
  }, afterCreate);

  return {
    targetInited,
    getIarTarget,
  };
};
