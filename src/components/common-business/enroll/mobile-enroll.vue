<!-- @file 移动端报名观看 -->
<template>
  <div
    class="c-mobile-enroll"
    :class="{
      'c-mobile-enroll--chat': needEnrollByChat,
    }"
  >
    <!-- 入口的触发按钮 -->
    <normal-button
      v-if="needEnrollByEnter"
      class="c-mobile-enroll__button"
      :size="ButtonSize.Medium"
      block
      :text="entranceText"
      @click="onClickEnter"
    />

    <!-- 聊天室中的触发区域 -->
    <div
      class="c-mobile-enroll__chat"
      @click="onClickEnter"
    ></div>

    <mobile-enroll-popup ref="dialogRef" />
  </div>
</template>

<script setup lang="ts">
import { ButtonSize } from '@/components/common-base/normal-button/types';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import MobileEnrollPopup from './mobile-enroll-popup.vue';

import { useEnrollStore } from '@/store/use-enroll-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { useEnrollEnter } from './hooks/use-enroll-enter';

const { needEnrollByEnter, needEnrollByChat, entranceText } = storeDefinitionToRefs(useEnrollStore);
const { dialogRef, onClickEnter } = useEnrollEnter();
</script>

<style lang="scss">
.c-mobile-enroll {
  padding: 0 16px;
}

.c-mobile-enroll--chat {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: 100%;
  padding: 0;
}
.c-mobile-enroll__chat {
  width: 100%;
  height: 100%;
}
</style>
