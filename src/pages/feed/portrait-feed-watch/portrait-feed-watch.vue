<!-- @file feed 模式的竖屏观看页，依赖 portrait-watch 相关的组件 -->
<template>
  <div
    class="c-portrait-feed-watch"
    :style="wrapStyle"
  >
    <!-- 观看页主体布局 -->
    <portrait-feed-watch-layout />

    <!-- 观看页全局弹出层组件-延迟加载 -->
    <portrait-watch-layout-lazyload v-if="inSecondFeedLayout && layoutLoaded" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, unref } from 'vue';
import { CSSProperties } from 'vue/types/jsx';

import PortraitFeedWatchLayout from './layout/portrait-feed-watch-layout.vue';

import { useWatchPage } from '@/pages/watch/_hooks/use-watch-page';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useThemeStore } from '@/store/use-theme-store';
import { useLayoutLoad } from '@/hooks/core/use-layout-load';
import { useFeedInjectStore } from '@/store/use-feed-inject-store';

const { portraitPageBgUrl } = storeDefinitionToRefs(useThemeStore);

const { inSecondFeedLayout } = storeDefinitionToRefs(useFeedInjectStore);

const PortraitWatchLayoutLazyload = defineAsyncComponent(
  () =>
    import(
      /* webpackChunkName: "portrait-watch-layout-lazyload"  */ '@/pages/watch/portrait-watch/layout/portrait-watch-layout-lazyload.vue'
    ),
);

/** 外层样式 */
const wrapStyle = computed(() => {
  const style: CSSProperties = {};

  if (unref(portraitPageBgUrl)) {
    style.backgroundImage = `url(${unref(portraitPageBgUrl)})`;
    style.backgroundSize = 'cover';
  }

  return style;
});

useWatchPage();

const { layoutLoaded } = useLayoutLoad('portrait-feed-watch');
</script>

<style lang="scss">
html,
body {
  background-image: url(~@/pages/watch/portrait-watch/layout/images/portrait-bg.png);
}

.c-portrait-feed-watch {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-image: url(~@/pages/watch/portrait-watch/layout/images/portrait-bg.png);
  background-repeat: no-repeat;
  background-size: cover;
}

.c-portrait-watch__carousel-wrap {
  height: 100%;
}
</style>
