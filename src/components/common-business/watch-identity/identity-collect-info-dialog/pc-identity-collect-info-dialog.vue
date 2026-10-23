<template>
  <watch-identify-collect-info-dialog
    v-if="renderEnabled"
    ref="dialogInstance"
    :auto-open="autoOpen"
  />
</template>

<script lang="ts" setup>
import { useWatchIdentifySDKSceneLoader } from '@/plugins/external-lib-loaders/load-watch-identify-ui-default';
import { defineComponent } from 'vue';
import { useIdentityCollectInfo } from './use-identity-collect-info';

const { getPcPolyvWatchIdentifySDKSceneComponent } = useWatchIdentifySDKSceneLoader();

const WatchIdentifyCollectInfoDialog = defineComponent(() => {
  return getPcPolyvWatchIdentifySDKSceneComponent('PcWatchIdentifyCollectInfoDialog');
});

const {
  renderEnabled,
  dialogInstance,

  autoOpen,
} = useIdentityCollectInfo();
</script>
