<!-- @file PC 端聊天室引用消息 -->
<template>
  <div
    v-if="currentQuoteMsg"
    class="c-pc-chat-msg-quote pws-chat-quote-msg"
  >
    <div class="c-pc-chat-msg-quote__nick g-singleline">{{ msgUserNick }}：</div>
    <!-- 发言 -->
    <template v-if="currentQuoteMsg.msgSource === ChatMsgSource.Speak">
      <div
        class="c-pc-chat-msg-quote__content g-singleline"
        v-html="parseQuoteSpeakContent(currentQuoteMsg.content)"
      ></div>
    </template>

    <pc-icon-close-round
      class="c-pc-chat-msg-quote__close"
      @click="onClickClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ChatMsgSource } from '@polyv/live-watch-sdk';
import { PcIconCloseRound } from '@/components/component-icons/pc/map';
import { useChatMsgQuoteControl } from './use-chat-msg-quote';
import { useQuoteSpeakContentParse } from '../chat-msg-list/msg-items/speak-msg/use-speak-msg';

const { parseQuoteSpeakContent } = useQuoteSpeakContentParse();

const { currentQuoteMsg, msgUserNick, onClickClose } = useChatMsgQuoteControl();
</script>

<style lang="scss">
.c-pc-chat-msg-quote {
  position: relative;
  padding: 4px 42px 4px 16px;
  font-size: 12px;
  line-height: 18px;
}

.c-pc-chat-msg-quote__content {
  .plv-emotion-img {
    width: 22px !important;
    height: 22px !important;
    margin-top: -2px;
  }
}

.c-pc-chat-msg-quote__close {
  position: absolute;
  top: 50%;
  right: 16px;
  display: flex;
  font-size: 18px !important;
  cursor: pointer;
  transform: translateY(-50%);
}
</style>
