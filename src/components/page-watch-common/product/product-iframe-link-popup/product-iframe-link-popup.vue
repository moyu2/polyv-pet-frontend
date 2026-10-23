<!-- 用于承载商品外链的 iframe 弹层 -->
<template>
  <product-iframe-link-popup v-if="productTargetInited" />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useProductUILoader } from '../load-product-ui';
import { useProductUI } from '../hooks/use-product-ui';

const { loadProductUI } = useProductUILoader();

const ProductIframeLinkPopup = defineAsyncComponent(() =>
  loadProductUI('product-iframe-link-popup'),
);

const { productTargetInited } = useProductUI();
</script>
