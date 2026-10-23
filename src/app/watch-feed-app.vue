<!-- @file 只打包竖屏移动端的版本给 feed 流使用 -->
<template>
  <div :id="uniqueId">
    <direct-business-page-entry
      v-if="directBusinessPageType"
      @hook:mounted="onLayoutMounted"
    />
    <template v-if="!directBusinessPageType && watchAppInited">
      <mobile-feed-main @page-mounted="onLayoutMounted" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useWatchApp } from './use-watch-app';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import DirectBusinessPageEntry from './layout/direct-business-page/direct-business-page-entry.vue';
import { useGlobalInject } from './use-global-inject';
// import { useCurrentWatchAppEffect } from '@/hooks/core/use-error-verify';

const { uniqueId } = useGlobalInject();

const MobileFeedMain = defineAsyncComponent(
  () =>
    import(/* webpackChunkName: "mobile-feed-main" */ './layout/main-enter/mobile-feed-main.vue'),
);

// eslint-disable-next-line no-unused-vars
const { onLayoutMounted, setupWatchApp } = useWatchApp();
// useCurrentWatchAppEffect(setupWatchApp);

const { directBusinessPageType, watchAppInited } = storeDefinitionToRefs(useWatchAppStore);
</script>

<style lang="scss" src="@/assets/styles/global.scss"></style>

<style lang="scss">
#app {
  width: 100%;
  height: 100%;
}
</style>
