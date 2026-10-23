<template>
  <pwc-popup
    v-model="mobileAskPopupVisible"
    :title="askMenuData.label"
    background="#F7F8FA"
  >
    <div class="c-mobile-ask-popup__container">
      <div class="c-mobile-ask-popup__list">
        <ask-message-list />
      </div>
      <div class="c-mobile-ask-popup__input">
        <ask-message-input-control />
      </div>
    </div>
  </pwc-popup>
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useAskStore } from '@/store/use-ask-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { PwcPopup } from '@polyv/vue-components';

const PolyvChatUI = getChatUIV2Pkg();

const { mobileAskPopupVisible } = storeDefinitionToRefs(useAskStore);
const { askMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const { AskMessageList, AskMessageInputControl } = PolyvChatUI;

useEventBusListener(appEvents.ask.OpenAskFeature, () => {
  mobileAskPopupVisible.value = true;
});
</script>

<style lang="scss">
.c-mobile-ask-popup__container {
  display: flex;
  flex-direction: column;
  height: 50vh;
  overflow: hidden;
}

.c-mobile-ask-popup__list {
  flex: 1;
  margin-bottom: 12px;
  overflow: hidden;
}
</style>
