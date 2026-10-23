<!-- @file 移动端关注按钮 -->
<template>
  <div
    v-if="followEnabled"
    class="c-pc-follow-btn pws-mobile-follow-button"
    @click="onClickFollowBtn"
  >
    {{ followEntrance }}
  </div>
</template>

<script setup lang="ts">
import { useFollowBtn } from '../hooks/use-follow-btn';
import { useFollowSetting } from '../hooks/use-follow-setting';

const { followEntrance, followEnabled } = useFollowSetting();

const { onClickFollowBtn } = useFollowBtn();
</script>

<style lang="scss">
.c-pc-follow-btn {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  height: 100%;
  padding: 0 6px;
  font-size: 14px;
  cursor: pointer;
  background: #3f76fc;
  border-radius: 2px;
}
</style>
