<!-- 订单确认页弹层 -->
<template>
  <product-order-popup
    v-if="orderTargetInited && paymentTargetInited && addressTargetInited"
    :order-target="getOrderTarget()"
    :payment-target="getPaymentTarget()"
    :address-target="getAddressTarget()"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useProductUILoader } from '../load-product-ui';
import { useProductUI } from '../hooks/use-product-ui';

const { loadProductUI } = useProductUILoader();

const ProductOrderPopup = defineAsyncComponent(() => loadProductUI('order-popup'));

const {
  orderTargetInited,
  paymentTargetInited,
  addressTargetInited,

  getOrderTarget,
  getPaymentTarget,
  getAddressTarget,
} = useProductUI();
</script>
