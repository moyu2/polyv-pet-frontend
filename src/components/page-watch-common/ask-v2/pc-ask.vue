<template>
  <div class="c-pc-ask-v2">
    <div class="c-pc-ask-v2__list">
      <ask-message-list />
    </div>
    <div class="c-pc-ask-v2__input">
      <ask-message-input-section />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';

const PolyvChatUI = getChatUIV2Pkg();

const { AskMessageList, AskMessageInputSection } = PolyvChatUI;
</script>

<style lang="scss">
.c-pc-ask-v2 {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.c-pc-ask-v2__list {
  flex: 1;
  overflow: hidden;
}

.c-pc-ask-v2__input {
  padding: 6px;
}
</style>
