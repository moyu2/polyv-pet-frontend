import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';
import { PolyvQuestionnaire } from '@polyv/live-watch-sdk';
import { ref } from 'vue';

export const useTaskActivityQuestionnaire = () => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const watchCore = getWatchCore();

  const currentTaskId = ref<number>();

  /** 当前显示的问卷数据 */
  const currentQuestionnaire = ref<PolyvQuestionnaire.QuestionnaireData>();

  const questionnaireVisible = ref(false);

  async function initQuestionnaire(questionnaireId: string) {
    currentQuestionnaire.value = await watchCore.taskActivity.getQuestionnaireDetail(
      questionnaireId,
    );
    questionnaireVisible.value = true;
  }

  async function onSubmitData(data: PolyvQuestionnaire.SubmitAnswerData[]) {
    if (!currentTaskId.value || !currentQuestionnaire.value) {
      return;
    }
    const result = await watchCore.taskActivity.submitQuestionnaire({
      taskId: currentTaskId.value,
      questionnaireId: currentQuestionnaire.value.questionnaireId,
      answer: data,
    });

    if (result.reachCondition) {
      toast.success(translate('taskActivity.questionnaireSuccess'));
    } else {
      toast.error(translate('taskActivity.questionnaireFail'));
    }

    questionnaireVisible.value = false;
  }

  useEventBusListener(
    appEvents.global.OpenTaskActivityQuestionnaire,
    (options: { questionnaireId: string; taskId: number }) => {
      currentTaskId.value = options.taskId;
      initQuestionnaire(options.questionnaireId);
    },
  );

  return {
    currentQuestionnaire,
    questionnaireVisible,
    onSubmitData,
  };
};
