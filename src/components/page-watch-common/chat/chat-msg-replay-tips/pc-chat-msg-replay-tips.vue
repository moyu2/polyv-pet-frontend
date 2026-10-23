<!-- @file 聊天消息重放提示组件 - PC端 -->
<template>
  <pc-page-notice
    v-if="showTips"
    class="c-pc-chat-msg-replay-tips"
  >
    {{ content }}
  </pc-page-notice>
</template>

<script setup lang="ts">
import PcPageNotice from '@/components/common-base/page-notice/pc-page-notice.vue';
import { useChatMsgReplayTips } from './use-chat-msg-replay-tips';

const { showTips, content } = useChatMsgReplayTips();
</script>
