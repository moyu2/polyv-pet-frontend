<!-- @file 移动端横屏-提问消息列表 -->
<template>
  <div class="c-mobile-ask-msg-list-wrap">
    <div
      ref="scrollRef"
      class="c-mobile-ask-msg-list"
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
      class="c-mobile-ask-msg-list__more-msg pws-ask-msg-more-button"
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
.c-mobile-ask-msg-list-wrap {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.c-mobile-ask-msg-list {
  height: 100%;
  padding: 0 12px;
  overflow-y: auto;
}

.c-mobile-ask-msg-list__more-msg {
  position: absolute;
  bottom: 18px;
  left: 50%;
  z-index: 10;
  height: 34px;
  padding: 0 16px;
  font-size: 14px;
  line-height: 34px;
  border-radius: 17px;
  opacity: 0.8;
  transform: translateX(-50%);
}
</style>
