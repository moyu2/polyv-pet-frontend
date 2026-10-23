<!-- @file PC 端提问消息列表 -->
<template>
  <div class="c-pc-ask-msg-list-wrap">
    <div
      ref="scrollRef"
      class="c-pc-ask-msg-list pws-main-tab-body-scrollbar"
      @scroll="onScrollEvent"
    >
      <template v-for="(item, index) in askMsgList">
        <portrait-chat-msg-item
          :category="ChatMsgItemCategory.Ask"
          :key="item.id"
          :chat-msg="item"
          :prev-chat-msg="askMsgList[index - 1]"
          :next-chat-msg="askMsgList[index + 1]"
        />
      </template>
    </div>
    <div
      v-if="moreMsgVisible"
      class="c-pc-ask-msg-list__more-msg pws-ask-msg-more-button"
      @click="scrollToNew"
    >
      {{ $lang('chat.moreMsg') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import PortraitChatMsgItem from '@/components/page-watch-common/chat/chat-msg-list/msg-items/portrait-chat-msg-item.vue';
import { ChatMsgItemCategory } from '../../chat/chat-msg-list/msg-items/use-chat-msg-item';
import { askMsgListEmits, askMsgListProps, useAskMsgList } from './use-ask-msg-list';
import { useAskStore } from '@/store/use-ask-store';

defineProps(askMsgListProps());

const emit = defineEmits(askMsgListEmits());

const { moreMsgVisible } = storeDefinitionToRefs(useAskStore);

const { scrollRef, askMsgListInstance, onScrollEvent, scrollToNew } = useAskMsgList({ emit });

defineExpose(askMsgListInstance);
</script>

<style lang="scss">
.c-pc-ask-msg-list-wrap {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.c-pc-ask-msg-list {
  height: 100%;
  padding: 12px 64px 0 16px;
  overflow-y: auto;
  color: #adadc0;
  @include scrollbar;
}

.c-pc-ask-msg-list__more-msg {
  position: absolute;
  bottom: 36px;
  left: 50%;
  z-index: 10;
  height: 32px;
  padding: 0 16px;
  font-size: 14px;
  line-height: 32px;
  cursor: pointer;
  border-radius: 16px;
  opacity: 0.8;
  transform: translateX(-50%);
}
</style>
