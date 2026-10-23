<template>
  <div class="c-chat-speak-top">
    <div class="c-chat-speak-top__content">
      <span class="c-chat-speak-top__title">{{ message.nick }}：</span>
      <span
        class="c-chat-speak-top__message"
        v-html="message.content"
      ></span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { SliceIdSpeakTop } from '@polyv/live-watch-sdk';
import type { PropType } from 'vue';

defineProps({
  message: {
    type: Object as PropType<SliceIdSpeakTop>,
    required: true,
  },
});
</script>

<style lang="scss">
.c-chat-speak-top {
  position: relative;
  box-sizing: border-box;
  width: 311px;
  padding: 12px 60px 12px 12px;
}

.c-chat-speak-top__title {
  font-size: 12px;
  color: #ffd16b;
}
.c-chat-speak-top__message {
  font-weight: 500;
}

.c-chat-speak-top__content {
  display: -webkit-box;
  overflow: hidden;
  font-size: 14px;
  line-height: 18px;
  color: white;
  text-overflow: ellipsis;
  word-break: break-all;
  white-space: normal;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>

<style>
.c-chat-speak-top__content a {
  color: #fff !important;
}
</style>
