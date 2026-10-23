<!-- @file 移动端情绪反馈 -->
<template>
  <div class="c-mobile-emotional-feedback">
    <!-- 明白了 -->
    <div class="c-mobile-emotional-feedback__item c-mobile-emotional-feedback__icon--yes">
      <plv-emotional-feedback
        ref="yesRef"
        class="c-mobile-emotional-feedback__animation"
        :width="200"
        :height="360"
        :scale="0.8"
        :auto-play="false"
      />
      <div
        class="c-mobile-emotional-feedback__icon g-img-cover"
        @click="onClickIcon(EmotionalFeedbackType.Yes)"
      ></div>
    </div>

    <!-- 没听懂 -->
    <div class="c-mobile-emotional-feedback__item c-mobile-emotional-feedback__icon--no">
      <plv-emotional-feedback
        ref="noRef"
        class="c-mobile-emotional-feedback__animation"
        :width="200"
        :height="360"
        :scale="0.8"
        :auto-play="false"
      />
      <div
        class="c-mobile-emotional-feedback__icon g-img-cover"
        @click="onClickIcon(EmotionalFeedbackType.No)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EmotionalFeedbackType } from '@polyv/live-watch-sdk';
import { PlvEmotionalFeedback } from '@/plugins/polyv-ui/mobile-import';
import { useEmotionalFeedback } from './use-emotional-feedback';

const { yesRef, noRef, onClickIcon } = useEmotionalFeedback();
</script>

<style lang="scss">
.c-mobile-emotional-feedback__item {
  position: relative;
}
.c-mobile-emotional-feedback__item + .c-mobile-emotional-feedback__item {
  margin-top: 12px;
}

.c-mobile-emotional-feedback__icon {
  position: relative;
  z-index: 2;
  width: $pendant-size;
  height: $pendant-size;
  cursor: pointer;
}

.c-mobile-emotional-feedback__icon--yes .c-mobile-emotional-feedback__icon {
  background-image: url(./imgs/icon-yes.png);
}
.c-mobile-emotional-feedback__icon--no .c-mobile-emotional-feedback__icon {
  background-image: url(./imgs/icon-no.png);
}

.c-mobile-emotional-feedback__animation {
  position: absolute;
  bottom: 20px;
  left: -52px;
  z-index: 1;
  pointer-events: none;
}
</style>
