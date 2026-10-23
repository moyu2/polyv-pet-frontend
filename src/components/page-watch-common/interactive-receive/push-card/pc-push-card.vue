<!-- @file 移动卡片推送 -->
<template>
  <iar-push-card
    append-body
    class="c-pc-push-card"
    internal
    :labels="labels"
    :popup-ad-sdk="popupAdSdk"
    :push-card-sdk="pushCardSdk"
    :get-link-params="getLinkParams"
    :custom-img-config="customImgConfig"
    @entry-visible-changed="onEntryVisibleChanged"
  />
</template>

<script setup lang="ts">
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { usePushCard } from './hooks/use-push-card';
import { useIarExternalLinkParams } from '../use-iar-external-link-params';

const IarPushCard = getIarComponent('PushCard');

const { pushCardSdk, popupAdSdk, labels, customImgConfig, onEntryVisibleChanged } = usePushCard();

const { getLinkParams } = useIarExternalLinkParams();
</script>
