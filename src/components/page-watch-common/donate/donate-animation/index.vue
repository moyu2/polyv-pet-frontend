<template>
  <polyv-donate-animation />
</template>

<script setup lang="ts">
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';

const PolyvChatUI = getChatUIV2Pkg();

const { DonateAnimation: PolyvDonateAnimation } = PolyvChatUI;
</script>
