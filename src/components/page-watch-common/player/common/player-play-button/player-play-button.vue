<!-- @file 播放器的播放大按钮 -->
<template>
  <div
    class="c-player-play-button"
    @click="handleClick"
  >
    <div
      v-if="isTextMode"
      class="c-player-play-button__mode--text"
    >
      <div class="c-player-play-button__mode__prefix-icon">
        <img src="./imgs/play-btn-prefix.gif" />
      </div>

      <span class="c-player-play-button__mode__text">{{ $lang('player.play.button.text') }}</span>
    </div>
    <div
      v-else
      class="c-player-play-button__mode--default-wrapper"
    >
      <slot name="btn-before"></slot>
      <div
        class="c-player-play-button__mode--default"
        :class="{
          'c-player-play-button__mode--default-new-skin': isDefaultNewSkin,
        }"
      ></div>
      <slot name="btn-after"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { usePlayerPlayButtonProps, PlayButtonMode } from './use-player-play-button';

const props = defineProps(usePlayerPlayButtonProps());

const emit = defineEmits(['click']);

const isTextMode = computed(() => {
  return props.mode === PlayButtonMode.Text;
});

const isDefaultNewSkin = computed(() => {
  return props.mode === PlayButtonMode.DefaultNewSkin;
});

const handleClick = (e: MouseEvent) => {
  emit('click', e);
};
</script>

<style lang="scss">
.c-player-play-button {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  pointer-events: none;
  cursor: pointer;
  background: rgba(#000, 0);
}

.c-player-play-button__mode__prefix-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: linear-gradient(180deg, #f93942 0%, #fd5962 100%);
  border-radius: 100%;

  img {
    width: 18px;
    height: 18px;
  }
}

.c-player-play-button__mode__text {
  display: flex;
  flex: 1;
  justify-content: center;
  padding-right: 4px;
}

.c-player-play-button__mode--text {
  position: absolute;
  top: 50%;
  left: 50%;

  box-sizing: border-box;
  display: flex;
  align-items: center;
  min-width: 116px;
  height: 36px;
  font-size: 14px;
  font-weight: 400;
  color: $--color-white;
  letter-spacing: 0;
  white-space: nowrap;
  pointer-events: none;

  background: rgba(0, 0, 0, 0.14);
  border: 1px solid rgba(#fff, 0.6);
  border-radius: 20px;
  transform: translate(-50%, -50%);
  backdrop-filter: blur(10px);
}

.c-player-play-button__mode--default {
  width: 128px;
  max-width: 22%;
  pointer-events: none;

  &::after {
    display: block;
    width: 100%;
    height: 0;
    padding-bottom: 100%;
    content: '';

    background-image: url(./imgs/play-btn.png);
    background-size: 100% 100%;
  }
}

.c-player-play-button__mode--default-new-skin {
  &::after {
    background-image: url(./imgs/play-btn-new-skin.png);
    background-size: 100% 100%;
  }
}

.c-player-play-button__mode--default-wrapper {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>
