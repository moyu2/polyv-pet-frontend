<!-- @file 移动端入口 -->
<template>
  <div
    class="c-mobile-main"
    :class="{
      'c-mobile-main__portrait-pip':
        isSmallWindow && mobileWatchLayout === MobileWatchLayout.Portrait,
    }"
  >
    <template v-if="shouldShowForceAuth">
      <mobile-force-auth @hook:mounted="onPageMounted" />
    </template>

    <template v-else-if="shouldShowSplash">
      <mobile-splash
        v-if="mobileSplashLayout === MobileSplashLayout.Normal"
        @hook:mounted="onPageMounted"
      />
      <mobile-splash-full
        v-if="mobileSplashLayout === MobileSplashLayout.Large"
        @hook:mounted="onPageMounted"
      />
    </template>

    <template v-else-if="watchPageInited">
      <portrait-watch
        v-if="mobileWatchLayout === MobileWatchLayout.Portrait"
        @hook:mounted="onPageMounted"
      />
      <mobile-watch
        v-if="mobileWatchLayout === MobileWatchLayout.Normal"
        @hook:mounted="onPageMounted"
      />
    </template>

    <!-- 微信快照页提示 -->
    <mobile-weixin-snapshot-tips v-if="isWeixinSnapshotPageMode" />

    <!-- 风险测评 -->
    <mobile-risk-evaluation v-if="iarSdkLoaded && iarUIV1Loaded" />
    <risk-evaluation-redirect-dialog />

    <!-- 风险确认函 -->
    <mobile-risk-confirm-letter />

    <!-- 用户体系登录弹窗（引导页/观看页均可调起） -->
    <mobile-identity-login-dialog-render
      v-if="watchUserSystemEnabled && sessionIdentity !== 'formal'"
    />
  </div>
</template>

<script setup lang="ts">
import { MobileSplashLayout, MobileWatchLayout } from '@polyv/live-watch-sdk';
import { defineAsyncComponent } from 'vue';

import MobileRiskConfirmLetter from '@/components/common-business/risk-confirm-letter/mobile-risk-confirm-letter.vue';
import {
  MobileRiskEvaluation,
  RiskEvaluationRedirectDialog,
} from '@/components/page-watch-common/interactive-receive/risk-evaluation';
import MobileSplashFull from '@/pages/splash/mobile-splash/mobile-splash-full.vue';
import MobileSplash from '@/pages/splash/mobile-splash/mobile-splash.vue';

import { mainEnterEmits, useMainEnter } from './_hooks/use-main-enter';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useWeixinStore } from '@/store/use-weixin-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { useIdentityStore } from '@/store/use-identity-store';

const MobileIdentityLoginDialogRender = defineAsyncComponent(() => {
  return import(
    /* webpackChunkName: "mobile-identity-login-dialog" */ '@/components/common-business/watch-identity/identity-login-dialog-render/mobile-identity-login-dialog-render.vue'
  );
});

const MobileWeixinSnapshotTips = defineAsyncComponent(() => {
  return import(
    /* webpackChunkName: "mobile-weixin-snapshot-tips" */ '@/components/common-business/weixin-snapshot-tips/mobile-weixin-snapshot-tips.vue'
  );
});

const MobileForceAuth = defineAsyncComponent(() => {
  return import(
    /* webpackChunkName: "mobile-force-auth" */ '@/pages/force-auth/mobile-force-auth/mobile-force-auth.vue'
  );
});

const MobileWatchLoader = () => {
  return import(
    /* webpackChunkName: "watch-mobile" */ '@/pages/watch/mobile-watch/mobile-watch.vue'
  );
};
const MobileWatch = defineAsyncComponent(MobileWatchLoader);

const PortraitWatchLoader = () => {
  return import(
    /* webpackChunkName: "portrait-watch" */ '@/pages/watch/portrait-watch/portrait-watch.vue'
  );
};
const PortraitWatch = defineAsyncComponent(PortraitWatchLoader);

const emit = defineEmits(mainEnterEmits());

const {
  shouldShowForceAuth,

  shouldShowSplash,
  watchPageInited,
} = storeDefinitionToRefs(useWatchAppStore);

const { isWeixinSnapshotPageMode } = storeDefinitionToRefs(useWeixinStore);

const { mobileSplashLayout, mobileWatchLayout, isPortraitWatchLayout } =
  storeDefinitionToRefs(useLayoutStore);

const { iarSdkLoaded, iarUIV1Loaded } = storeDefinitionToRefs(useInteractReceiveStore);
const { isSmallWindow } = storeDefinitionToRefs(useWebviewStore);
const { watchUserSystemEnabled, sessionIdentity } = storeDefinitionToRefs(useIdentityStore);

const { onPageMounted } = useMainEnter({
  emit,
  watchLoader: () => {
    if (isPortraitWatchLayout.value) {
      return PortraitWatchLoader();
    } else {
      return MobileWatchLoader();
    }
  },
});
</script>

<style lang="scss" src="@/assets/styles/mobile.scss"></style>

<style lang="scss">
.c-mobile-main {
  width: 100%;
  height: 100%;
}

.c-mobile-main__portrait-pip {
  position: relative;
  z-index: $--zIndex-max-top;
}
</style>
