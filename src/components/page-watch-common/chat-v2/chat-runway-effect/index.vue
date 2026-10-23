<template>
  <polyv-runway-effect :left="left" />
</template>

<script setup lang="ts">
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { PropUtils } from '@polyv/vue-components';

defineProps({
  left: PropUtils.number.def(12),
});

const PolyvChatUI = getChatUIV2Pkg();

const { RunwayEffect: PolyvRunwayEffect } = PolyvChatUI;
</script>
