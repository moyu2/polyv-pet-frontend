<template>
  <div
    v-if="chatMsgListEnabled"
    class="c-chat-msg-list"
    :class="{
      'is-portrait-watch-layout': isPortraitWatchLayout,
    }"
  >
    <chat-message-list
      ref="listRef"
      :key="refreshKey"
    />
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { ComponentInstance, useEventBusListener } from '@polyv/vue-components';
import { onBeforeMount, ref, watch } from 'vue';
import { useChatReplay } from '../hooks/use-chat-replay';

// 回放生命周期只随消息列表管理，避免点赞/输入框等多个 Provider 重复初始化。
useChatReplay();

const { chatMsgListEnabled, onlySpecialMsg } = storeDefinitionToRefs(useChatStore);
const { isPortraitWatchLayout } = storeDefinitionToRefs(useLayoutStore);

const PolyvChatUI = getChatUIV2Pkg();

const { ChatMessageList, useSendChatMsg, useOnlySpecialStore } = PolyvChatUI;

const listRef = ref<ComponentInstance<typeof ChatMessageList>>();

// 只看主持人
watch(onlySpecialMsg, () => {
  listRef.value?.setIsOnlySpecialMsg(onlySpecialMsg.value);
});

// 监听发送图片事件
const { choiceImageFileSend } = useSendChatMsg();
useEventBusListener(appEvents.chat.ToSendImage, choiceImageFileSend);

const { setIsOnlySpecialMsg } = useOnlySpecialStore();

// 刷新列表组件
const refreshKey = ref(Date.now());
useEventBusListener(appEvents.chat.ResetUpChatMsgList, () => {
  refreshKey.value = Date.now();
});

onBeforeMount(() => {
  if (onlySpecialMsg.value) {
    setIsOnlySpecialMsg(true);
  }
});
</script>

<style lang="scss">
.c-chat-msg-list {
  width: 100%;
  height: 100%;
  overflow: hidden;

  &.is-portrait-watch-layout {
    .plv-chat-message-list__container {
      @include hidden-scrollbar;
    }
  }
}
</style>
