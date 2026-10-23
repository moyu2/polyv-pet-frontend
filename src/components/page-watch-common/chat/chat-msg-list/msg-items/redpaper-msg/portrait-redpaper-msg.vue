<!-- @file 竖屏端聊天室红包消息 -->
<template>
  <portrait-msg-container
    class="c-portrait-redpaper-msg"
    response-relax
    hide-bubble-style
  >
    <iar-redpaper-entrance
      class="c-portrait-redpaper-msg__entrance"
      ref="entranceRef"
      :red-envelope-data="chatMsg"
      :red-envelope-sdk="redpackSdk"
      :lang="currentLang"
      @open="openRedpackDialog"
    />
  </portrait-msg-container>
</template>

<script setup lang="ts">
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLangStore } from '@/store/use-lang-store';
import PortraitMsgContainer from '../_msg-container/portrait-msg-container.vue';
import { useRedpaperMsg } from './use-redpaper-msg';

const IarRedpaperEntrance = getIarComponent('RedEnvelopeEntrance');

const { currentLang } = storeDefinitionToRefs(useLangStore);

const { chatMsg, redpackSdk, entranceRef, openRedpackDialog } = useRedpaperMsg();
</script>

<style lang="scss">
.c-portrait-redpaper-msg__entrance {
  margin-top: 6px;
  cursor: pointer;
  border-radius: 8px !important;

  &::after {
    border-radius: 8px !important;
  }
}
</style>
