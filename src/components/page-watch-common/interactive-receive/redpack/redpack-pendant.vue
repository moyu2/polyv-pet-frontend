<!-- @file PC、移动、竖屏红包挂件 -->
<template>
  <iar-red-envelop-pendant
    class="c-redpack-pendant"
    :auto-toggle="true"
    :red-envelope-sdk="redpackSdk"
    :custom-img-config="customImgConfig"
    :auto-fetch-detail="interactSetting.redpackEnabled"
    @visible-changed="onEntryVisibleChanged"
  />
</template>

<script setup lang="ts">
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useRedpackPendant } from './hooks/use-redpack-pendant';

const IarRedEnvelopPendant = getIarComponent('RedEnvelopePendant');

const { interactSetting } = useInteractReceiveStore();

const { redpackSdk, customImgConfig, onEntryVisibleChanged } = useRedpackPendant();
</script>
