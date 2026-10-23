<!-- @file PC 端聊天消息列表 -->
<template>
  <div class="c-pc-chat-msg-list">
    <div
      ref="containerRef"
      class="c-pc-chat-msg-list__container pws-main-tab-body-scrollbar"
    ></div>

    <div
      v-if="moreMsgVisible"
      class="c-pc-chat-msg-list__more-msg pws-chat-msg-more-button"
      @click="scrollToNew"
    >
      {{ $lang('chat.moreMsg') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChatMsgItemComponentOptions } from './hooks/msg-render-hook';
import PcChatMsgItem from './msg-items/portrait-chat-msg-item.vue';
import { useChatMsgList } from './use-chat-msg-list';
import './styles/index.scss';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatMsgStore } from '@/store/use-chat-msg-store';

const { moreMsgVisible } = storeDefinitionToRefs(useChatMsgStore);

const { containerRef, scrollToNew } = useChatMsgList({
  ChatMsgItemComponent: PcChatMsgItem as ChatMsgItemComponentOptions,
});
</script>

<style lang="scss">
.c-pc-chat-msg-list {
  position: relative;
  height: 100%;
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 1) 8px);
}

.c-pc-chat-msg-list__container {
  position: relative;
  box-sizing: border-box;
  height: 100%;
  padding: 12px 64px 0 16px;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain; // 阻止滚动传播
  @include scrollbar;
}

.c-pc-chat-msg-list__more-msg {
  position: absolute;
  bottom: 4px;
  left: 16px;
  z-index: 10;
  height: 32px;
  padding: 0 16px;
  font-size: 14px;
  line-height: 32px;
  cursor: pointer;
  border-radius: 16px;
  opacity: 0.8;
}
</style>
