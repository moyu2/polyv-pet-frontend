<template>
  <iar-mobile-bulletin-entrance
    v-if="targetInited && announcementFunctionVisible && watchPageChatConnected"
    :bulletin-target="getIarTarget()"
    @click-entrance="closeMore"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent, inject } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useIarUILoader } from '../../_load-iar-ui-v2';
import { useBulletin } from '../use-bulletin';
import { MORE_POPUP_INJECT_KEY } from '@/components/page-watch-common/more-popup/mobile-more-popup/types';
import { useWatchAppStore } from '@/store/use-watch-app-store';

const { loadIarUI } = useIarUILoader('iar-bulletin-ui');

const IarMobileBulletinEntrance = defineAsyncComponent(() => loadIarUI('mobile-bulletin-entrance'));

const { closeMore } = inject(MORE_POPUP_INJECT_KEY)!;

const { announcementFunctionVisible } = storeDefinitionToRefs(useInteractReceiveStore);
const { watchPageChatConnected } = storeDefinitionToRefs(useWatchAppStore);

const { targetInited, getIarTarget } = useBulletin();
</script>
