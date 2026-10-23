<!-- @file 竖屏端聊天消息列表 -->
<template>
  <div class="c-portrait-chat-msg-list">
    <div
      ref="containerRef"
      class="c-portrait-chat-msg-list__container"
    ></div>

    <div
      v-if="moreMsgVisible"
      class="c-portrait-chat-msg-list__more-msg"
      @click="scrollToNew"
    >
      {{ $lang('chat.moreMsg2') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChatMsgReplayTips } from '@/components/page-watch-common/chat/chat-msg-replay-tips/use-chat-msg-replay-tips';
import { useToastManager } from '@/hooks/components/use-toast';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { watch } from 'vue';
import { ChatMsgItemComponentOptions } from './hooks/msg-render-hook';
import PortraitChatMsgItem from './msg-items/portrait-chat-msg-item.vue';
import './styles/index.scss';
import { useChatMsgList } from './use-chat-msg-list';

const { moreMsgVisible } = storeDefinitionToRefs(useChatMsgStore);
const { containerRef, scrollToNew } = useChatMsgList({
  ChatMsgItemComponent: PortraitChatMsgItem as ChatMsgItemComponentOptions,
});

const { toast } = useToastManager();

const playbackStore = usePlaybackStore();

if (playbackStore.chatMsgReplayEnabled) {
  const { content: chatMsgReplayTips } = useChatMsgReplayTips();
  watch(
    () => chatMsgReplayTips.value,
    value => {
      setTimeout(() => {
        toast.info(value);
      }, 1000);
    },
    {
      immediate: true,
    },
  );
}
</script>

<style lang="scss">
.c-portrait-chat-msg-list {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  pointer-events: initial;
  -webkit-mask-image: -webkit-gradient(
    linear,
    center top,
    center bottom,
    color-stop(0, transparent),
    color-stop(0.2, #000)
  );
  // mask-image: none;
}

.c-portrait-chat-msg-list__container {
  width: 100%;
  max-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: auto;
  @include hidden-scrollbar;
}

.c-portrait-chat-msg-list__more-msg {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 24px;
  padding: 0 8px;
  font-size: 14px;
  line-height: 24px;
  color: #ffa611;
  background-color: #ffffff;
  border-radius: 12px;
}
</style>
