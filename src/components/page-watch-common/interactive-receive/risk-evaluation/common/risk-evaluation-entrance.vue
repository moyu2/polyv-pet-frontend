<!-- @file 公共-风险测评-挂件入口 -->
<!-- eslint-disable vue/v-on-event-hyphenation -->
<template>
  <div class="c-risk-evaluation-entrance">
    <!-- 风险测评挂件组件 -->
    <iar-evaluation-pendant
      ref="evaluationPendantRef"
      :questionnaire-sdk="questionnaireSdk"
      :icon-url="iconUrl"
      :count-down-time="countDownTime"
      @openEvaluation="openEvaluation"
      @openEvaluationForce="openEvaluationForce"
    />
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeMount, ref, watch } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useFinanceStore } from '@/store/use-finance-store';

import { RiskEvaluationMainDialogOpenMode } from '../types/risk-evaluation-types';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { useGlobalInject } from '@/app/use-global-inject';

const IarEvaluationPendant = getIarComponent('EvaluationPendant');

const { toPlay, toPause } = usePlayerAction();

const { getEmitter, getWatchCore } = useGlobalInject();

const watchCore = getWatchCore();
const questionnaireSdk = watchCore.interactReceive.getQuestionnaire();
const { riskEvaluation } = storeDefinitionToRefs(useFinanceStore);

const evaluationPendantRef = ref();
/** 挂件倒计时 */
const countDownTime = ref(0);
const iconUrl = require('./risk-evaluation-icon.svg');

// 只会在后置条件测评时机触发
watch(
  () => riskEvaluation.value.evaluationLimitType,
  () => {
    countDownTime.value = watchCore.financeRiskEvaluation.getPendantCountDownTime(
      riskEvaluation.value,
    );
    if (countDownTime.value === 0) {
      clearTimeoutCache();
    }
  },
);

watch(
  () => riskEvaluation.value.passEvaluation,
  () => {
    if (watchCore.financeRiskEvaluation.judgeIsPassRiskEvaluation(riskEvaluation.value)) {
      countDownTime.value = 0;
      clearTimeoutCache();
      // 恢复播放
      toPlay();
    }
  },
);

function clearTimeoutCache() {
  nextTick(() => {
    evaluationPendantRef.value && evaluationPendantRef.value.removeLeftTime();
  });
}

function openEvaluation() {
  getEmitter().emit(appEvents.finance.RiskEvaluationMainDialogShow, {
    openMode: RiskEvaluationMainDialogOpenMode.ManualOpen,
  });
}

/** 倒计时强制观看 */
function openEvaluationForce() {
  // 如果已通过测评，不需要强制弹窗
  if (watchCore.financeRiskEvaluation.judgeIsPassRiskEvaluation(riskEvaluation.value)) {
    return;
  }

  // 需要暂停播放
  toPause();

  getEmitter().emit(appEvents.finance.RiskEvaluationMainDialogShow, {
    openMode: RiskEvaluationMainDialogOpenMode.TimeoutAutoOpen,
  });
}

onBeforeMount(() => {
  countDownTime.value = watchCore.financeRiskEvaluation.getPendantCountDownTime(
    riskEvaluation.value,
  );
});

// 清除倒计时缓存
useEventBusListener(appEvents.finance.RiskEvaluationPendantTimeoutCacheClear, () => {
  clearTimeoutCache();
});
</script>
