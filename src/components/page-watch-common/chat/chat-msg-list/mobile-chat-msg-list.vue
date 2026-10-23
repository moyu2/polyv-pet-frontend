<!-- @file 移动端聊天消息列表 -->
<template>
  <div
    class="c-mobile-chat-msg-list"
    :class="{
      'c-mobile-chat-msg-list--bubble-visible': productBubbleVisible,
    }"
  >
    <div
      ref="containerRef"
      class="c-mobile-chat-msg-list__container pws-main-scrollbar-color"
    ></div>

    <div
      v-if="moreMsgVisible"
      class="c-mobile-chat-msg-list__more-msg pws-chat-msg-more-button"
      @click="scrollToNew"
    >
      {{ $lang('chat.moreMsg') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChatMsgItemComponentOptions } from './hooks/msg-render-hook';
import MobileChatMsgItem from './msg-items/portrait-chat-msg-item.vue';
import { useChatMsgList } from './use-chat-msg-list';
import './styles/index.scss';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const { moreMsgVisible } = storeDefinitionToRefs(useChatMsgStore);

const { productBubbleVisible } = storeDefinitionToRefs(useInteractReceiveStore);

const { containerRef, scrollToNew } = useChatMsgList({
  ChatMsgItemComponent: MobileChatMsgItem as ChatMsgItemComponentOptions,
});
</script>

<style lang="scss">
.c-mobile-chat-msg-list {
  position: relative;
  height: 100%;
  color: #adadc0;
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 1) 8px);
}

.c-mobile-chat-msg-list__container {
  box-sizing: border-box;
  height: 100%;
  padding: 12px 68px 0 12px;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain; // 阻止滚动传播
  @include scrollbar;
}

.c-mobile-chat-msg-list--bubble-visible {
  .c-mobile-chat-msg-list__container {
    padding-right: 138px;
  }
}

.c-mobile-chat-msg-list__more-msg {
  position: absolute;
  bottom: 4px;
  left: 12px;
  z-index: 10;
  height: 34px;
  padding: 0 16px;
  font-size: 14px;
  line-height: 34px;
  border-radius: 17px;
  opacity: 0.8;
}
</style>
