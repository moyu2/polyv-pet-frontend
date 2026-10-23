<!-- @file 竖屏端图片消息 -->
<template>
  <portrait-msg-container
    class="c-portrait-image-msg"
    response-relax
    hide-bubble-style
  >
    <div
      v-if="chatMsg.isIllegal"
      class="c-portrait-image-msg__illegal"
    >
      <mobile-icon-forbid class="c-portrait-image-msg__illegal__icon" />
      <span>{{ $lang('chat.illegalImage') }}</span>
    </div>
    <template v-else>
      <template v-if="!isLoaded">
        <!-- 默认占位图 -->
        <div
          v-if="!localImagePlaceholder"
          class="c-portrait-image-msg__placeholder g-img-cover"
          :style="placeholderImageStyle"
        ></div>
        <!-- 本地上传的情况下，消息替换时用的占位图，为了快速过渡 -->
        <div
          v-else
          class="c-portrait-image-msg__img-wrap c-portrait-image-msg__img-wrap--local"
          :style="placeholderImageStyle"
        >
          <div class="c-portrait-image-msg__img-inner">
            <img
              class="c-portrait-image-msg__img"
              :src="imageUrl"
              :style="imageBoundStyle"
              @click="onClickImage"
              @load="onImageLoad"
            />

            <span v-if="isLargeImage">{{ $lang('chat.longImage') }}</span>
          </div>
        </div>
      </template>

      <!-- 直接插入到本地的图片 / 服务端图片 -->
      <div
        v-show="isLoaded"
        class="c-portrait-image-msg__img-wrap"
      >
        <div class="c-portrait-image-msg__img-inner">
          <img
            ref="imageRef"
            class="c-portrait-image-msg__img"
            :src="imageUrl"
            :style="imageBoundStyle"
            @load="onImageLoad"
            @click="onClickImage"
          />

          <span v-if="isLargeImage">{{ $lang('chat.longImage') }}</span>
        </div>
      </div>
    </template>
  </portrait-msg-container>
</template>

<script setup lang="ts">
import { MobileIconForbid } from '@/components/component-icons/mobile/map';
import PortraitMsgContainer from '../_msg-container/portrait-msg-container.vue';
import { useImageMsg } from './use-image-msg';

const {
  chatMsg,
  imageUrl,
  localImagePlaceholder,
  placeholderImageStyle,
  isLoaded,
  imageRef,
  imageBoundStyle,
  isLargeImage,

  onImageLoad,
  onClickImage,
} = useImageMsg();
</script>

<style lang="scss">
$--image-size: 80px;

.c-portrait-image-msg__illegal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: $--image-size;
  height: $--image-size;
  margin-top: 4px;
  font-size: 12px;
  color: $--color-white;
  background: $--color-black;
}
.c-portrait-image-msg__illegal__icon {
  display: flex;
  flex-shrink: 0;
  font-size: 30px !important;
  color: red;
}

.c-portrait-image-msg__placeholder {
  margin: 4px 0;
  background-image: url(../_imgs/img-msg-placeholder.png);
  border-radius: 4px;
}

.c-portrait-image-msg__img-inner {
  position: relative;
  display: inline-block;
  vertical-align: middle;

  span {
    position: absolute;
    top: 8px;
    right: 8px;
    height: 16px;
    padding: 0 4px;
    font-size: 10px;
    line-height: 16px;
    color: #fff;
    pointer-events: none;
    background: rgba(#000, 0.4);
    border-radius: 2px;
  }
}

.c-portrait-image-msg__img {
  display: block;
  min-width: 80px;
  max-width: 150px;
  min-height: 50px;
  max-height: 200px;
  margin: 4px 0;
  cursor: zoom-in;
  border-radius: 4px;
  object-fit: cover;
}

.c-portrait-msg-container--relax-mode {
  .c-portrait-image-msg__img {
    margin: 0;
  }
}
</style>
