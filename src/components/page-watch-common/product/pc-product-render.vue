<!-- PC 商品库渲染入口，在播放器右侧 -->
<template>
  <div class="c-pc-product-render">
    <pc-product-list-popup v-if="interactSetting.productEnabled" />

    <pc-product-detail-popup />

    <product-iframe-link-popup />
  </div>
</template>

<script setup lang="ts">
import PcProductListPopup from './product-list-popup/pc-product-list-popup.vue';
import PcProductDetailPopup from './product-detail-popup/pc-product-detail-popup.vue';
import ProductIframeLinkPopup from './product-iframe-link-popup/product-iframe-link-popup.vue';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);
</script>
