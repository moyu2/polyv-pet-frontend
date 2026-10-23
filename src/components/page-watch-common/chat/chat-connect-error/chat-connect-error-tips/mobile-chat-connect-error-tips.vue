<!-- @file 聊天室连接异常提示组件，仅移动端横屏使用 -->
<template>
  <mobile-page-notice
    v-if="connectErrorVisible"
    class="c-mobile-chat-connect-error-tips"
  >
    <template v-if="displayMode === 'auto'">
      {{ errorTipsText }}
    </template>
    <template v-else>
      {{ $lang('chat.connectError.tips3') }}
      <span
        class="c-mobile-chat-connect-error-tips__hightlight"
        @click="onConfirm"
      >
        {{ $lang('chat.connectError.tips4') }}
      </span>
    </template>
  </mobile-page-notice>
</template>

<script setup lang="ts">
import MobilePageNotice from '@/components/common-base/page-notice/mobile-page-notice.vue';
import { useChatConnectError } from '../use-chat-connect-error';

const { displayMode, connectErrorVisible, errorTipsText, onConfirm } = useChatConnectError();
</script>

<style lang="scss">
.c-mobile-chat-connect-error-tips__hightlight {
  color: #ff5252;
}
</style>
