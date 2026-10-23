<template>
  <div
    v-show="mobileChatInputFixedVisible"
    ref="wrapRef"
    class="c-mobile-chat-input-controller-fixed"
  >
    <mobile-chat-input-controller
      ref="inputInstance"
      is-pureness
      is-alway-active
    />
  </div>
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import MobileChatInputController from '@/components/page-watch-common/chat/chat-input-controller/mobile-chat-input-controller/mobile-chat-input-controller.vue';
import { useAppendTo } from '@/hooks/behaviors/use-append-to';
import { useClickOutside } from '@/hooks/behaviors/use-click-outside';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { nextTick, ref } from 'vue';
import { ChatInputInstance } from '../hooks/use-chat-input-controller';

const wrapRef = ref<HTMLDivElement>();

const inputInstance = ref<ChatInputInstance>();

const { mobileChatInputFixedVisible } = storeDefinitionToRefs(useChatStore);

useAppendTo(wrapRef);

useEventBusListener(appEvents.chat.ShowMobileFixedChatInput, async () => {
  const chatStore = useChatStore();
  chatStore.$patch({
    mobileChatInputFixedVisible: true,
  });

  await nextTick();
  if (inputInstance.value) {
    inputInstance.value.focusMsgInput();
  }
});

useClickOutside(wrapRef, () => {
  const chatStore = useChatStore();
  chatStore.$patch({
    mobileChatInputFixedVisible: false,
  });
});
</script>

<style lang="scss">
.c-mobile-chat-input-controller-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 100;
  width: 100%;
}
</style>
