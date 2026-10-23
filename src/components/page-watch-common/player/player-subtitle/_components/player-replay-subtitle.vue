<!-- @file 回放字幕 -->
<template>
  <div
    v-if="mainText || translatedText"
    class="c-player-replay-subtitle"
    :style="{
      bottom: `${bottom}px`,
      fontSize: `${fontsize}`,
    }"
  >
    <p
      v-show="mainReplaySubtitleShow"
      class="c-player-replay-subtitle-line"
    >
      {{ mainText }}
    </p>
    <p
      v-show="subReplaySubtitleShow"
      class="c-player-replay-subtitle-line"
    >
      {{ translatedText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { useSubtitleProps, usePlayerSubtitle } from '../_hooks/_use-player-subtitle';
import { useReplaySubtitle } from '@/components/page-watch-common/subtitle/use-replay-subtitle';

const props = defineProps(useSubtitleProps());
const {
  fontsize,

  init,
  destroy,
} = usePlayerSubtitle({ props });

const { mainText, translatedText, mainReplaySubtitleShow, subReplaySubtitleShow } =
  useReplaySubtitle();

onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  destroy();
});
</script>

<style lang="scss">
.c-player-replay-subtitle {
  position: absolute;
  bottom: 150px;
  left: 50%;
  z-index: 7;
  box-sizing: border-box;
  width: max-content;
  max-width: 90%;
  padding: 8px 20px;
  line-height: 1.5;
  color: #fff;
  text-align: left;
  background-color: rgba(29, 33, 41, 0.8);
  border-radius: 12px;
  transform: translateX(-50%);

  .c-player-replay-subtitle-line {
    text-align: center;
  }
}
</style>
