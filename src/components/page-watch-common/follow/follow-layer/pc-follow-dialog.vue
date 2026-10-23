<!-- @file PC端关注弹层 -->
<template>
  <div v-if="followEnabled">
    <transition name="fade">
      <div
        v-show="layerVisible"
        ref="layerRef"
        class="c-pc-follow-layer"
        @click.self="closeLayer"
      >
        <div class="c-pc-follow-layer__main">
          <div class="c-pc-follow-layer__main__img-wrap">
            <img
              class="c-pc-follow-layer__main__img"
              :src="followImage"
              :alt="pcFollowTips"
            />
          </div>
          <div class="c-pc-follow-layer__main__tips">{{ pcFollowTips }}</div>
          <div
            class="c-pc-follow-layer__main__close"
            @click="closeLayer"
          ></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useFollowLayer } from '../hooks/use-follow-layer';
import { useFollowSetting } from '../hooks/use-follow-setting';

const { layerRef, layerVisible, closeLayer } = useFollowLayer();

const { pcFollowTips, followImage, followEnabled } = useFollowSetting();
</script>

<style lang="scss">
.c-pc-follow-layer {
  position: fixed;
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

.c-pc-follow-layer__main {
  position: relative;
}

.c-pc-follow-layer__main__tips {
  width: 200px;
  font-size: 16px;
  line-height: 1.5;
  color: $--color-white;
  text-align: center;
}
.c-pc-follow-layer__main__img-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  margin-bottom: 12px;
  background: $--color-white;
  border-radius: 4px;
}
.c-pc-follow-layer__main__img {
  width: 168px;
  height: 168px;
}

.c-pc-follow-layer__main__close {
  position: absolute;
  top: -44px;
  right: -52px;
  width: 48px;
  height: 48px;
  cursor: pointer;
  background-image: url(./imgs/mobile-promotion-close-1.png);
  background-size: contain;
}
</style>
