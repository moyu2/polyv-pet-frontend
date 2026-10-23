<!-- @file 聊天消息重放提示组件 - 移动端 -->
<template>
  <mobile-page-notice
    v-if="showTips"
    class="c-mobile-chat-msg-replay-tips"
  >
    {{ content }}
  </mobile-page-notice>
</template>

<script setup lang="ts">
import MobilePageNotice from '@/components/common-base/page-notice/mobile-page-notice.vue';
import { useChatMsgReplayTips } from './use-chat-msg-replay-tips';

const { showTips, content } = useChatMsgReplayTips();
</script>
