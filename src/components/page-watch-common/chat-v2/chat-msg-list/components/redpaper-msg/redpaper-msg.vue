<!-- @file 聊天室红包消息 -->
<template>
  <div
    ref="wrapRef"
    class="c-redpaper-msg"
  >
    <iar-redpaper-entrance
      class="c-redpaper-msg__entrance"
      ref="entranceRef"
      :red-envelope-data="chatMsg"
      :red-envelope-sdk="redpackSdk"
      @open="openRedpackDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { redpapperMsgProps, useRedpaperMsg } from './use-redpaper-msg';

const props = defineProps(redpapperMsgProps());

const IarRedpaperEntrance = getIarComponent('RedEnvelopeEntrance');

const { chatMsg, redpackSdk, entranceRef, wrapRef, openRedpackDialog } = useRedpaperMsg({ props });
</script>

<style lang="scss">
.c-redpaper-msg__entrance {
  margin-top: 6px;
  cursor: pointer;
  border-radius: 8px !important;

  &::after {
    border-radius: 8px !important;
  }
}
</style>
