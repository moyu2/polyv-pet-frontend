<!-- @file PC 端图片表情选择 -->
<template>
  <div class="c-pc-emotion-image-picker">
    <div
      v-for="(item, index) in emotionList"
      :key="index"
      class="c-pc-emotion-image-picker__item"
      @click="onClickItem(item)"
    >
      <div
        class="c-pc-emotion-image-picker__icon g-img-cover"
        :style="{
          backgroundImage: `url(${item.url})`,
        }"
      ></div>
      <div class="c-pc-emotion-image-picker__text">{{ item.title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { emotionImagePickerEmits, useEmotionImagePicker } from '../hooks/use-emotion-image-picker';

const emit = defineEmits(emotionImagePickerEmits());

const { emotionList, onClickItem } = useEmotionImagePicker({
  emit,
});
</script>

<style lang="scss">
.c-pc-emotion-image-picker {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(auto-fill, 64px);
  gap: 12px;
  justify-content: space-around;
  padding: 12px;
}

.c-pc-emotion-image-picker__item {
  box-sizing: border-box;
  display: inline-block;
  width: 64px;
  text-align: center;
  cursor: pointer;

  &:nth-last-child(1) {
    padding-bottom: 10px;
  }
}

.c-pc-emotion-image-picker__icon {
  display: block;
  width: 64px;
  height: 64px;
  margin: 0 auto 4px auto;
}

.c-pc-emotion-image-picker__text {
  font-size: 12px;
  color: #adadc0;
}

.c-pc-emotion-image-picker__item:hover {
  .c-pc-emotion-image-picker__icon {
    background-color: rgba($--color-white, 0.1);
  }
}
</style>
