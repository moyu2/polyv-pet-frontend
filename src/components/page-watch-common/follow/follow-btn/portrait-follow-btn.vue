<!-- @file 竖屏关注按钮 -->
<template>
  <div class="c-portrait-follow-btn">
    <!-- 触发按钮 -->
    <normal-button
      class="c-portrait-follow-btn__content"
      :text="followEntrance"
      :size="ButtonSize.XMini"
      stop-click-event
      @click="onClickFollowBtn"
    />

    <!-- 弹层 -->
    <portrait-follow-layer />
  </div>
</template>

<script setup lang="ts">
import PortraitFollowLayer from '../follow-layer/portrait-follow-layer.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize } from '@/components/common-base/normal-button/types';
import { useFollowBtn } from '@/components/page-watch-common/follow/hooks/use-follow-btn';
import { useFollowSetting } from '@/components/page-watch-common/follow/hooks/use-follow-setting';

const { followEntrance } = useFollowSetting();

const { onClickFollowBtn } = useFollowBtn();
</script>

<style lang="scss">
.c-portrait-follow-btn__content {
  min-width: initial;
}
</style>
