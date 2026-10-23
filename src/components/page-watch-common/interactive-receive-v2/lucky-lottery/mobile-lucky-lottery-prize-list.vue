<!-- 移动端平台抽奖活动列表 -->
<template>
  <iar-mobile-lucky-lottery-prize-list
    v-if="targetInited"
    ref="prizeListRef"
    :lucky-lottery-target="getIarTarget()"
    @to-show="onShow"
    @to-close="onClose"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue';
import { useLotteryTarget } from './use-lucky-lottery';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { appEvents, useEventBusListener } from '@/app/app-events';
import type { LotteryRecordInstance } from '@polyv/iar-lucky-lottery-ui';
import { useGlobalInject } from '@/app/use-global-inject';

const { loadIarUI } = useIarUILoader('iar-lucky-lottery-ui');

const IarMobileLuckyLotteryPrizeList = defineAsyncComponent(() =>
  loadIarUI('mobile-lucky-lottery-prize-list'),
);
const { targetInited, getIarTarget } = useLotteryTarget();

const { getEmitter } = useGlobalInject();

const prizeListRef = ref<LotteryRecordInstance>();

useEventBusListener(appEvents.iar.RefreshLuckyLotteryPrizeList, () => {
  prizeListRef.value?.refreshPrizeList();
});

function onShow() {
  getEmitter().emit(appEvents.iar.OpenLuckyLotteryPrizeListDialog);
}

function onClose() {
  getEmitter().emit(appEvents.global.ClosePersonalRewardDialog);
}
</script>
