<!-- 大卡片弹层 -->
<template>
  <product-big-card-popup
    v-if="productTargetInited && paymentTargetInited && interactSetting.liveProductEnabled"
    :product-target="getProductTarget()"
    :payment-target="getPaymentTarget()"
    :product-config="productUIConfig"
    :popup-config="popupConfig"
    :before-click-interrupt="beforeClickInterrupt"
    @big-card-visible-change="onBigCardVisibleChange"
    @not-support-direct-buy="handleNotSupportDirectBuy"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useProductUILoader } from '../load-product-ui';
import { useProductUI } from '../hooks/use-product-ui';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { useFeedBehavior } from '@/hooks/behaviors/use-webview-feed';

const { interactSetting } = useInteractReceiveStore();

const { loadProductUI } = useProductUILoader();

const ProductBigCardPopup = defineAsyncComponent(() => loadProductUI('big-card-popup'));

const { toLockFeedDrag, toUnlockFeedDrag } = useFeedBehavior();

const {
  productUIConfig,
  popupConfig,
  productTargetInited,
  paymentTargetInited,

  getProductTarget,
  getPaymentTarget,
  handleNotSupportDirectBuy,
} = useProductUI();

const { toInterruptUserClick } = useInterruptUserClick();

function beforeClickInterrupt() {
  return toInterruptUserClick({ triggerSource: 'product-big-card-popup', ignoreSetNick: true });
}

function onBigCardVisibleChange(visible: boolean) {
  if (visible) {
    toLockFeedDrag('product-big-card-popup');
  } else {
    toUnlockFeedDrag();
  }
}
</script>
