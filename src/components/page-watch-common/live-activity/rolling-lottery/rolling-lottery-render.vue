<!-- @file 滚动抽奖详情和结果弹层统一渲染入口。 -->
<template>
  <rolling-lottery-provider
    v-if="uiLoaded && targetInited"
    :rolling-lottery-target="getRollingLotteryTarget()"
  >
    <div class="c-rolling-lottery-render">
      <rolling-lottery-detail-popup />
      <rolling-lottery-result-popup @view-prize="openLiveActivityReward" />
    </div>
  </rolling-lottery-provider>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRollingLotteryUILoader } from '../_load-live-activity';
import { RollingLotteryProvider } from './rolling-lottery-provider';
import { getRollingLotteryUiController, useRollingLotteryTarget } from './use-rolling-lottery';

const { getEmitter, getWatchCore } = useGlobalInject();
const { loadRollingLotteryUI } = useRollingLotteryUILoader();
const { targetInited, getRollingLotteryTarget } = useRollingLotteryTarget();

const RollingLotteryDetailPopup = defineAsyncComponent(async () => {
  const Pkg = await loadRollingLotteryUI();
  return Pkg.RollingLotteryDetailPopup;
}) as unknown;

const RollingLotteryResultPopup = defineAsyncComponent(async () => {
  const Pkg = await loadRollingLotteryUI();
  return Pkg.RollingLotteryResultPopup;
}) as unknown;

const uiLoaded = ref(false);
const controllerUnsubscribes: Array<() => void> = [];

function openLiveActivityReward() {
  getEmitter().emit(appEvents.global.OpenPersonalRewardDialog, 'live-activity');
}

onMounted(async () => {
  try {
    const Pkg = await loadRollingLotteryUI();
    const uiController = getRollingLotteryUiController(getWatchCore(), Pkg);
    controllerUnsubscribes.push(
      uiController.on('open-reward-records', () => {
        getEmitter().emit(appEvents.global.OpenPersonalRewardDialog, 'live-activity');
      }),
      uiController.on('close-reward-records', () => {
        getEmitter().emit(appEvents.global.ClosePersonalRewardDialog);
      }),
    );
    uiLoaded.value = true;
  } catch (error) {
    console.error('[rolling-lottery-ui] popup load failed', error);
  }
});

onBeforeUnmount(() => {
  controllerUnsubscribes.splice(0).forEach(unsubscribe => unsubscribe());
});
</script>
