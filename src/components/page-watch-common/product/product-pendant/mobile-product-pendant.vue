<!-- 移动端商品库挂件 -->
<template>
  <mobile-product-pendant
    v-if="productTargetInited"
    :product-target="getProductTarget()"
    :before-click-interrupt="beforeClickInterrupt"
    :show-total="showTotal"
    :icon-url="iconUrl"
  />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useProductUILoader } from '../load-product-ui';
import { useProductUI } from '../hooks/use-product-ui';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { useThemeStore } from '@/store/use-theme-store';
import { useChannelStore } from '@/store/use-channel-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const themeStore = useThemeStore();

const { loadProductUI } = useProductUILoader();

const MobileProductPendant = defineAsyncComponent(() => loadProductUI('mobile-product-pendant'));

const { productTargetInited, getProductTarget } = useProductUI();

const { toInterruptUserClick } = useInterruptUserClick();

const { productIconConfig } = storeDefinitionToRefs(useChannelStore);

const showTotal = computed(() => {
  if (productIconConfig.value) {
    return productIconConfig.value.showProductCount;
  }

  if (themeStore.watchThemeStyleConfig) {
    return themeStore.watchThemeStyleConfig.common.chat.btn.cart.countVisible;
  }

  return true;
});

const iconUrl = computed(() => {
  if (productIconConfig.value) {
    return productIconConfig.value.url;
  }

  if (themeStore.watchThemeStyleConfig) {
    return themeStore.watchThemeStyleConfig.common.chat.btn.cart.iconUrl;
  }

  return '';
});

function beforeClickInterrupt() {
  return toInterruptUserClick({ triggerSource: 'mobile-product-pendant', ignoreSetNick: true });
}
</script>
