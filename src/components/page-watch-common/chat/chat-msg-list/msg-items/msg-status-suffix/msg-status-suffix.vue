<template>
  <span
    v-if="
      (iconShowStatus === ChatMsgItemSendStatus.Loading ||
        iconShowStatus === ChatMsgItemSendStatus.Fail) &&
      category === ChatMsgItemCategory.Chat
    "
    class="c-msg-status-suffix"
  >
    <template v-if="chatMsg.isLocal">
      <pc-icon-chat-loading
        v-if="iconShowStatus === ChatMsgItemSendStatus.Loading"
        class="c-msg-status-suffix__loading"
      />
      <pc-icon-chat-error
        v-if="iconShowStatus === ChatMsgItemSendStatus.Fail"
        class="c-msg-status-suffix__fail"
        @click="handleThrottleReSendMsg"
      />
    </template>
  </span>
</template>

<script setup lang="ts">
import { useChatMsgStatus } from './use-msg-status';
import { ChatMsgItemSendStatus, ChatMsgSpeakType, ChatMsgImageType } from '@polyv/live-watch-sdk';
import { PcIconChatError, PcIconChatLoading } from '@/components/component-icons/pc/map';
import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';
import { ChatMsgItemCategory } from '../use-chat-msg-item';

const { chatMsg, category } = useChatMsgDataInject<ChatMsgSpeakType | ChatMsgImageType>();

const { iconShowStatus, handleThrottleReSendMsg } = useChatMsgStatus();
</script>

<style lang="scss">
.c-msg-status-suffix {
  display: inline-block;
  width: 16px;
  height: 16px;
}

.c-msg-status-suffix__fail {
  font-size: 16px;
  color: #fb7272;
}

.c-msg-status-suffix__fail {
  font-size: 16px;
  color: #fb7272;
}

.c-msg-status-suffix__loading {
  display: inline-block;
  width: 16px;
  height: 16px;
  font-size: 16px;
  color: #fff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
./use-msg-status
