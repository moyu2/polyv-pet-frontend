<!-- @file PC 端红包雨 -->
<template>
  <iar-pc-redpack-rain
    class="c-pc-redpack-rain"
    ref="redpackRainRef"
    :redpack-rain="redpackRainSdk"
    :redirect-url="watchUrl"
  />
</template>

<script setup lang="ts">
import { useRedpackRain } from './hooks/use-redpack-rain';

import { useChannelStore } from '@/store/use-channel-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';

const IarPcRedpackRain = getIarComponent('PcRedpackRain');

const { watchUrl } = storeDefinitionToRefs(useChannelStore);

const { redpackRainSdk, redpackRainRef } = useRedpackRain();
</script>
