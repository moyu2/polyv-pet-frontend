<template>
  <div class="c-toping-msg">
    <toping-msg-list />
  </div>
</template>

<script setup lang="ts">
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';

const PolyvChatUI = getChatUIV2Pkg();

const { TopingMsgList } = PolyvChatUI;
</script>
