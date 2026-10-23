<!-- @file 移动端互动大屏渲染组件 -->
<template>
  <div class="c-mobile-live-activity-render">
    <template v-if="rollingLotteryLoaded">
      <rolling-lottery-render />
      <mobile-rolling-lottery-receive-popup />
    </template>
    <shake-pk-render v-if="shakePkLoaded" />
  </div>
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLiveActivityStore } from '@/store/use-live-activity-store';
import MobileRollingLotteryReceivePopup from './rolling-lottery/mobile-rolling-lottery-receive-popup.vue';
import RollingLotteryRender from './rolling-lottery/rolling-lottery-render.vue';
import ShakePkRender from './shake-pk/shake-pk-render.vue';

const { rollingLotteryLoaded, shakePkLoaded } = storeDefinitionToRefs(useLiveActivityStore);
</script>
