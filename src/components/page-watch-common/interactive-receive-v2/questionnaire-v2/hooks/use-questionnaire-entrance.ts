import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import {
  InteractiveEntranceData,
  useInteractReceiveStore,
} from '@/store/use-interact-receive-store';
import { usePlaybackStore } from '@/store/use-playback-store';

/**
 * @hook 问卷入口
 */
export const useQuestionnaireEntrance = () => {
  const { getEmitter } = useGlobalInject();

  const playbackStore = usePlaybackStore();

  const interactReceiveStore = useInteractReceiveStore();

  /** 问卷入口数据 */
  const questionnaireEntranceData: InteractiveEntranceData = {
    type: 'questionnaire',
    name: 'interact.questionnaire.title',
    icon: require('./imgs/icon-questionnaire.png'),
    icon2: require('./imgs/icon-questionnaire_p.png'),
    onClick: () => getEmitter().emit(appEvents.interaction.OpenQuestionnaire),
  };

  /** 设置问卷二次入口 */
  const setQuestionnaireEntrance = () => {
    // 问卷重放的情况下，不显示二次入口
    if (playbackStore.questionnaireReplayEnabled) return;

    interactReceiveStore.setInteractiveEntrance(questionnaireEntranceData);
  };

  /** 移除问卷二次入口 */
  const removeQuestionnaireEntrance = () => {
    interactReceiveStore.removeInteractiveEntrance(questionnaireEntranceData.type);
  };

  return {
    questionnaireEntranceData,
    setQuestionnaireEntrance,
    removeQuestionnaireEntrance,
  };
};
