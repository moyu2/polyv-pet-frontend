<template>
  <div class="c-mobile-ask-v2">
    <div class="c-mobile-ask-v2__list">
      <ask-message-list />
    </div>
    <div class="c-mobile-ask-v2__input">
      <ask-message-input-control />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';

const PolyvChatUI = getChatUIV2Pkg();

const { AskMessageList, AskMessageInputControl } = PolyvChatUI;
</script>

<style lang="scss">
.c-mobile-ask-v2 {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.c-mobile-ask-v2__list {
  flex: 1;
  overflow: hidden;
}

.c-mobile-ask-v2__input {
  padding: 12px 12px 24px;
}
</style>
