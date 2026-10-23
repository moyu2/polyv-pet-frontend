<!-- @file 移动端-风险测评-主体弹窗 -->
<template>
  <mobile-dialog
    class="c-mobile-risk-evaluation-dialog"
    :visible="dialogVisible"
    :content-style="dialogContentStyle"
    :close-on-click-mask="false"
    :show-header="false"
    :show-footer="false"
    :closable="dialogCloseable"
    @close="handleCloseDialog"
  >
    <div class="c-mobile-risk-evaluation">
      <iar-mobile-evaluation-questionnaire
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
  </mobile-dialog>
</template>

<script lang="ts" setup>
import MobileDialog from '@/components/common-base/dialog/mobile-dialog/mobile-dialog.vue';
import { useFinanceStore } from '@/store/use-finance-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { useRiskEvaluationMainHook } from './_hooks/use-risk-evaluation-main';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';

const IarMobileEvaluationQuestionnaire = getIarComponent('MobileEvaluationQuestionnaire');

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

const dialogContentStyle = {
  maxHeight: '72%',
};
</script>

<style lang="scss">
.c-mobile-risk-evaluation-dialog {
  z-index: $--zIndex-top;
}
.c-mobile-risk-evaluation {
  width: 100%;
  height: 100%;
}
</style>
