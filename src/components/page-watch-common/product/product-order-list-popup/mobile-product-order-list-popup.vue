<!-- 订单列表弹层 -->
<template>
  <product-order-list-popup
    v-if="orderTargetInited && paymentTargetInited"
    :order-target="getOrderTarget()"
    :payment-target="getPaymentTarget()"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useProductUILoader } from '../load-product-ui';
import { useProductUI } from '../hooks/use-product-ui';

const { loadProductUI } = useProductUILoader();

const ProductOrderListPopup = defineAsyncComponent(() => loadProductUI('order-list-popup'));

const {
  orderTargetInited,
  paymentTargetInited,

  getOrderTarget,
  getPaymentTarget,
} = useProductUI();
</script>
