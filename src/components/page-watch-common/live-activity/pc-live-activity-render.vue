<!-- @file PC 端互动大屏渲染组件 -->
<template>
  <div class="c-pc-live-activity-render">
    <template v-if="rollingLotteryLoaded">
      <rolling-lottery-render />
      <pc-rolling-lottery-receive-popup />
    </template>
    <pc-shake-pk-qrcode-dialog v-if="shakePkLoaded" />
  </div>
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLiveActivityStore } from '@/store/use-live-activity-store';
import PcRollingLotteryReceivePopup from './rolling-lottery/pc-rolling-lottery-receive-popup.vue';
import RollingLotteryRender from './rolling-lottery/rolling-lottery-render.vue';
import PcShakePkQrcodeDialog from './shake-pk/pc-shake-pk-qrcode-dialog.vue';

const { rollingLotteryLoaded, shakePkLoaded } = storeDefinitionToRefs(useLiveActivityStore);
</script>
