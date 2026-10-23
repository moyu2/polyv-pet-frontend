<!-- 移动端聊天消息输入框弹层 -->
<template>
  <chat-message-input-popup
    ref="popupRef"
    show-ask-entry
  />
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { ComponentInstance } from '@polyv/vue-components';
import { ref } from 'vue';

const PolyvChatUI = getChatUIV2Pkg();

const { ChatMessageInputPopup } = PolyvChatUI;

const popupRef = ref<ComponentInstance<typeof ChatMessageInputPopup>>();

useEventBusListener(appEvents.chat.ShowMobileFixedChatInput, () => {
  popupRef.value?.showInputPopup();
});
</script>
