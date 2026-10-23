<template>
  <div
    v-if="answerCardTargetInited && questionnaireTargetInited"
    class="c-quick-answer-card"
    :class="{
      'is-portrait': isPortraitWatchLayout,
      'is-normal': isMobile && !isPortraitWatchLayout,
      'is-page-fullscreen': isIarFullScreen,
    }"
  >
    <iar-quick-answer-card
      class="g-pointer-events-initial"
      :answer-card-target="getAnswerCardTarget()"
      :questionnaire-target="getQuestionnaireTarget()"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useIarUILoader } from '../../_load-iar-ui-v2';
import { useQuestionnaireTarget } from '../../questionnaire-v2/hooks/use-questionnaire-v2';
import { useAnswerCardTarget } from '../hooks/use-answer-card';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';
import { isMobile } from '@/assets/utils/browser';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const { loadIarUI } = useIarUILoader('iar-answer-card-ui');

const IarQuickAnswerCard = defineAsyncComponent(() => loadIarUI('quick-answer-card'));

const { targetInited: answerCardTargetInited, getIarTarget: getAnswerCardTarget } =
  useAnswerCardTarget();

const { targetInited: questionnaireTargetInited, getIarTarget: getQuestionnaireTarget } =
  useQuestionnaireTarget();

const { isIarFullScreen } = storeDefinitionToRefs(useInteractReceiveStore);

const { isPortraitWatchLayout } = storeDefinitionToRefs(useLayoutStore);
</script>

<style lang="scss">
.c-quick-answer-card {
  position: relative;
  z-index: 401; // 根据具体的挂载位置调整，确保可以被点击
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 12px;
  pointer-events: none;

  &.is-portrait {
    position: absolute;
    top: 46px;
    left: 0;
  }

  &.is-normal {
    position: absolute;
    top: 36px;
    left: 0;
  }

  &.is-page-fullscreen {
    position: fixed;
    top: 0;
    top: 50%;
    left: 50%;
    z-index: 2002 !important;
    transform: rotate(90deg);
    transform-origin: top;
  }
}

@media screen and (orientation: landscape) {
  .c-quick-answer-card.is-normal {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 2002 !important;
    width: 100vh;
    margin: auto;
  }
}
</style>
