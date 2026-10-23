<!-- @file 移动端优惠券弹层 -->
<template>
  <div>
    <mobile-popup
      :visible.sync="couponCommonListVisible"
      :title="couponCommonListTitle"
      fill-body-section
      :update-on-resize="true"
      :content-style="{ background: '#F7F8FA' }"
      force-show-body-scrollbar
      backable
      :closable="false"
      @click-back="onPopupBack"
    >
      <iar-normal-coupon-common-list
        ref="couponCommonListRef"
        v-if="targetInited && couponCommonListVisible"
        :coupon-target="getIarTarget()"
      />
    </mobile-popup>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { useCouponCommonList } from './hooks/use-coupon-common-list-v2';
import { useIarUILoader } from '../_load-iar-ui-v2';

const { loadIarUI } = useIarUILoader('iar-coupon-ui');

const {
  couponCommonListRef,
  targetInited,
  getIarTarget,
  couponCommonListVisible,
  couponCommonListTitle,
} = useCouponCommonList();

function onPopupBack() {
  couponCommonListVisible.value = false;
}

const IarNormalCouponCommonList = defineAsyncComponent(() =>
  loadIarUI('normal-coupon-common-list'),
);
</script>
