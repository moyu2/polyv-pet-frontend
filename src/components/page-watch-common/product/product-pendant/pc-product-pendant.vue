<!-- PC 商品库挂件 -->
<template>
  <div class="c-pc-product-pendant">
    <pc-product-pendant
      v-if="targetInited"
      :product-target="getProductTarget()"
      :before-click-interrupt="beforeClickInterrupt"
      :icon-url="iconUrl"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { PolyvProduct } from '@polyv/live-watch-sdk';
import { useProductUILoader } from '../load-product-ui';
import { useGlobalInject } from '@/app/use-global-inject';
import { useIarTarget } from '@/components/page-watch-common/interactive-receive-v2/_hooks/use-iar-target';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { useThemeStore } from '@/store/use-theme-store';
import { useChannelStore } from '@/store/use-channel-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const themeStore = useThemeStore();

const { getWatchCore } = useGlobalInject();

const watchCore = getWatchCore();

const { targetInited, getIarTarget: getProductTarget } = useIarTarget<PolyvProduct>(() => {
  return watchCore.product.getProductTarget();
});

const { loadProductUI } = useProductUILoader();

const PcProductPendant = defineAsyncComponent(() => loadProductUI('pc-product-pendant'));

const { toInterruptUserClick } = useInterruptUserClick();

const { productIconConfig } = storeDefinitionToRefs(useChannelStore);

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
  return toInterruptUserClick({ triggerSource: 'pc-product-pendant', ignoreSetNick: true });
}
</script>

<style lang="scss">
.c-pc-product-pendant {
  .plv-product-pc-pendant {
    pointer-events: initial;
  }

  .plv-product-pc-pendant--collapsed {
    transform: translateX(16px);
  }
}
</style>
