<template>
  <div class="c-portrait-product-render">
    <!-- 商品列表弹层 -->
    <mobile-product-list-popup v-if="interactSetting.productEnabled" />

    <!-- 商品详情弹层 -->
    <mobile-product-detail-popup />

    <!-- 订单列表弹层 -->
    <mobile-product-order-list-popup />

    <!-- 订单确认弹层 -->
    <mobile-product-order-popup />

    <!-- 商品外链弹层 -->
    <product-iframe-link-popup />

    <!-- 大卡片弹层 -->
    <product-big-card-popup />
  </div>
</template>

<script setup lang="ts">
import MobileProductListPopup from './product-list-popup/mobile-product-list-popup.vue';
import MobileProductDetailPopup from './product-detail-popup/mobile-product-detail-popup.vue';
import MobileProductOrderListPopup from './product-order-list-popup/mobile-product-order-list-popup.vue';
import MobileProductOrderPopup from './product-order-popup/mobile-product-order-popup.vue';
import ProductIframeLinkPopup from './product-iframe-link-popup/product-iframe-link-popup.vue';
import ProductBigCardPopup from './product-big-card-popup/product-big-card-popup.vue';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);
</script>
