<template>
  <pwc-popup
    class="c-mobile-normal-questionnaire-popup"
    v-model="questionnaireVisible"
    fill-body
    :body-max-height="0.7"
    :show-header="false"
    :padding="false"
  >
    <div class="c-mobile-normal-questionnaire-popup__content">
      <iar-normal-questionnaire
        v-if="targetInited"
        :questionnaire-target="getIarTarget()"
        :questionnaire-data="currentQuestionnaire"
        @submit="onSubmitData"
      />
    </div>
  </pwc-popup>
</template>

<script setup lang="ts">
import { PwcPopup } from '@polyv/vue-components';
import { defineAsyncComponent } from 'vue';
import { useTaskActivityQuestionnaire } from './hooks/use-task-activity-questionnaire';
import { useIarUILoader } from '../interactive-receive-v2/_load-iar-ui-v2';
import { useQuestionnaireTarget } from '../interactive-receive-v2/questionnaire-v2/hooks/use-questionnaire-v2';

const { targetInited, getIarTarget } = useQuestionnaireTarget();

const { questionnaireVisible, currentQuestionnaire, onSubmitData } = useTaskActivityQuestionnaire();

const { loadIarUI } = useIarUILoader('iar-questionnaire-ui');

const IarNormalQuestionnaire = defineAsyncComponent(() => loadIarUI('normal-questionnaire'));
</script>

<style lang="scss">
.c-mobile-normal-questionnaire-popup__content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
