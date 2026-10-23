<!-- @file 竖屏音频模式占位面板 -->
<template>
  <div
    class="c-portrait-audio-panel c-portrait-placeholder-panel"
    :class="{
      'c-portrait-placeholder-panel--small-window': isSmallWindow,
    }"
  >
    <div class="c-portrait-placeholder-panel__content">
      <img
        class="c-portrait-audio-panel__image"
        :src="imgUrl"
      />
      <p class="c-portrait-audio-panel__text">{{ $lang('player.audio.ing') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '@/store/use-player-store';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { PlayStatus } from '@polyv/live-watch-sdk';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useWebviewStore } from '@/store/use-webview-store';

const { isSmallWindow } = storeDefinitionToRefs(useWebviewStore);

const animImgs: Record<string, string> = {
  anim1: require('./imgs/audio-1.png'),
  anim2: require('./imgs/audio-2.png'),
  anim3: require('./imgs/audio-3.png'),
};

const playerStore = usePlayerStore();

let animTimer: number | undefined;

const animSeat = ref(1);

const imgUrl = computed(() => {
  return animImgs[`anim${animSeat.value}`];
});

/** 开始动画 */
function startAnim() {
  animTimer = window.setInterval(() => {
    let seat = animSeat.value;
    seat++;
    if (seat > 3) {
      seat = 1;
    }
    animSeat.value = seat;
  }, 333);
}

/** 停止动画 */
function stopAnim() {
  clearInterval(animTimer);
  animTimer = undefined;
}

watch(
  () => playerStore.playStatus,
  () => {
    if (playerStore.playStatus === PlayStatus.Playing) {
      startAnim();
    } else {
      stopAnim();
    }
  },
  {
    immediate: true,
  },
);

onBeforeUnmount(() => {
  stopAnim();
});
</script>

<style lang="scss">
.c-portrait-audio-panel .c-portrait-placeholder-panel__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.c-portrait-audio-panel__image {
  width: 48px;
  height: 120px;
  margin-bottom: 12px;
}
.c-portrait-audio-panel__text {
  font-size: 14px;
  color: $--color-white;
}

.c-portrait-placeholder-panel--small-window {
  .c-portrait-audio-panel__image {
    width: 18px;
    height: 48px;
  }
  .c-portrait-audio-panel__text {
    font-size: 12px;
  }
}
</style>
