<!-- @file PC 端入口 -->
<template>
  <div class="c-pc-main g-pc-main-layout">
    <pc-force-auth
      v-if="shouldShowForceAuth"
      @hook:mounted="onPageMounted"
    />
    <pc-splash
      v-else-if="shouldShowSplash"
      @hook:mounted="onPageMounted"
    />
    <pc-watch
      v-else-if="watchPageInited"
      @hook:mounted="onPageMounted"
    />

    <!-- 风险测评 -->
    <pc-risk-evaluation v-if="iarSdkLoaded && iarUIV1Loaded" />
    <risk-evaluation-redirect-dialog />
    <!-- 风险确认函 -->
    <pc-risk-confirm-letter />

    <!-- 用户体系登录弹窗（引导页/观看页均可调起） -->
    <pc-identity-login-dialog-render
      v-if="watchUserSystemEnabled && sessionIdentity !== 'formal'"
    />
  </div>
</template>

<script setup lang="ts">
import '@/plugins/polyv-ui/pc-import';
import { defineAsyncComponent } from 'vue';
import {
  PcRiskEvaluation,
  RiskEvaluationRedirectDialog,
} from '@/components/page-watch-common/interactive-receive/risk-evaluation';
import PcRiskConfirmLetter from '@/components/common-business/risk-confirm-letter/pc-risk-confirm-letter.vue';

import { mainEnterEmits, useMainEnter } from './_hooks/use-main-enter';
import { usePageLayoutStyle } from './_hooks/use-page-layout-style';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useIdentityStore } from '@/store/use-identity-store';

const PcForceAuth = defineAsyncComponent(() => {
  return import(
    /* webpackChunkName: "pc-force-auth" */ '@/pages/force-auth/pc-force-auth/pc-force-auth.vue'
  );
});

const PcSplash = defineAsyncComponent(() => {
  return import(/* webpackChunkName: "pc-splash" */ '@/pages/splash/pc-splash/pc-splash.vue');
});

const PcWatch = defineAsyncComponent(() => {
  return import(/* webpackChunkName: "pc-watch" */ '@/pages/watch/pc-watch/pc-watch.vue');
});

const PcIdentityLoginDialogRender = defineAsyncComponent(() => {
  return import(
    /* webpackChunkName: "pc-identity-login-dialog" */ '@/components/common-business/watch-identity/identity-login-dialog-render/pc-identity-login-dialog-render.vue'
  );
});

const emit = defineEmits(mainEnterEmits());

const { onPageMounted } = useMainEnter({ emit });

const { iarSdkLoaded, iarUIV1Loaded } = storeDefinitionToRefs(useInteractReceiveStore);

const { watchUserSystemEnabled, sessionIdentity } = storeDefinitionToRefs(useIdentityStore);

usePageLayoutStyle();

const {
  shouldShowForceAuth,

  shouldShowSplash,
  watchPageInited,
} = storeDefinitionToRefs(useWatchAppStore);
</script>

<style lang="scss" src="@/assets/styles/pc.scss"></style>
