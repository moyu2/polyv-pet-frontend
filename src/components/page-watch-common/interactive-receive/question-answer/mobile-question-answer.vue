<!-- @file 移动端互动问答 -->
<template>
  <div class="c-mobile-question-answer pws-next-iar-qa-answer-config">
    <iar-mobile-question-answer
      class="c-mobile-question-answer__main"
      :question-answer-sdk="questionAnswerSdk"
      :face-emotion-enabled="chatSetting.faceEmotionEnabled"
      :theme="theme"
      :has-nick="innerHasNickname"
      @set-nick="onSetNick"
      @preview="onPreviewImage"
      @news="onNewsEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { TAB_NAME_QA } from '@/assets/constants/tab-name';
import { PropUtils } from '@polyv/vue-components';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { unref } from 'vue';
import { useQuestionAnswer } from './hooks/use-question-answer';

const IarMobileQuestionAnswer = getIarComponent('MobileQuestionAnswer');

defineProps({
  /** 问答主题，黑or白 */
  theme: PropUtils.oneOf(['black', 'white'] as const).def('black'),
});

const { questionAnswerSdk, onSetNick, onPreviewImage, innerHasNickname } = useQuestionAnswer();

const { mobileMenuCurrentName } = storeDefinitionToRefs(useLayoutStore);

const { chatSetting } = storeDefinitionToRefs(useChatStore);

const interactReceiveStore = useInteractReceiveStore();

function onNewsEvent() {
  if (unref(mobileMenuCurrentName) === TAB_NAME_QA) return;

  interactReceiveStore.$patch({
    qaReminderVisible: true,
  });
}
</script>

<style lang="scss">
.c-mobile-question-answer {
  position: relative;
  height: 100%;
  .plv-ia-qa,
  .plv-ia-qa-ask {
    background: none !important;
  }
}
.c-mobile-question-answer__main {
  height: 100%;
}
</style>
