<template>
  <iar-answer-card-dialog
    v-if="answerCardTargetInited && questionnaireTargetInited"
    ref="answerCardDialogRef"
    :answer-card-target="getAnswerCardTarget()"
    :questionnaire-target="getQuestionnaireTarget()"
  />
</template>

<script setup lang="ts">
import type { AnswerCardDialogInstance } from '@polyv/iar-answer-card-ui';
import { defineAsyncComponent, ref } from 'vue';
import { useIarUILoader } from '../../_load-iar-ui-v2';
import { useAnswerCardTarget } from '../hooks/use-answer-card';
import { useQuestionnaireTarget } from '../../questionnaire-v2/hooks/use-questionnaire-v2';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useAnswerCardEntrance } from '../hooks/use-answer-card-entrance';

const { loadIarUI } = useIarUILoader('iar-answer-card-ui');

const IarAnswerCardDialog = defineAsyncComponent(() => loadIarUI('answer-card-dialog'));

const { setAnswerCardEntrance, removeAnswerCardEntrance } = useAnswerCardEntrance();

const { targetInited: answerCardTargetInited, getIarTarget: getAnswerCardTarget } =
  useAnswerCardTarget(answerCardTarget => {
    const AnswerCardEvent = answerCardTarget.AnswerCardEvent;
    checkAnswerCardEntrance();

    answerCardTarget.eventEmitter.on(AnswerCardEvent.StartAnswerCard, checkAnswerCardEntrance);
    answerCardTarget.eventEmitter.on(AnswerCardEvent.StopAnswerCard, checkAnswerCardEntrance);
    answerCardTarget.eventEmitter.on(AnswerCardEvent.SubmitAnswerCard, checkAnswerCardEntrance);
  });

function checkAnswerCardEntrance() {
  const answerCardTarget = getAnswerCardTarget();
  const currentAnswerCard = answerCardTarget.getCurrentAnswerCard();
  console.log('currentAnswerCard', currentAnswerCard);
  if (currentAnswerCard) {
    setAnswerCardEntrance();
  } else {
    removeAnswerCardEntrance();
  }
}

const { targetInited: questionnaireTargetInited, getIarTarget: getQuestionnaireTarget } =
  useQuestionnaireTarget();

const answerCardDialogRef = ref<AnswerCardDialogInstance>();

useEventBusListener(appEvents.interaction.OpenAnswerCard, () => {
  answerCardDialogRef.value?.openAnswerCard();
});
</script>
