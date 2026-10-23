<!-- @file 竖屏关注弹层 -->
<template>
  <transition name="fade">
    <div
      v-show="layerVisible && !isSmallWindow"
      ref="layerRef"
      class="c-portrait-follow-layer"
      :class="{
        'c-portrait-follow-layer--page-fullscreen':
          mobilePlayerIsPageFullscreen && !isHorizontalScreenOrientation,
      }"
      @click.self="closeLayer"
    >
      <div class="c-portrait-follow-layer__main">
        <div class="c-portrait-follow-layer__main__tips">{{ followTips }}</div>
        <div class="c-portrait-follow-layer__main__img-wrapper">
          <div
            class="c-portrait-follow-layer__main__img-wrapper__border_corner c-portrait-follow-layer__main__img-wrapper__border_corner_left_top"
          ></div>
          <div
            class="c-portrait-follow-layer__main__img-wrapper__border_corner c-portrait-follow-layer__main__img-wrapper__border_corner_right_top"
          ></div>
          <div
            class="c-portrait-follow-layer__main__img-wrapper__border_corner c-portrait-follow-layer__main__img-wrapper__border_corner_left_bottom"
          ></div>
          <div
            class="c-portrait-follow-layer__main__img-wrapper__border_corner c-portrait-follow-layer__main__img-wrapper__border_corner_right_bottom"
          ></div>
          <img
            class="c-portrait-follow-layer__main__img"
            :src="followImage"
            :alt="followTips"
          />
        </div>

        <!-- 竖屏关闭按钮-->
        <div
          v-show="!mobilePlayerIsPageFullscreen && isVerticalScreenOrientation"
          class="c-portrait-follow-layer__main__close"
          @click="closeLayer"
        ></div>
        <!-- 横屏关闭/强制全屏按钮-->
        <div
          v-show="mobilePlayerIsPageFullscreen || isHorizontalScreenOrientation"
          class="c-portrait-follow-layer__main__close--horizontal"
          @click="closeLayer"
        ></div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useAppendTo } from '@/hooks/behaviors/use-append-to';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { useFollowLayer } from '../hooks/use-follow-layer';
import { useFollowSetting } from '../hooks/use-follow-setting';

const { layerRef, layerVisible, closeLayer } = useFollowLayer();

const { mobilePlayerIsPageFullscreen, isHorizontalScreenOrientation, isVerticalScreenOrientation } =
  storeDefinitionToRefs(useLayoutStore);

const { followTips, followImage } = useFollowSetting();

useAppendTo(layerRef);

const { isSmallWindow } = storeDefinitionToRefs(useWebviewStore);
</script>

<style lang="scss">
.c-portrait-follow-layer {
  position: fixed;
  top: 0;
  left: 0;
  z-index: $--zIndex-top; // 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
}

.c-portrait-follow-layer--page-fullscreen {
  @include force-page-fullscreen;
}

.c-portrait-follow-layer__main {
  position: relative;
  width: 280px;
  height: 280px;
  text-align: center;
  background: url(./imgs/promotion-background.png) no-repeat;
  background-size: contain;
}

.c-portrait-follow-layer__main__tips {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 76px;
  padding: 0 30px;
  font-size: 16px;
  line-height: 1.5;
  color: #dc5723;
  text-align: center;
}

.c-portrait-follow-layer__main__img-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 180px;
  margin-top: 8px;

  .c-portrait-follow-layer__main__img {
    width: 168px;
    height: 168px;
  }
}

.c-portrait-follow-layer__main__close {
  position: absolute;
  top: 280px;
  left: 124px;
  width: 32px;
  height: 56px;
  background-image: url(./imgs/mobile-promotion-close.png);
  background-size: contain;
}

.c-portrait-follow-layer__main__close--horizontal {
  position: absolute;
  top: 0;
  right: -47px;
  width: 32px;
  height: 32px;
  background-image: url(./imgs/mobile-promotion-close-1.png);
  background-size: contain;
}

.c-portrait-follow-layer__main__img-wrapper__border_corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 1.5px solid #dc5723;
}
.c-portrait-follow-layer__main__img-wrapper__border_corner_left_top {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
  // border-top-left-radius: 4px;
}
.c-portrait-follow-layer__main__img-wrapper__border_corner_right_top {
  top: 0;
  right: 0;
  border-bottom: none;
  border-left: none;
  // border-top-right-radius: 4px;
}
.c-portrait-follow-layer__main__img-wrapper__border_corner_left_bottom {
  bottom: 0;
  left: 0;
  border-top: none;
  border-right: none;
  // border-bottom-left-radius: 4px;
}
.c-portrait-follow-layer__main__img-wrapper__border_corner_right_bottom {
  right: 0;
  bottom: 0;
  border-top: none;
  border-left: none;
  // border-bottom-right-radius: 4px;
}
</style>
