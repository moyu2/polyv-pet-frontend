<!-- @file 移动端-竖屏提问 -->
<template>
  <div class="c-portrait-ask">
    <ask-comp-portrait
      v-if="askSdk"
      :slogan="askWelcomeText"
      :ask-sdk="askSdk"
      :lang="currentLang"
      :hide-actor-user-type="hideActorUserType"
      :hide-user-avatar="!chatSetting.portraitChatMessageAvatarDisplay"
    />
  </div>
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLangStore } from '@/store/use-lang-store';
import { useAskStore } from '@/store/use-ask-store';
import { PortraitChatTabName, usePortraitLayoutStore } from '@/store/use-portrait-layout-store';

import { useAskReminder, useAskSdk } from '../hooks/use-ask';
import { useHideChatMsgActorHook } from '../../chat/chat-msg-list/hooks/hide-chat-msg-hook';

import { useChatSDKAskQuestionUILoader } from '@/plugins/external-lib-loaders/load-chat-sdk-ui-ask-question';
import { useChatStore } from '@/store/use-chat-store';
import { watch } from 'vue';

const { asyncImportChatSDKAskQuestionComponent } = useChatSDKAskQuestionUILoader();

const AskCompPortrait = () => asyncImportChatSDKAskQuestionComponent();

const { askSdk } = useAskSdk();

const { askWelcomeText } = storeDefinitionToRefs(useAskStore);

const { hideActorUserType } = useHideChatMsgActorHook();

const { currentLang } = storeDefinitionToRefs(useLangStore);

const { chatSetting } = storeDefinitionToRefs(useChatStore);

const { portraitMessageTabCurrentName } = storeDefinitionToRefs(usePortraitLayoutStore);

const { updateAskReminderVisible } = useAskReminder({
  onAskMsg: () => {
    updateAskReminderVisible(portraitMessageTabCurrentName.value !== PortraitChatTabName.Ask);
  },
});

watch(
  () => portraitMessageTabCurrentName.value,
  () => {
    if (portraitMessageTabCurrentName.value === PortraitChatTabName.Ask) {
      updateAskReminderVisible(false);
    }
  },
);
</script>

<style lang="scss">
.c-portrait-ask {
  width: 100%;
  height: 100%;
  -webkit-mask-image: -webkit-gradient(
    linear,
    center top,
    center bottom,
    color-stop(0, transparent),
    color-stop(0.2, #000)
  );
  mask-image: none;

  // 覆盖内部样式
  .plv-chatroom-aq {
    background-color: transparent;
  }
  .plv-chatroom-aq__bottom {
    display: none;
  }
  .plv-chatroom-aq__new-message {
    left: 0;
  }
  .plv-chatroom-aq__list__main {
    padding: 0;
  }
}
</style>
