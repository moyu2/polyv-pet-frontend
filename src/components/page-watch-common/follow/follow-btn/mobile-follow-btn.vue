<!-- @file 移动端关注按钮 -->
<template>
  <div
    v-if="!customTheme"
    class="c-mobile-follow-btn pws-mobile-follow-button pws-mobile-follow-button--support-config"
    @click="onClickFollowBtn"
  >
    <div class="g-singleline">
      {{ followEntrance }}
    </div>
  </div>
  <div
    v-else
    class="c-mobile-follow-btn"
    :style="followBtnStyle"
    @click="onClickFollowBtn"
  >
    <div
      class="c-mobile-follow-btn__bg"
      :style="bgStyle"
    ></div>
    <div class="c-mobile-follow-btn__text g-singleline">{{ followEntrance }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFollowBtn } from '../hooks/use-follow-btn';
import { useFollowSetting } from '../hooks/use-follow-setting';
import { useThemeStore } from '@/store/use-theme-store';
import { generateBgStyle } from '@/themes/utils/theme-config';

const { followEntrance } = useFollowSetting();

const { onClickFollowBtn } = useFollowBtn();

const themeStore = useThemeStore();

const customTheme = computed(() => {
  return themeStore.watchThemeStyleConfig && themeStore.watchThemeStyleConfig.mobile.follow;
});

const followBtnStyle = computed(() => {
  if (!customTheme.value) return {};
  return {
    color: themeStore.watchThemeStyleConfig?.mobile.follow?.color,
  };
});

const bgStyle = computed(() => {
  if (!customTheme.value) return {};
  const bgConfig = themeStore.watchThemeStyleConfig?.mobile.follow?.bgConfig;
  return generateBgStyle(bgConfig);
});
</script>

<style lang="scss">
.c-mobile-follow-btn {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  min-width: 80px;
  max-width: 120px;
  height: 100%;
  padding: 0 16px;
  font-size: 16px;
  text-align: center;

  .c-mobile-follow-btn__bg {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 100%;

    // 和设计约定的背景处理
    background-repeat: no-repeat;
    background-position: left;
    background-size: auto 100%;
  }
  .c-mobile-follow-btn__text {
    position: relative;
    z-index: 2;
    display: inline-block;
    width: 100%;
  }
}
</style>
