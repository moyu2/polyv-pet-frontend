<!-- @file 竖屏端表情消息 -->
<template>
  <portrait-msg-container
    class="c-portrait-emotion-msg"
    :suffix-mode="'align-center'"
    response-relax
    hide-bubble-style
  >
    <div
      v-if="!isLoaded"
      class="c-portrait-emotion-msg__placeholder g-img-cover"
    ></div>
    <img
      v-show="isLoaded"
      class="c-portrait-emotion-msg__img"
      :src="emotionUrl"
      @load="onImgLoad"
      @click="onClickEmotion"
    />
    <template #suffix>
      <msg-status-suffix></msg-status-suffix>
    </template>
  </portrait-msg-container>
</template>

<script setup lang="ts">
import PortraitMsgContainer from '../_msg-container/portrait-msg-container.vue';
import { useEmotionMsg } from './use-emotion-msg';
import MsgStatusSuffix from '../msg-status-suffix/msg-status-suffix.vue';

const { emotionUrl, isLoaded, onImgLoad, onClickEmotion } = useEmotionMsg();
</script>

<style lang="scss">
$--emotion-size: 80px;

.c-portrait-emotion-msg__placeholder {
  width: $--emotion-size;
  height: $--emotion-size;
  margin: 4px 0;
  background-image: url(../_imgs/img-msg-placeholder.png);
}

.c-portrait-emotion-msg__img {
  display: block;
  width: $--emotion-size;
  height: $--emotion-size;
  margin: 4px 0;
  cursor: zoom-in;
  object-fit: contain;
}

.c-portrait-msg-container--relax-mode {
  .c-portrait-emotion-msg__img {
    margin: 0;
  }
}
</style>
