<template>
  <div
    v-if="announcementFunctionVisible"
    @click="onClickAnnouncement"
  >
    <pc-icon-bulletin />
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { PcIconBulletin } from '@/components/component-icons/pc/map';

const { getEmitter } = useGlobalInject();

const { announcementFunctionVisible } = storeDefinitionToRefs(useInteractReceiveStore);

// 公告交互
function onClickAnnouncement() {
  getEmitter().emit(appEvents.interaction.OpenBulletinPopup);
}
</script>
