<!-- @file PC + 移动端表单组件：上传图片 -->
<template>
  <div
    class="c-form-upload-image"
    :class="{
      'c-form-upload-image--mobile': isMobile,
    }"
  >
    <div
      v-for="(img, index) in value"
      :key="index"
      class="c-form-upload-image__item c-form-upload-image__img g-img-cover"
      :style="{
        backgroundImage: `url(${img})`,
      }"
    >
      <span
        class="c-form-upload-image__img__close"
        @click="onClickDelete(index)"
      ></span>
    </div>

    <!-- 上传按钮 -->
    <div
      v-if="value.length < maxCount"
      class="c-form-upload-image__item c-form-upload-image__btn g-img-cover"
      @click="onClickUpload"
    ></div>

    <div
      v-if="countTips"
      class="c-form-upload-image__tips"
    >
      {{ countTips }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  formUploadImageProps,
  formUploadImageEmit,
  useFormUploadImage,
} from './use-form-upload-image';

const props = defineProps(formUploadImageProps());

const emit = defineEmits(formUploadImageEmit());

const { value, maxCount, onClickUpload, onClickDelete, countTips, isMobile } = useFormUploadImage({
  props,
  emit,
});
</script>

<style lang="scss">
.c-form-upload-image {
  display: flex;
  align-items: flex-end;
}

.c-form-upload-image__img {
  position: relative;
  width: 64px;
  height: 64px;
  margin-right: 16px;
  border-radius: 4px;
}

.c-form-upload-image__img__close {
  position: absolute;
  top: -8px;
  right: -4px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  background-image: url(../imgs/form-upload-del.png);
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
}

.c-form-upload-image__btn {
  width: 64px;
  height: 64px;
  cursor: pointer;
  background-color: #f6f6f6;
  background-image: url(../imgs/form-upload-add.png);
  border-radius: 4px;
}

.c-form-upload-image__item {
  margin-right: 16px;
}

.c-form-upload-image__tips {
  font-size: 12px;
  color: #9e9e9e;
}
</style>
