<!-- @file PC 端报名观看 -->
<template>
  <div
    class="c-pc-enroll"
    :class="{
      'c-pc-enroll--chat': needEnrollByChat,
    }"
  >
    <!-- 入口的触发按钮 -->
    <normal-button
      v-if="needEnrollByEnter"
      class="c-pc-enroll__button"
      :size="ButtonSize.Large"
      :text="entranceText"
      @click="onClickEnter"
    />

    <!-- 聊天室中的触发区域 -->
    <div
      class="c-pc-enroll__chat"
      @click="onClickEnter"
    ></div>

    <!-- 弹层 -->
    <pc-enroll-dialog ref="dialogRef" />
  </div>
</template>

<script setup lang="ts">
import { ButtonSize } from '@/components/common-base/normal-button/types';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';

import { useEnrollStore } from '@/store/use-enroll-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { useEnrollEnter } from './hooks/use-enroll-enter';

import PcEnrollDialog from './pc-enroll-dialog.vue';

const { needEnrollByEnter, needEnrollByChat, entranceText } = storeDefinitionToRefs(useEnrollStore);
const { dialogRef, onClickEnter } = useEnrollEnter();
</script>

<style lang="scss">
.c-pc-enroll__button {
  width: 184px;
}

.c-pc-enroll--chat {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: 100%;
}
.c-pc-enroll__chat {
  width: 100%;
  height: 100%;
}
</style>
