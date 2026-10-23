<!-- 移动端提问消息输入框弹层 -->
<template>
  <ask-message-input-popup ref="popupRef" />
</template>

<script setup lang="ts">
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';

const PolyvChatUI = getChatUIV2Pkg();

const { AskMessageInputPopup } = PolyvChatUI;
</script>
