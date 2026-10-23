<!-- @file 移动端优惠券弹层 -->
<template>
  <div>
    <mobile-popup
      :visible.sync="couponUserListVisible"
      :title="couponUserListTitle"
      fill-body-section
      :update-on-resize="true"
      :content-style="{ background: '#F7F8FA' }"
      force-show-body-scrollbar
      backable
      :closable="false"
      @click-back="onPopupBack"
    >
      <iar-normal-coupon-user-list
        ref="couponUserListRef"
        v-if="targetInited && couponUserListVisible"
        :coupon-target="getIarTarget()"
      />
    </mobile-popup>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { useCouponUserList } from './hooks/use-coupon-user-list-v2';
import { useIarUILoader } from '../_load-iar-ui-v2';

const { loadIarUI } = useIarUILoader('iar-coupon-ui');

const {
  couponUserListRef,
  targetInited,
  getIarTarget,
  couponUserListVisible,
  couponUserListTitle,
} = useCouponUserList();

function onPopupBack() {
  couponUserListVisible.value = false;
}

const IarNormalCouponUserList = defineAsyncComponent(() => loadIarUI('normal-coupon-user-list'));
</script>
