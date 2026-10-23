<template>
  <iar-questionnaire-dialog
    v-if="targetInited"
    ref="questionnaireDialogRef"
    :questionnaire-target="getIarTarget()"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue';
import { useIarUILoader } from '../../_load-iar-ui-v2';
import { useQuestionnaireTarget } from '../hooks/use-questionnaire-v2';
import { appEvents, useEventBusListener } from '@/app/app-events';
import type { QuestionnaireDialogInstance } from '@polyv/iar-questionnaire-ui';
import { useQuestionnaireEntrance } from '../hooks/use-questionnaire-entrance';

const { loadIarUI } = useIarUILoader('iar-questionnaire-ui');

const IarQuestionnaireDialog = defineAsyncComponent(() => loadIarUI('questionnaire-dialog'));

const { setQuestionnaireEntrance, removeQuestionnaireEntrance } = useQuestionnaireEntrance();

const { targetInited, getIarTarget } = useQuestionnaireTarget(questionnaireTarget => {
  const QuestionnaireEvent = questionnaireTarget.QuestionnaireEvent;
  const questionnaireList = questionnaireTarget.getQuestionnaireList();
  onQuestionnaireList(questionnaireList.length);

  questionnaireTarget.eventEmitter.on(QuestionnaireEvent.QuestionnaireList, data => {
    onQuestionnaireList(data.questionnaireList.length);
  });
});

function onQuestionnaireList(len: number) {
  if (len > 0) {
    setQuestionnaireEntrance();
  } else {
    removeQuestionnaireEntrance();
  }
}

const questionnaireDialogRef = ref<QuestionnaireDialogInstance>();

useEventBusListener(appEvents.interaction.OpenQuestionnaire, (questionnaireId?: string) => {
  questionnaireDialogRef.value?.openQuestionnaire(questionnaireId);
});
</script>
