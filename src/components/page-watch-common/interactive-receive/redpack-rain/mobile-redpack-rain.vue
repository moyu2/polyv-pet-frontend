<!-- @file 移动端+竖屏端红包雨 -->
<template>
  <iar-mobile-redpack-rain
    class="c-mobile-redpack-rain"
    ref="redpackRainRef"
    :redpack-rain="redpackRainSdk"
    :custom-img-config="customImgConfig"
    :with-draw-enabled="withdrawVisible"
    :redirect-url="watchUrl"
    :unit="scoreUnit"
    @copy-success="toastCopySuccess"
    @state-change="onStateChange"
    @visible-change="onVisibleChange"
    @click-withdraw="onClickWithdraw"
    @click-point-record="onClickScoreRecord"
  />
</template>

<script setup lang="ts">
import { useCopyText } from '@/assets/utils/copy';
import { useWithdrawStore } from '@/store/use-withdraw-store';
import { useRedpackRain } from './hooks/use-redpack-rain';

import { useChannelStore } from '@/store/use-channel-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useRedpackStore } from '@/store/use-redpack-store';

const { toastCopySuccess } = useCopyText();

const IarMobileRedpackRain = getIarComponent('MobileRedpackRain');

const { watchUrl } = storeDefinitionToRefs(useChannelStore);

const { scoreUnit } = storeDefinitionToRefs(useRedpackStore);

const { withdrawVisible } = storeDefinitionToRefs(useWithdrawStore);

const {
  redpackRainSdk,
  customImgConfig,
  redpackRainRef,
  onStateChange,
  onVisibleChange,
  onClickWithdraw,
  onClickScoreRecord,
} = useRedpackRain();
</script>
