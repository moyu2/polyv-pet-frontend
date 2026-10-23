import { useGlobalInject } from '@/app/use-global-inject';
import { PolyvQuestionnaire } from '@polyv/live-watch-sdk';
import { useIarTarget } from '../../_hooks/use-iar-target';

export const useQuestionnaireTarget = (
  afterCreate?: (iarTarget: PolyvQuestionnaire.Questionnaire) => unknown,
) => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const { targetInited, getIarTarget } = useIarTarget<PolyvQuestionnaire.Questionnaire>(() => {
    return watchCore.interactReceive.getQuestionnaireV2();
  }, afterCreate);

  return {
    targetInited,
    getIarTarget,
  };
};
