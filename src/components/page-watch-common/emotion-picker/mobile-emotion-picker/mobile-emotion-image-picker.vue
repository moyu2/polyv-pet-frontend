<!-- @file 移动端图片表情选择 -->
<template>
  <div class="c-mobile-emotion-image-picker">
    <div
      v-for="(item, index) in emotionList"
      :key="index"
      class="c-mobile-emotion-image-picker__item"
      @click="onClickItem(item)"
    >
      <div
        class="c-mobile-emotion-image-picker__icon g-img-cover"
        :style="{
          backgroundImage: `url(${item.url})`,
        }"
      ></div>
      <div class="c-mobile-emotion-image-picker__text">{{ item.title }}</div>
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
.c-mobile-emotion-image-picker {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(auto-fill, 54px);
  gap: 16px;
  justify-content: space-around;
  padding-top: 16px;
}

.c-mobile-emotion-image-picker__item {
  box-sizing: border-box;
  display: inline-block;
  width: 54px;
  text-align: center;
  cursor: pointer;

  &:nth-last-child(1) {
    padding-bottom: 10px;
  }
}

.c-mobile-emotion-image-picker__icon {
  display: block;
  width: 54px;
  height: 54px;
  margin: 0 auto 4px auto;
}

.c-mobile-emotion-image-picker__text {
  font-size: 12px;
  color: #adadc0;
}
</style>
