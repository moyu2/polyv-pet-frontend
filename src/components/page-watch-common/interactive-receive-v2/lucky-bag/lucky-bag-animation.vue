<!-- 福袋动画 -->
<template>
  <lucky-bag-provider v-if="luckyBagUILoaded">
    <lucky-bag-animation-ui :schedule-animation="scheduleAnimation" />
  </lucky-bag-provider>
</template>

<script setup lang="ts">
import { useGlobalInject } from '@/app/use-global-inject';
import {
  scheduleActivityAnimation,
  type ActivityAnimationTask,
} from '@/components/page-watch-common/activity-animation-queue';
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import type { PolyvLuckyBagUIPkg } from '../_load-iar-ui-v2/pkg';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { LuckyBagProvider } from './lucky-bag-provider';

const { loadIarUIEntrance } = useIarUILoader('lucky-bag-ui-receive');
const { getWatchCore } = useGlobalInject();
const watchCore = getWatchCore();

const LuckyBagAnimationUi = defineAsyncComponent(async () => {
  const Pkg = await loadIarUIEntrance<typeof PolyvLuckyBagUIPkg>();
  return Pkg.LuckyBagAnimation;
}) as unknown;

const luckyBagUILoaded = ref(false);
let active = true;

function scheduleAnimation(animation: ActivityAnimationTask): Promise<void> {
  return scheduleActivityAnimation(watchCore, animation);
}

onMounted(async () => {
  try {
    await loadIarUIEntrance<typeof PolyvLuckyBagUIPkg>();
    if (active) {
      luckyBagUILoaded.value = true;
    }
  } catch (error) {
    console.error('[lucky-bag-ui] animation load failed', error);
  }
});

onBeforeUnmount(() => {
  active = false;
});
</script>
