<!-- @file PC 端优惠券待领取弹窗 -->
<template>
  <pc-side-popup
    v-if="couponCommonListVisible"
    :visible.sync="couponCommonListVisible"
    :open-event="appEvents.interaction.OpenCouponCommonList"
    :title="couponCommonListTitle"
  >
    <iar-normal-coupon-common-list
      ref="couponCommonListRef"
      v-if="targetInited"
      :coupon-target="getIarTarget()"
    />
  </pc-side-popup>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import PcSidePopup from '@/components/common-base/side-popup/pc-side-popup.vue';
import { defineAsyncComponent } from 'vue';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { useCouponCommonList } from './hooks/use-coupon-common-list-v2';

const { loadIarUI } = useIarUILoader('iar-coupon-ui');

const {
  couponCommonListRef,
  targetInited,
  getIarTarget,
  couponCommonListVisible,
  couponCommonListTitle,
} = useCouponCommonList();

const IarNormalCouponCommonList = defineAsyncComponent(() =>
  loadIarUI('normal-coupon-common-list'),
);
</script>
