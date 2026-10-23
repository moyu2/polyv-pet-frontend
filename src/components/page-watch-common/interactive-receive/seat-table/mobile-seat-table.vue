<!-- @file 移动端横屏-云席 -->

<template>
  <div
    v-if="seatTableSdkInited"
    class="c-mobile-seat-table"
  >
    <template v-if="isMeetingSeatTableTemplate">
      <!-- 模拟会场模板 -->
      <iar-mobile-seat-table-meeting
        :seat-table-sdk="seatTableSdk"
        @show-user-card="onShowUserCard"
      />

      <!-- “我的”收藏弹窗 -->
      <mobile-seat-table-follower-popup />
    </template>
    <template v-else>
      <!-- 竖向列表模板 -->
      <iar-mobile-seat-table-vertical
        :seat-table-sdk="seatTableSdk"
        @show-user-card="onShowUserCard"
      />
    </template>

    <!-- 用户卡片 -->
    <mobile-seat-table-user-card />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import { getIarComponent } from '../load-iar-ui';
import MobileSeatTableFollowerPopup from './seat-table-follower-popup/mobile-seat-table-follower-popup.vue';
import MobileSeatTableUserCard from './seat-table-user-card/mobile-seat-table-user-card.vue';

import { useSeatTable } from './use-seat-table';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const IarMobileSeatTableMeeting = getIarComponent('MobileSeatTableMeeting');
const IarMobileSeatTableVertical = getIarComponent('MobileSeatTableVertical');

const { seatTableSdk, setupSeatTable, onShowUserCard } = useSeatTable();

const { seatTableSdkInited, isMeetingSeatTableTemplate } =
  storeDefinitionToRefs(useInteractReceiveStore);

onMounted(() => {
  setupSeatTable();
});
</script>

<style lang="scss">
.c-mobile-seat-table {
  position: relative;
  height: 100%;
}

// @todo 后续更改到互动
.c-seat-table__loading-wrapper {
  display: flex;
  justify-content: center;
}
</style>
