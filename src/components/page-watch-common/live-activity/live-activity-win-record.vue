<!-- @file 我的奖励-互动大屏 -->
<template>
  <rolling-lottery-provider
    v-if="uiLoaded && targetInited"
    :rolling-lottery-target="getRollingLotteryTarget()"
  >
    <live-activity-win-record-ui
      ref="winRecordRef"
      @to-show="onToShow"
      @to-close="onToClose"
    />
  </rolling-lottery-provider>
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { defineAsyncComponent, onMounted, ref } from 'vue';
import { useRollingLotteryUILoader } from './_load-live-activity';
import { RollingLotteryProvider } from './rolling-lottery/rolling-lottery-provider';
import { useRollingLotteryTarget } from './rolling-lottery/use-rolling-lottery';

interface WinRecordExpose {
  refresh(): void;
}

const { loadRollingLotteryUI } = useRollingLotteryUILoader();
const { targetInited, getRollingLotteryTarget } = useRollingLotteryTarget();
const { getEmitter } = useGlobalInject();
const { toInterruptUserClick } = useInterruptUserClick();

const LiveActivityWinRecordUi = defineAsyncComponent(async () => {
  const Pkg = await loadRollingLotteryUI();
  return Pkg.LiveActivityWinRecord;
});

const uiLoaded = ref(false);
const winRecordRef = ref<WinRecordExpose>();
useEventBusListener(appEvents.liveActivity.RefreshLiveActivityWinRecord, () => {
  winRecordRef.value?.refresh();
});

function onToShow() {
  if (
    toInterruptUserClick({
      triggerSource: 'personal-reward',
      ignoreSetNick: true,
    })
  ) {
    return;
  }
  getEmitter().emit(appEvents.global.OpenPersonalRewardDialog, 'live-activity');
}

function onToClose() {
  getEmitter().emit(appEvents.global.ClosePersonalRewardDialog);
}

onMounted(async () => {
  try {
    await loadRollingLotteryUI();
    uiLoaded.value = true;
  } catch (error) {
    console.error('[rolling-lottery-ui] live activity win record load failed', error);
  }
});
</script>
