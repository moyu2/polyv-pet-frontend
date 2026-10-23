<!-- @file PC 端红包弹层 -->
<template>
  <iar-pc-red-envelope
    class="c-pc-redpack-dialog"
    :red-envelope-sdk="redpackSdk"
    :red-envelope-data="redpackData"
    :redirect-url="watchUrl"
    @close="onCloseRedpack"
  />
</template>

<script setup lang="ts">
import { useRedpack } from './hooks/use-redpack';

import { useChannelStore } from '@/store/use-channel-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';

const IarPcRedEnvelope = getIarComponent('PcRedEnvelope');

const { watchUrl } = storeDefinitionToRefs(useChannelStore);

const { redpackSdk, redpackData, onCloseRedpack } = useRedpack();
</script>
