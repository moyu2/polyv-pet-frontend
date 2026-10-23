<!-- @file 滚动抽奖活动到达动效。 -->
<template>
  <rolling-lottery-provider
    v-if="uiLoaded && (rollingLotteryTarget || shakePkTarget)"
    :rolling-lottery-target="rollingLotteryTarget"
    :shake-pk-target="shakePkTarget"
  >
    <rolling-lottery-animation-ui :schedule-animation="scheduleAnimation" />
  </rolling-lottery-provider>
</template>

<script setup lang="ts">
import { useGlobalInject } from '@/app/use-global-inject';
import {
  scheduleActivityAnimation,
  type ActivityAnimationTask,
} from '@/components/page-watch-common/activity-animation-queue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLiveActivityStore } from '@/store/use-live-activity-store';
import type { PolyvShakePk } from '@polyv/live-watch-sdk';
import {
  computed,
  defineAsyncComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue';
import { useRollingLotteryUILoader } from '../_load-live-activity';
import { RollingLotteryProvider } from './rolling-lottery-provider';
import { useRollingLotteryTarget } from './use-rolling-lottery';

const { getWatchCore } = useGlobalInject();
const { shakePkLoaded } = storeDefinitionToRefs(useLiveActivityStore);
const { loadRollingLotteryUI } = useRollingLotteryUILoader();
const { targetInited, getRollingLotteryTarget } = useRollingLotteryTarget();
const watchCore = getWatchCore();

const RollingLotteryAnimationUi = defineAsyncComponent(async () => {
  const Pkg = await loadRollingLotteryUI();
  return Pkg.RollingLotteryAnimation;
}) as unknown;

const uiLoaded = ref(false);
const shakePkTarget = shallowRef<PolyvShakePk.ShakePk>();
const rollingLotteryTarget = computed(() =>
  targetInited.value ? getRollingLotteryTarget() : undefined,
);
let active = true;

function scheduleAnimation(animation: ActivityAnimationTask): Promise<void> {
  return scheduleActivityAnimation(watchCore, animation);
}

async function loadShakePkTarget(): Promise<void> {
  if (shakePkTarget.value) {
    return;
  }
  try {
    shakePkTarget.value = await watchCore.liveActivity.getShakePkTarget();
  } catch (error) {
    console.error('[shake-pk-sdk] shared arrival animation target load failed', error);
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
    if (active) {
      uiLoaded.value = true;
    }
  } catch (error) {
    console.error('[rolling-lottery-ui] animation load failed', error);
  }
});

onBeforeUnmount(() => {
  active = false;
});
</script>
