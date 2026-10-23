<!-- @file 移动卡片推送 -->
<template>
  <iar-push-card
    append-body
    class="c-mobile-push-card"
    internal
    :labels="labels"
    :popup-ad-sdk="popupAdSdk"
    :push-card-sdk="pushCardSdk"
    :is-full-screen="isIarFullScreen"
    :get-link-params="getLinkParams"
    :get-weixin-sdk="getWeixinSdk"
    :custom-img-config="customImgConfig"
    @visible-changed="onPushCardVisibleChanged"
    @entry-visible-changed="onEntryVisibleChanged"
  />
</template>

<script setup lang="ts">
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { usePushCard } from './hooks/use-push-card';
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';
import { useIarExternalLinkParams } from '../use-iar-external-link-params';

const { getWeixinSdk } = useWeixinSdk();

const IarPushCard = getIarComponent('PushCard');

const { isIarFullScreen } = storeDefinitionToRefs(useInteractReceiveStore);

const {
  pushCardSdk,
  popupAdSdk,
  labels,
  customImgConfig,
  onEntryVisibleChanged,
  onPushCardVisibleChanged,
} = usePushCard();

const { getLinkParams } = useIarExternalLinkParams();
</script>
