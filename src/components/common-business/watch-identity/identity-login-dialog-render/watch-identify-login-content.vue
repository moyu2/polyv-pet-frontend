<template>
  <watch-identify-login-page
    :popup-visible="visible"
    :display-mode="displayMode"
    :wx-auto-auth-enabled="wxAutoAuthEnabled"
    :direct-auth-params="identityStore.getDirectAuthParams()"
    :after-guest-auth-success="afterGuestAuthSuccess"
    @success="onLoginSuccess"
    @fail="onLoginFail"
    @popup-close="onPopupClose"
  />
</template>

<script lang="ts" setup>
import { useWatchIdentifySDKSceneLoader } from '@/plugins/external-lib-loaders/load-watch-identify-ui-default';
import { isMobile } from '@/assets/utils/browser';
import { defineComponent } from 'vue';
import { useIdentityStore } from '@/store/use-identity-store';
import { ErrorVerifyType, useErrorVerify } from '@/hooks/core/use-error-verify';
import { PropUtils, emitFunc } from '@polyv/vue-components';
import { useQueryParams } from '@/hooks/core/use-query-params';

const { removeQueryParam } = useQueryParams();

const { getMobilePolyvWatchIdentifySDKSceneComponent, getPcPolyvWatchIdentifySDKSceneComponent } =
  useWatchIdentifySDKSceneLoader();

const WatchIdentifyLoginPage = defineComponent(() => {
  const MobileWatchIdentifyLoginPage = () =>
    getMobilePolyvWatchIdentifySDKSceneComponent('MobileWatchIdentifyLoginPage');

  const PcWatchIdentifyLoginPage = () =>
    getPcPolyvWatchIdentifySDKSceneComponent('PcWatchIdentifyLoginPage');

  return isMobile ? MobileWatchIdentifyLoginPage() : PcWatchIdentifyLoginPage();
});

defineProps({
  visible: PropUtils.bool.def(true),
  displayMode: PropUtils.string.def('page'),
  wxAutoAuthEnabled: PropUtils.bool.def(true),
  afterGuestAuthSuccess: PropUtils.func<() => Promise<void>>(),
});

const emits = defineEmits({
  'popup-close': emitFunc<void>(),
});

function onPopupClose() {
  emits('popup-close');
}

const { redirectToErrorVerify } = useErrorVerify();
const identityStore = useIdentityStore();

function onLoginSuccess() {
  removeQueryParam(['forceUserAuth']);
  // 成功提交后刷新当前页面即可
  window.location.reload();
}

function onLoginFail() {
  redirectToErrorVerify({
    errorType: ErrorVerifyType.AuthFail,
  });
}
</script>
