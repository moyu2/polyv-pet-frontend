<!-- @file 移动端 feed 流页面入口，只处理竖屏，正常情况下是由 feed 容器授权完成后再直接进入观看页的 -->
<template>
  <div class="c-mobile-main">
    <template v-if="shouldShowForceAuth">
      <div class="c-mobile-main-blank-container">
        <div class="c-mobile-main-blank">请先通过微信授权后再观看此直播间</div>
      </div>
    </template>

    <template v-else-if="shouldShowSplash">
      <div class="c-mobile-main-blank-container">
        <div class="c-mobile-main-blank">暂不支持观看此直播间</div>
      </div>
    </template>

    <template v-else-if="watchPageInited">
      <portrait-feed-watch
        v-if="mobileWatchLayout === MobileWatchLayout.Portrait"
        @hook:mounted="onPageMounted"
      />
      <div
        v-else
        class="c-mobile-main-blank-container"
      >
        <div class="c-mobile-main-blank">请联系运营人员更改观看模板</div>
      </div>
    </template>

    <!-- 风险测评 -->
    <!-- <mobile-risk-evaluation v-if="iarSdkLoaded" /> -->
    <!-- <risk-evaluation-redirect-dialog /> -->
    <!-- 风险确认函 -->
    <mobile-risk-confirm-letter />
  </div>
</template>

<script setup lang="ts">
import { MobileWatchLayout } from '@polyv/live-watch-sdk';
import { defineAsyncComponent, onMounted } from 'vue';

import MobileRiskConfirmLetter from '@/components/common-business/risk-confirm-letter/mobile-risk-confirm-letter.vue';
// import {
//   MobileRiskEvaluation,
//   RiskEvaluationRedirectDialog,
// } from '@/components/page-watch-common/interactive-receive/risk-evaluation';
// import MobileSplashFull from '@/pages/splash/mobile-splash/mobile-splash-full.vue';
// import MobileSplash from '@/pages/splash/mobile-splash/mobile-splash.vue';

import { mainEnterEmits, useMainEnter } from './_hooks/use-main-enter';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
// import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const PortraitWatchLoader = () => {
  return import(
    /* webpackChunkName: "portrait-feed-watch" */ '@/pages/feed/portrait-feed-watch/portrait-feed-watch.vue'
  );
};
const PortraitFeedWatch = defineAsyncComponent(PortraitWatchLoader);

const emit = defineEmits(mainEnterEmits());

const {
  shouldShowForceAuth,

  shouldShowSplash,
  watchPageInited,
} = storeDefinitionToRefs(useWatchAppStore);

const { mobileWatchLayout } = storeDefinitionToRefs(useLayoutStore);

// const { iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);

const { onPageMounted } = useMainEnter({
  emit,
  watchLoader: () => {
    return PortraitWatchLoader();
  },
});

onMounted(() => {
  // 处理没有正常进入观看页的情况
  if (!watchPageInited.value) {
    onPageMounted();
  }
});
</script>

<style lang="scss" src="@/assets/styles/mobile.scss"></style>

<style lang="scss">
.c-mobile-main {
  width: 100%;
  height: 100%;
}

.c-mobile-main-blank-container {
  width: 100%;
  height: 100%;
  .c-mobile-main-blank {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    font-size: 16px;
    color: $--color-white;
    background: rgb(19, 36, 76);
  }
}
</style>
