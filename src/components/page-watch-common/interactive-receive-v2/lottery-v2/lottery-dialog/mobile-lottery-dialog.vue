<!-- 抽奖弹层 -->
<template>
  <iar-lottery-dialog
    v-if="lotteryTargetInited && questionnaireTargetInited"
    ref="dialogRef"
    :lottery-target="getLotteryTarget()"
    :questionnaire-target="getQuestionnaireTarget()"
    :lottery-config="lotteryConfig"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useIarUILoader } from '../../_load-iar-ui-v2';
import { useLotteryTarget } from '../use-lottery-v2';
import { useLotteryDialog } from './use-lottery-dialog';
import { useQuestionnaireTarget } from '../../questionnaire-v2/hooks/use-questionnaire-v2';

const { loadIarUI } = useIarUILoader('iar-lottery-ui');

const IarLotteryDialog = defineAsyncComponent(() => loadIarUI('lottery-dialog'));

const {
  targetInited: lotteryTargetInited,
  getIarTarget: getLotteryTarget,
  lotteryConfig,
} = useLotteryTarget();

const { targetInited: questionnaireTargetInited, getIarTarget: getQuestionnaireTarget } =
  useQuestionnaireTarget();

const { dialogRef } = useLotteryDialog();
</script>
