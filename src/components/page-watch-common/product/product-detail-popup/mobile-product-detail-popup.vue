<!-- 移动端商品详情弹层 -->
<template>
  <product-detail-popup
    ref="productDetailPopupRef"
    v-if="productTargetInited && paymentTargetInited"
    :product-target="getProductTarget()"
    :payment-target="getPaymentTarget()"
    :product-config="productUIConfig"
    @play="toPause"
    @pause="toPlay"
    @not-support-direct-buy="handleNotSupportDirectBuy"
  />
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useProductUILoader } from '../load-product-ui';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { useProductUI } from '../hooks/use-product-ui';

const { toPlay, toPause } = usePlayerAction();

const { loadProductUI } = useProductUILoader();

const ProductDetailPopup = defineAsyncComponent(() => loadProductUI('product-detail-popup'));

const {
  productUIConfig,
  productTargetInited,
  paymentTargetInited,

  getProductTarget,
  getPaymentTarget,
  handleNotSupportDirectBuy,
} = useProductUI();

const productDetailPopupRef = ref();
useEventBusListener(appEvents.product.OpenProductDetailPopup, (productId: number) => {
  productDetailPopupRef.value?.open(productId);
});
</script>
