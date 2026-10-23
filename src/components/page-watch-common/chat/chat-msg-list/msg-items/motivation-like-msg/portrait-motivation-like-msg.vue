<!-- @file 移动端横屏-课堂激励点赞消息 -->
<template>
  <portrait-msg-container
    class="c-portrait-motivation-like-msg"
    hide-user-info
  >
    <div
      class="c-portrait-motivation-like-msg__content"
      v-html="content"
    ></div>
  </portrait-msg-container>
</template>

<script setup lang="ts">
import PortraitMsgContainer from '../_msg-container/portrait-msg-container.vue';
import { useMotivationLikeMsg } from './use-motivation-like-msg';

const { content } = useMotivationLikeMsg();
</script>
