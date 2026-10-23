<!-- @file 竖屏观看页 -->
<template>
  <div class="c-portrait-watch pws-theme-portrait-bg pws-theme-mask-bg">
    <background-section
      :background-type="themeSetting.portraitBackgroundType"
      :default-url="defaultPortraitPageBgUrl"
      :custom-url="portraitPageBgUrl"
    />

    <!-- 顶部引导条 -->
    <mobile-top-guide />

    <!-- 观看页主体布局 -->
    <portrait-watch-layout />

    <!-- 观看页全局弹出层组件-延迟加载 -->
    <portrait-watch-layout-lazyload v-if="layoutLoaded" />

    <!-- 全屏水印 -->
    <fullscreen-watermark />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

import MobileTopGuide from '@/components/page-watch-common/top-guide/mobile-top-guide.vue';
import PortraitWatchLayout from './layout/portrait-watch-layout.vue';
import BackgroundSection from '@/components/common-business/background-section/background-section.vue';
import FullscreenWatermark from '@/components/common-business/watermark/fullscreen-watermark.vue';

import { usePvTrack } from '@/hooks/business/use-pv-track';
import { useLayoutLoad } from '@/hooks/core/use-layout-load';
import { useWatchPage } from '@/pages/watch/_hooks/use-watch-page';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useThemeStore } from '@/store/use-theme-store';

const PortraitWatchLayoutLazyload = defineAsyncComponent(
  () =>
    import(
      /* webpackChunkName: "portrait-watch-layout-lazyload"  */ './layout/portrait-watch-layout-lazyload.vue'
    ),
);

useWatchPage();

usePvTrack('saas-web-watch-portrait');

const { layoutLoaded } = useLayoutLoad('portrait-watch');

const { themeSetting, defaultPortraitPageBgUrl, portraitPageBgUrl } =
  storeDefinitionToRefs(useThemeStore);
</script>

<style lang="scss">
html,
body {
  background-image: url(./layout/images/portrait-bg.png);
}

.c-portrait-watch {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-image: url(./layout/images/portrait-bg.png);
  background-repeat: no-repeat;
  background-size: cover;
}

.c-portrait-watch__carousel-wrap {
  height: 100%;
}
</style>
