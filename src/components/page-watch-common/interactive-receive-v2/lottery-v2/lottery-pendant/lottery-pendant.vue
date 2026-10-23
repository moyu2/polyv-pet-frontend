<!-- 抽奖挂件 -->
<template>
  <iar-lottery-pendant
    v-if="targetInited"
    :lottery-target="getIarTarget()"
    :lottery-config="lotteryConfig"
    :before-click-interrupt="beforeClickInterrupt"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useIarUILoader } from '../../_load-iar-ui-v2';
import { useLotteryPendant } from './use-lottery-pendant';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';

const { loadIarUI } = useIarUILoader('iar-lottery-ui');

const IarLotteryPendant = defineAsyncComponent(() => loadIarUI('lottery-pendant'));

const { targetInited, getIarTarget, lotteryConfig } = useLotteryPendant();

const { toInterruptUserClick } = useInterruptUserClick();

function beforeClickInterrupt() {
  return toInterruptUserClick({ triggerSource: 'lottery-pendant', ignoreSetNick: true });
}
</script>
