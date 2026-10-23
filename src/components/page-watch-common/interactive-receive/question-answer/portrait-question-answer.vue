<!-- @file 竖屏问答弹层 -->
<template>
  <pwc-popup
    class="c-portrait-question-answer-popup"
    v-model="visible"
    :ignore-skin-color="true"
    :title="qaMenuData.label"
    :body-style="{ padding: '16px 0 0 0' }"
    height="600px"
    body-max-height="80%"
  >
    <iar-mobile-question-answer
      theme="white"
      :face-emotion-enabled="chatSetting.faceEmotionEnabled"
      :question-answer-sdk="questionAnswerSdk"
      @preview="onPreviewImage"
    />
  </pwc-popup>
</template>

<script setup lang="ts">
import { PwcPopup } from '@polyv/vue-components';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useQuestionAnswer } from './hooks/use-question-answer';
import { useChatStore } from '@/store/use-chat-store';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';

const IarMobileQuestionAnswer = getIarComponent('MobileQuestionAnswer');

const { visible, setVisible } = useSimpleVisible();

const { qaMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const { chatSetting } = storeDefinitionToRefs(useChatStore);

const { questionAnswerSdk, onPreviewImage } = useQuestionAnswer();

const { needInterruptUserClick } = useInterruptUserClick();

useEventBusListener(appEvents.interaction.OpenQuestionAnswer, (_visible = true) => {
  if (_visible && needInterruptUserClick.value) {
    return;
  }
  setVisible(_visible);
});
</script>

<style lang="scss">
.c-portrait-question-answer-popup {
  .pwc-scrollbar__view,
  .pwc-popup__inner {
    height: 100%;
  }

  .pws-iar-mobile-no-more {
    padding-bottom: 24px;
  }
}
</style>
