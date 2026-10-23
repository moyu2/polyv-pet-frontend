<template>
  <file-share-list ref="fileShareListRef" />
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { ref } from 'vue';

const PolyvChatUI = getChatUIV2Pkg();

const { FileShareList } = PolyvChatUI;

const fileShareListRef = ref<{
  open: () => void;
  close: () => void;
}>();

useEventBusListener(appEvents.global.OpenFileManagement, () => {
  fileShareListRef.value?.open();
});
</script>
