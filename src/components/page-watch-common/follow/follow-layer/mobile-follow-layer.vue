<!-- @file 移动端关注弹层 -->
<template>
  <transition name="fade">
    <div
      v-show="layerVisible"
      ref="layerRef"
      class="c-mobile-follow-layer"
      @click.self="closeLayer"
    >
      <div class="c-mobile-follow-layer__main">
        <div class="c-mobile-follow-layer__main__img-wrap">
          <img
            class="c-mobile-follow-layer__main__img"
            :src="followImage"
            :alt="followTips"
          />
        </div>
        <div class="c-mobile-follow-layer__main__tips">{{ followTips }}</div>
        <div
          class="c-mobile-follow-layer__main__close"
          @click="closeLayer"
        ></div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useFollowLayer } from '../hooks/use-follow-layer';
import { useFollowSetting } from '../hooks/use-follow-setting';

const { layerRef, layerVisible, closeLayer } = useFollowLayer();

const { followTips, followImage } = useFollowSetting();
</script>

<style lang="scss">
.c-mobile-follow-layer {
  position: absolute;
  top: 0;
  left: 0;
  // z-index: $--zIndex-top;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
}

.c-mobile-follow-layer__main {
  position: relative;
}

.c-mobile-follow-layer__main__tips {
  width: 200px;
  font-size: 16px;
  line-height: 1.5;
  color: $--color-white;
  text-align: center;
}
.c-mobile-follow-layer__main__img-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  margin-bottom: 12px;
  background: $--color-white;
  border-radius: 4px;
}
.c-mobile-follow-layer__main__img {
  width: 168px;
  height: 168px;
}

.c-mobile-follow-layer__main__close {
  position: absolute;
  top: -44px;
  right: -52px;
  width: 48px;
  height: 48px;
  background-image: url(./imgs/mobile-promotion-close-1.png);
  background-size: contain;
}
</style>
