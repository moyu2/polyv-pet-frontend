<!-- @file PC 端互动问答 -->
<template>
  <div class="c-pc-question-answer pws-next-iar-qa-answer-config">
    <iar-pc-question-answer
      class="c-pc-question-answer__main"
      :question-answer-sdk="questionAnswerSdk"
      :face-emotion-enabled="chatSetting.faceEmotionEnabled"
      :has-nick="hasNickname"
      @preview="onPreviewImage"
      @news="onNewsEvent"
    />

    <div
      v-if="!hasNickname || needInterruptUserClick"
      class="c-pc-question-answer__set-nick"
    >
      <pc-set-nick-placeholder />
    </div>
  </div>
</template>

<script setup lang="ts">
import { TAB_NAME_QA } from '@/assets/constants/tab-name';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import PcSetNickPlaceholder from '@/components/page-watch-common/msg-input-wrap/pc-msg-input-wrap/pc-set-nick-placeholder.vue';
import { unref } from 'vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useQuestionAnswer } from './hooks/use-question-answer';
import { useChatStore } from '@/store/use-chat-store';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';

const IarPcQuestionAnswer = getIarComponent('PcQuestionAnswer');

const { questionAnswerSdk, onPreviewImage } = useQuestionAnswer();

const { hasNickname } = storeDefinitionToRefs(useViewerStore);

const { needInterruptUserClick } = useInterruptUserClick();

const { pcAsideTabCurrentName } = storeDefinitionToRefs(useLayoutStore);

const { chatSetting } = storeDefinitionToRefs(useChatStore);

const interactReceiveStore = useInteractReceiveStore();

function onNewsEvent() {
  if (unref(pcAsideTabCurrentName) === TAB_NAME_QA) return;

  interactReceiveStore.$patch({
    qaReminderVisible: true,
  });
}
</script>

<style lang="scss">
.c-pc-question-answer {
  position: relative;
  height: 100%;

  .plv-ia-qa,
  .plv-ia-qa-ask {
    background: none !important;
  }

  // .plv-ia-qa-ask__main {
  //   @include pc-watch-card-radius-bottom;
  // }
}

.c-pc-question-answer__main {
  height: 100%;

  .plv-ia-qa-list {
    @include scrollbar;
  }
}

.c-pc-question-answer__set-nick {
  position: absolute;
  right: 10px;
  bottom: 10px;
  left: 10px;
  height: 70px;
}
</style>
