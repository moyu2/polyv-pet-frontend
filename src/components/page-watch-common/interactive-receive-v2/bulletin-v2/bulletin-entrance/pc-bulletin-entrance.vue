<template>
  <iar-pc-bulletin-entrance
    v-if="targetInited && announcementFunctionVisible && watchPageChatConnected"
    :bulletin-target="getIarTarget()"
  >
    <pc-icon-bulletin-two v-if="isChatUIV2" />
  </iar-pc-bulletin-entrance>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useIarUILoader } from '../../_load-iar-ui-v2';
import { useBulletin } from '../use-bulletin';
import { PcIconBulletinTwo } from '@/components/component-icons/pc/map';
import { useChatStore } from '@/store/use-chat-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

const { loadIarUI } = useIarUILoader('iar-bulletin-ui');

const IarPcBulletinEntrance = defineAsyncComponent(() => loadIarUI('pc-bulletin-entrance'));

const { announcementFunctionVisible } = storeDefinitionToRefs(useInteractReceiveStore);
const { watchPageChatConnected } = storeDefinitionToRefs(useWatchAppStore);
const { isChatUIV2 } = storeDefinitionToRefs(useChatStore);

const { targetInited, getIarTarget } = useBulletin();
</script>
