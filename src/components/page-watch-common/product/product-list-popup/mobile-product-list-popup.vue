<!-- 商品列表弹层 -->
<template>
  <product-list-popup
    ref="productListPopupRef"
    v-if="productTargetInited && paymentTargetInited"
    :product-target="getProductTarget()"
    :payment-target="getPaymentTarget()"
    :product-config="productUIConfig"
    @not-support-direct-buy="handleNotSupportDirectBuy"
  />
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useProductUILoader } from '../load-product-ui';
import { useProductUI } from '../hooks/use-product-ui';

const { loadProductUI } = useProductUILoader();

const ProductListPopup = defineAsyncComponent(() => loadProductUI('product-list-popup'));

const {
  productUIConfig,
  productTargetInited,
  paymentTargetInited,

  getProductTarget,
  getPaymentTarget,
  handleNotSupportDirectBuy,
} = useProductUI();

const productListPopupRef = ref();
useEventBusListener(appEvents.product.OpenProductListPopup, () => {
  productListPopupRef.value?.open();
});
</script>
