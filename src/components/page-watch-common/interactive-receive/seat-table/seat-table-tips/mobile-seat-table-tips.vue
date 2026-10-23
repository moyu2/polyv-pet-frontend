<!-- @file 移动端横屏-云席相关提示弹窗 -->

<template>
  <!-- 云席嘉宾证 -->
  <mobile-guest-card v-if="isWeixin && interactSetting.seatGuestCardEnabled" />
  <!-- 云席入座提示 -->
  <iar-mobile-seat-tips
    class="plv-iar-mobile-seat-tips"
    v-else-if="seatPosition"
    :seat-table-sdk="seatTableSdk"
    :row="seatPosition.row"
    :column="seatPosition.column"
  />
</template>

<script lang="ts" setup>
import { isWeixin } from '@/assets/utils/browser';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import MobileGuestCard from './seat-table-guest-card/mobile-seat-table-guest-card.vue';
import { useSeatTable } from '../use-seat-table';
const IarMobileSeatTips = getIarComponent('MobileSeatTips');

const { seatPosition, interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);

const { seatTableSdk } = useSeatTable();
</script>

<style lang="scss">
.plv-iar-mobile-seat-tips {
  position: relative;
  z-index: $--zIndex-top;
}
</style>
