<!-- @file 移动端滚动抽奖领奖弹层。 -->
<template>
  <rolling-lottery-provider
    v-if="uiLoaded && targetInited"
    :rolling-lottery-target="getRollingLotteryTarget()"
  >
    <rolling-lottery-receive />
  </rolling-lottery-provider>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from 'vue';
import { useRollingLotteryUILoader } from '../_load-live-activity';
import { RollingLotteryProvider } from './rolling-lottery-provider';
import { useRollingLotteryTarget } from './use-rolling-lottery';

const { loadRollingLotteryUI } = useRollingLotteryUILoader();
const { targetInited, getRollingLotteryTarget } = useRollingLotteryTarget();

const RollingLotteryReceive = defineAsyncComponent(async () => {
  const Pkg = await loadRollingLotteryUI();
  return Pkg.RollingLotteryReceive;
}) as unknown;

const uiLoaded = ref(false);

onMounted(async () => {
  try {
    await loadRollingLotteryUI();
    uiLoaded.value = true;
  } catch (error) {
    console.error('[rolling-lottery-ui] mobile receive popup load failed', error);
  }
});
</script>
