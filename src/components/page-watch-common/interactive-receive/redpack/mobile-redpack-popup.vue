<!-- @file 移动端+竖屏端红包弹层 -->
<template>
  <iar-mobile-red-envelope
    class="c-mobile-redpack-popup"
    :red-envelope-sdk="redpackSdk"
    :red-envelope-data="redpackData"
    :custom-img-config="customImgConfig"
    :open-id="openId"
    :with-draw-enabled="withdrawVisible"
    :redirect-url="watchUrl"
    :unit="scoreUnit"
    :is-full-screen="isIarFullScreen"
    @copy-success="toastCopySuccess"
    @to-show="onShowRedpack"
    @close="onCloseRedpack"
    @status-change="onStatusChange"
    @click-withdraw="onClickWithdraw"
    @click-point-record="onClickScoreRecord"
    @received="onPasswordReceived"
  />
</template>

<script setup lang="ts">
import { useCopyText } from '@/assets/utils/copy';
import { useWithdrawStore } from '@/store/use-withdraw-store';
import { useRedpack } from './hooks/use-redpack';

import { useChannelStore } from '@/store/use-channel-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useRedpackStore } from '@/store/use-redpack-store';

const { toastCopySuccess } = useCopyText();

const IarMobileRedEnvelope = getIarComponent('MobileRedEnvelope');

const { watchUrl } = storeDefinitionToRefs(useChannelStore);

const { openId } = storeDefinitionToRefs(useViewerStore);

const { scoreUnit } = storeDefinitionToRefs(useRedpackStore);

const { isIarFullScreen } = storeDefinitionToRefs(useInteractReceiveStore);

const { withdrawVisible } = storeDefinitionToRefs(useWithdrawStore);

const {
  redpackSdk,
  redpackData,
  customImgConfig,
  onShowRedpack,
  onCloseRedpack,
  onStatusChange,
  onClickWithdraw,
  onClickScoreRecord,
  onPasswordReceived,
} = useRedpack();
</script>
