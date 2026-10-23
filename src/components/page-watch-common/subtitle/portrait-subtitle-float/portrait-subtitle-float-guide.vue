<template>
  <div
    class="c-portrait-subtitle-float-guide"
    v-if="isShowGuide"
    @click="handleClose"
  >
    <div class="c-portrait-subtitle-float-guide__content">
      {{ $lang('portrait.subtitle.float.guide.tips') }}
    </div>

    <mobile-icon-subtitle-close class="c-portrait-subtitle-float-guide__close" />

    <span class="c-portrait-subtitle-float-guide__guide-icon"></span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MobileIconSubtitleClose } from '@/components/component-icons/mobile/map';
import { getLocalStorage, setLocalStorage } from '@/assets/utils/storage';

const SUBTITLE_FLOAT_GUIDE_ONCE_KEY = 'subtitle-float-guide-once';

const isShowGuide = ref(getLocalStorage(SUBTITLE_FLOAT_GUIDE_ONCE_KEY) !== 'true');

function setOnce() {
  setLocalStorage(SUBTITLE_FLOAT_GUIDE_ONCE_KEY, 'true');
}

function handleClose() {
  setOnce();
  isShowGuide.value = false;
}
</script>

<style lang="scss">
.c-portrait-subtitle-float-guide {
  color: #fff;
  background: rgba(0, 0, 0, 0.8);
}

.c-portrait-subtitle-float-guide__close {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  font-size: 24px;
  pointer-events: auto;
}

.c-portrait-subtitle-float-guide__content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 14px;
  font-weight: 500;
}

.c-portrait-subtitle-float-guide__guide-icon {
  position: absolute;
  top: 39px;
  right: 18px;
  display: inline-block;
  width: 49px;
  height: 39px;
  background: url('./images/guide-icon.png') no-repeat center center;
  background-size: 100% 100%;
}
</style>
