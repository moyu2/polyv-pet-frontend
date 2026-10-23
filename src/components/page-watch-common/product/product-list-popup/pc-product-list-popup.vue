<!-- PC 商品列表弹层 -->
<template>
  <div
    v-if="interactSetting.productEntryPosition === ProductEntryPosition.Player"
    ref="productListPopupRef"
    class="c-pc-product-list-popup"
  >
    <product-list-popup
      ref="productListInnerPopupRef"
      v-if="productTargetInited && paymentTargetInited"
      :product-target="getProductTarget()"
      :payment-target="getPaymentTarget()"
      :product-config="productUIConfig"
      :popup-config="popupConfig"
      @not-support-direct-buy="handleNotSupportDirectBuy"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, unref, defineAsyncComponent } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useProductUILoader } from '../load-product-ui';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useProductUI } from '../hooks/use-product-ui';
import { ProductEntryPosition } from '@polyv/live-watch-sdk';

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);

const { loadProductUI } = useProductUILoader();

const ProductListPopup = defineAsyncComponent(() => loadProductUI('product-list-popup'));

const productListPopupRef = ref<HTMLElement>();

const popupConfig = computed(() => {
  return {
    position: 'right',
    appendTo: unref(productListPopupRef),
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

const productListInnerPopupRef = ref();
useEventBusListener(appEvents.product.OpenProductListPopup, () => {
  productListInnerPopupRef.value?.open();
});
</script>
