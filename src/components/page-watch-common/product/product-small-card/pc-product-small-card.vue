<!-- pc 端小卡片弹层 -->
<template>
  <div class="c-pc-product-small-card">
    <pc-product-small-card
      v-if="productTargetInited && paymentTargetInited && interactSetting.liveProductEnabled"
      :product-target="getProductTarget()"
      :payment-target="getPaymentTarget()"
      :product-config="productUIConfig"
      :before-click-interrupt="beforeClickInterrupt"
      @not-support-direct-buy="handleNotSupportDirectBuy"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useProductUILoader } from '../load-product-ui';
import { useProductUI } from '../hooks/use-product-ui';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';

const { interactSetting } = useInteractReceiveStore();

const { loadProductUI } = useProductUILoader();

const PcProductSmallCard = defineAsyncComponent(() => loadProductUI('small-card'));

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
  return toInterruptUserClick({ triggerSource: 'pc-product-small-card', ignoreSetNick: true });
}
</script>

<style lang="scss">
.c-pc-product-small-card {
  pointer-events: initial;
}
</style>
