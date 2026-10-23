<!-- PC 端商品底部卡片 -->
<template>
  <pc-product-bottom-card
    v-if="productTargetInited && paymentTargetInited"
    :product-target="getProductTarget()"
    :payment-target="getPaymentTarget()"
    :product-config="productUIConfig"
    :before-click-interrupt="beforeClickInterrupt"
    @not-support-direct-buy="handleNotSupportDirectBuy"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { useProductUI } from '../hooks/use-product-ui';
import { useProductUILoader } from '../load-product-ui';

const { loadProductUI } = useProductUILoader();

const PcProductBottomCard = defineAsyncComponent(() => loadProductUI('bottom-card'));

const {
  productUIConfig,
  productTargetInited,
  paymentTargetInited,

  getProductTarget,
  getPaymentTarget,
  handleNotSupportDirectBuy,
} = useProductUI();

const { toInterruptUserClick } = useInterruptUserClick();

function beforeClickInterrupt() {
  return toInterruptUserClick({ triggerSource: 'pc-product-bottom-card', ignoreSetNick: true });
}
</script>
