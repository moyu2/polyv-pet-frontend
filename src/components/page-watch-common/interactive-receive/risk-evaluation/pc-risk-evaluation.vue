<!-- @file PC端-风险测评-主体弹窗 -->
<template>
  <pc-dialog
    class="c-pc-risk-evaluation-dialog"
    :visible="dialogVisible"
    title="风险测评"
    :width="400"
    :closable="dialogCloseable"
    @close="handleCloseDialog"
  >
    <div class="c-pc-risk-evaluation">
      <iar-pc-evaluation-questionnaire
        v-if="riskEvaluationEnabled"
        ref="evaluation-questionnaire"
        :questionnaire-sdk="questionnaireSdk"
        :questionnaire-type="'evaluation'"
        :delay-time="0"
        :is-force-start="isForceStart"
        @to-hide="onQuestionnaireHide"
        @evaluation-result="onQuestionnaireEvaluationResult"
      />
    </div>
  </pc-dialog>
</template>

<script lang="ts" setup>
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';

import { useFinanceStore } from '@/store/use-finance-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { useRiskEvaluationMainHook } from './_hooks/use-risk-evaluation-main';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';

const IarPcEvaluationQuestionnaire = getIarComponent('PcEvaluationQuestionnaire');

const { riskEvaluationEnabled } = storeDefinitionToRefs(useFinanceStore);

const {
  questionnaireSdk,

  dialogVisible,
  dialogCloseable,
  isForceStart,

  handleCloseDialog,
  onQuestionnaireEvaluationResult,
  onQuestionnaireHide,
} = useRiskEvaluationMainHook();
</script>

<style lang="scss">
.c-pc-risk-evaluation-dialog {
  .c-pc-dialog__content {
    z-index: $--zIndex-top;
  }
}
.c-pc-risk-evaluation {
  width: 100%;
  height: 100%;
}
</style>
