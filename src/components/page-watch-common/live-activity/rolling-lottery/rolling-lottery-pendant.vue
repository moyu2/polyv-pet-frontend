<!-- @file 滚动抽奖页面级常驻挂件。 -->
<template>
  <rolling-lottery-provider
    v-if="uiLoaded && (rollingLotteryTarget || shakePkTarget)"
    :rolling-lottery-target="rollingLotteryTarget"
    :shake-pk-target="shakePkTarget"
  >
    <rolling-lottery-pendant-ui />
  </rolling-lottery-provider>
</template>

<script setup lang="ts">
import { useGlobalInject } from '@/app/use-global-inject';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLiveActivityStore } from '@/store/use-live-activity-store';
import type { PolyvShakePk } from '@polyv/live-watch-sdk';
import { computed, defineAsyncComponent, onMounted, ref, shallowRef, watch } from 'vue';
import { useRollingLotteryUILoader } from '../_load-live-activity';
import { RollingLotteryProvider } from './rolling-lottery-provider';
import { useRollingLotteryTarget } from './use-rolling-lottery';

const { getWatchCore } = useGlobalInject();
const { shakePkLoaded } = storeDefinitionToRefs(useLiveActivityStore);
const { loadRollingLotteryUI } = useRollingLotteryUILoader();
const { targetInited, getRollingLotteryTarget } = useRollingLotteryTarget();

const RollingLotteryPendantUi = defineAsyncComponent(async () => {
  const Pkg = await loadRollingLotteryUI();
  return Pkg.RollingLotteryPendant;
}) as unknown;

const uiLoaded = ref(false);
const shakePkTarget = shallowRef<PolyvShakePk.ShakePk>();
const rollingLotteryTarget = computed(() =>
  targetInited.value ? getRollingLotteryTarget() : undefined,
);

async function loadShakePkTarget(): Promise<void> {
  if (shakePkTarget.value) {
    return;
  }
  try {
    shakePkTarget.value = await getWatchCore().liveActivity.getShakePkTarget();
  } catch (error) {
    console.error('[shake-pk-sdk] shared pendant target load failed', error);
  }
}

watch(
  shakePkLoaded,
  loaded => {
    if (loaded) {
      loadShakePkTarget().catch(() => undefined);
    }
  },
  { immediate: true },
);

onMounted(async () => {
  try {
    await loadRollingLotteryUI();
    uiLoaded.value = true;
  } catch (error) {
    console.error('[rolling-lottery-ui] pendant load failed', error);
  }
});
</script>
