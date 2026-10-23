<!-- 移动端小卡片弹层 -->
<template>
  <mobile-product-small-card
    v-if="
      productTargetInited &&
      paymentTargetInited &&
      interactReceiveStore.interactSetting.liveProductEnabled
    "
    :product-target="getProductTarget()"
    :payment-target="getPaymentTarget()"
    :product-config="productUIConfig"
    :before-click-interrupt="beforeClickInterrupt"
    @not-support-direct-buy="handleNotSupportDirectBuy"
    @small-card-visible-change="onSmallCardVisibleChange"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useProductUILoader } from '../load-product-ui';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useProductUI } from '../hooks/use-product-ui';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';

const { loadProductUI } = useProductUILoader();

const MobileProductSmallCard = defineAsyncComponent(() => loadProductUI('small-card'));

const {
  productUIConfig,
  productTargetInited,
  paymentTargetInited,

  getProductTarget,
  getPaymentTarget,
  handleNotSupportDirectBuy,
} = useProductUI();

const interactReceiveStore = useInteractReceiveStore();
/**
 * 根据小卡片显示动态调整聊天室宽度
 */
function onSmallCardVisibleChange(visible: boolean) {
  interactReceiveStore.productBubbleVisible = visible;
}

const { toInterruptUserClick } = useInterruptUserClick();

function beforeClickInterrupt() {
  return toInterruptUserClick({ triggerSource: 'mobile-product-small-card', ignoreSetNick: true });
}
</script>
