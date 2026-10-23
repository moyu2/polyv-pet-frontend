<!-- @file 优惠券挂件，独立/外部授权下隐藏 -->
<template>
  <div
    v-if="watchUserSystemEnabled"
    class="c-coupon-pendant"
    @click="showCouponCommonList"
  >
    <iar-normal-coupon-pendant
      v-if="targetInited"
      :icon-url="iconUrl"
      :coupon-target="getIarTarget()"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useCouponCommonPendantV2 } from './hooks/use-coupon-entrance-v2';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { useIdentityStore } from '@/store/use-identity-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const { loadIarUI } = useIarUILoader('iar-coupon-ui');

const { watchUserSystemEnabled } = storeDefinitionToRefs(useIdentityStore);

const { iconUrl, showCouponCommonList, targetInited, getIarTarget } = useCouponCommonPendantV2();

const IarNormalCouponPendant = defineAsyncComponent(() => loadIarUI('normal-coupon-pendant'));
</script>
