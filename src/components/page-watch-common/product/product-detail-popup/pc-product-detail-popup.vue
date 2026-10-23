<!-- PC 商品详情弹层 -->
<template>
  <div
    ref="productDetailPopupRef"
    class="c-pc-product-detail-popup"
  >
    <product-detail-popup
      ref="productDetailInnerPopupRef"
      v-if="productTargetInited && paymentTargetInited"
      :product-target="getProductTarget()"
      :payment-target="getPaymentTarget()"
      :product-config="productUIConfig"
      :popup-config="popupConfig"
      @play="toPause"
      @pause="toPlay"
      @not-support-direct-buy="handleNotSupportDirectBuy"
    />
  </div>
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { computed, defineAsyncComponent, ref, unref } from 'vue';
import { useProductUI } from '../hooks/use-product-ui';
import { useProductUILoader } from '../load-product-ui';

const { loadProductUI } = useProductUILoader();

const ProductDetailPopup = defineAsyncComponent(() => loadProductUI('product-detail-popup'));

const { toPlay, toPause } = usePlayerAction();

const productDetailPopupRef = ref<HTMLElement>();

const popupConfig = computed(() => {
  return {
    position: 'right',
    appendTo: unref(productDetailPopupRef),
    showModal: false,
  };
});

const {
  productUIConfig,
  productTargetInited,
  paymentTargetInited,

  getProductTarget,
  getPaymentTarget,
  handleNotSupportDirectBuy,
} = useProductUI();

const productDetailInnerPopupRef = ref();
useEventBusListener(appEvents.product.OpenProductDetailPopup, (productId: number) => {
  productDetailInnerPopupRef.value?.open(productId);
});
</script>
