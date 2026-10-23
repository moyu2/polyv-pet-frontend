<!-- @file PC 端观看页 -->
<template>
  <div class="c-pc-watch">
    <!-- 观看页主体布局 -->
    <pc-watch-layout />

    <!-- 观看页全局弹出层组件-延迟加载 -->
    <pc-watch-layout-lazyload v-if="layoutLoaded" />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import PcWatchLayout from './layout/pc-watch-layout.vue';

import { useWatchPage } from '@/pages/watch/_hooks/use-watch-page';
import { usePvTrack } from '@/hooks/business/use-pv-track';
import { useLayoutLoad } from '@/hooks/core/use-layout-load';

const PcWatchLayoutLazyload = defineAsyncComponent(
  () =>
    import(
      /* webpackChunkName: "pc-watch-layout-lazyload" */ './layout/pc-watch-layout-lazyload.vue'
    ),
);

useWatchPage();

usePvTrack('saas-web-watch-pc');

const { layoutLoaded } = useLayoutLoad('pc-watch');
</script>

<style lang="scss">
.c-pc-watch {
  min-height: 100vh;
}
</style>
