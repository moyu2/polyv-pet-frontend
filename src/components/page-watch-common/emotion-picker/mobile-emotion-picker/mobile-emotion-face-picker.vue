<!-- @file 移动端 face 表情选择 -->
<template>
  <div
    ref="containerRef"
    class="c-mobile-emotion-face-picker"
    @click="onClickContainer"
  ></div>
</template>

<script setup lang="ts">
import { emotionFacePickerEmits, useEmotionFacePicker } from '../hooks/use-emotion-face-picker';

const emit = defineEmits(emotionFacePickerEmits());

const { containerRef, onClickContainer } = useEmotionFacePicker({
  emit,
});
</script>

<style lang="scss">
.c-mobile-emotion-face-picker {
  padding: 14px 8px 0;
  .plv-emotion-menu__item {
    margin: 0 14px 16px 0;
  }
}

// 若支持grid布局，优化边距问题
@supports (display: grid) {
  .c-mobile-emotion-face-picker {
    .plv-emotion-menu__item {
      margin: 0;
    }

    .plv-emotion-menu {
      display: grid;
      grid-template-columns: repeat(auto-fill, 32px);
      grid-gap: 16px 14px;
      align-items: center;
      justify-content: space-between;
    }
  }
}
</style>
