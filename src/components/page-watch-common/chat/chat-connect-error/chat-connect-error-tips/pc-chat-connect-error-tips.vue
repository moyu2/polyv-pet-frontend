<!-- @file 聊天室连接异常提示组件，仅移动端横屏使用 -->
<template>
  <pc-page-notice
    v-if="connectErrorVisible"
    class="c-pc-chat-connect-error-tips"
  >
    <template v-if="displayMode === 'auto'">
      {{ errorTipsText }}
    </template>
    <template v-else>
      {{ $lang('chat.connectError.tips3') }}
      <span
        class="c-pc-chat-connect-error-tips__hightlight"
        @click="onConfirm"
      >
        {{ $lang('chat.connectError.tips4') }}
      </span>
    </template>
  </pc-page-notice>
</template>

<script setup lang="ts">
import PcPageNotice from '@/components/common-base/page-notice/pc-page-notice.vue';
import { useChatConnectError } from '../use-chat-connect-error';

const { displayMode, connectErrorVisible, errorTipsText, onConfirm } = useChatConnectError();
</script>

<style lang="scss">
.c-pc-chat-connect-error-tips__hightlight {
  color: #ff5252;
  cursor: pointer;
}
</style>
