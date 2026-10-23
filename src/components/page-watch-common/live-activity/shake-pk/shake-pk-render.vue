<!-- @file 竞技 PK 移动端唯一弹层入口。 -->
<template>
  <shake-pk-popup
    v-if="uiLoaded && shakePkTarget"
    :shake-pk-target="shakePkTarget"
    :withdraw-enabled="withdrawApplyEnabled"
    @view-prize="openLiveActivityReward"
    @withdraw="openWithdrawApply"
  />
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useWithdrawApplyEntry } from '@/components/page-watch-common/withdraw/_hooks/use-withdraw-apply-entry';
import type { PolyvShakePk } from '@polyv/live-watch-sdk';
import { defineAsyncComponent, onMounted, ref, shallowRef } from 'vue';
import { useShakePkUILoader } from '../_load-live-activity';

const { getEmitter, getWatchCore } = useGlobalInject();
const { loadShakePkUI } = useShakePkUILoader();
const { withdrawApplyEnabled, openWithdrawApply } = useWithdrawApplyEntry();

const ShakePkPopup = defineAsyncComponent(async () => {
  const Pkg = await loadShakePkUI();
  return Pkg.ShakePkPopup;
}) as unknown;

const shakePkTarget = shallowRef<PolyvShakePk.ShakePk>();
const uiLoaded = ref(false);

function openLiveActivityReward() {
  getEmitter().emit(appEvents.global.OpenPersonalRewardDialog, 'live-activity');
}

onMounted(async () => {
  try {
    const [, target] = await Promise.all([
      loadShakePkUI(),
      getWatchCore().liveActivity.getShakePkTarget(),
    ]);
    shakePkTarget.value = target;
    uiLoaded.value = true;
  } catch (error) {
    console.error('[shake-pk-ui] popup load failed', error);
  }
});
</script>
