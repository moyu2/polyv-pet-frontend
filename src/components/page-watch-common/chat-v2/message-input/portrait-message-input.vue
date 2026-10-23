<template>
  <div class="c-portrait-chat-message-input">
    <chat-message-input-control>
      <template
        v-if="askMenuData.visible"
        #body-suffix
      >
        <div
          class="c-portrait-chat-message-input__ask"
          @click="onClickAsk"
        >
          <portrait-ask-icon :font-size="20" />
        </div>
      </template>
    </chat-message-input-control>
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import PortraitAskIcon from '@/components/page-watch-common/ask/portrait-ask/portrait-ask-icon.vue';
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { PortraitChatTabName, usePortraitLayoutStore } from '@/store/use-portrait-layout-store';

const { askMenuData } = storeDefinitionToRefs(useChannelMenuStore);
const { portraitMessageTabCurrentName } = storeDefinitionToRefs(usePortraitLayoutStore);

const { getEmitter } = useGlobalInject();

const PolyvChatUI = getChatUIV2Pkg();

const { ChatMessageInputControl } = PolyvChatUI;

function onClickAsk(event: MouseEvent) {
  if (portraitMessageTabCurrentName.value === PortraitChatTabName.Ask) {
    event.stopPropagation();
    getEmitter().emit(appEvents.chat.FocusToPortraitAskInput);
  }
}
</script>

<style lang="scss">
.c-portrait-chat-message-input {
  flex: 1;
  max-width: 150px;
  overflow-x: hidden;
}
</style>
