<!-- @file 移动端观看页 -->
<template>
  <div class="c-mobile-watch">
    <!-- 顶部引导条 -->
    <mobile-top-guide />

    <!-- 观看页主体布局 -->
    <mobile-watch-layout />

    <!-- 观看页全局弹出层组件-延迟加载 -->
    <mobile-watch-layout-lazyload v-if="layoutLoaded" />
  </div>
</template>

<script setup lang="ts">
import MobileTopGuide from '@/components/page-watch-common/top-guide/mobile-top-guide.vue';
import { defineAsyncComponent } from 'vue';
import MobileWatchLayout from './layout/mobile-watch-layout.vue';

import { usePvTrack } from '@/hooks/business/use-pv-track';
import { useLayoutLoad } from '@/hooks/core/use-layout-load';
import { useWatchPage } from '@/pages/watch/_hooks/use-watch-page';

const MobileWatchLayoutLazyload = defineAsyncComponent(
  () =>
    import(
      /* webpackChunkName: "mobile-watch-layout-lazyload" */ './layout/mobile-watch-layout-lazyload.vue'
    ),
);

useWatchPage();

usePvTrack('saas-web-watch-mobile');

const { layoutLoaded } = useLayoutLoad('mobile-watch');
</script>

<style lang="scss">
.c-mobile-watch {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.c-mobile-watch--no-flex {
  display: block;
}

// 增强系统全屏的样式， 仅移动端生效
.g-page-player-system-fullscreen {
  .c-mobile-watch {
    .c-mobile-watch-layout__player {
      top: 0 !important;
      z-index: 401;
      height: 100% !important;
    }

    .c-mobile-watch-layout__player__content {
      height: 100% !important;
      padding-bottom: 0 !important;
    }
  }
}
</style>
