<!-- @file PC 端优惠券已领取弹窗 -->
<template>
  <pc-dialog
    ref="dialogRef"
    class="c-pc-coupon-user-dialog"
    :mount-el="dialogMountEl"
    :title="couponUserListTitle"
    :visible.sync="couponUserListVisible"
  >
    <iar-normal-coupon-user-list
      ref="couponUserListRef"
      v-if="targetInited"
      :coupon-target="getIarTarget()"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';

import { useCouponUserList } from './hooks/use-coupon-user-list-v2';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { useComputePcDialogForPlayer } from '@/hooks/business/use-compute-pc-dialog-for-player/use-compute-pc-dialog-for-player';

const { loadIarUI } = useIarUILoader('iar-coupon-ui');

const {
  targetInited,
  getIarTarget,
  couponUserListVisible,
  couponUserListTitle,
  couponUserListRef,
} = useCouponUserList();

const { dialogRef, dialogMountEl } = useComputePcDialogForPlayer();

const IarNormalCouponUserList = defineAsyncComponent(() => loadIarUI('normal-coupon-user-list'));
</script>
