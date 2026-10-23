<!-- 移动端中奖记录列表 -->
<template>
  <iar-lottery-record
    v-if="targetInited"
    ref="recordRef"
    :lottery-target="getIarTarget()"
    :lottery-config="lotteryConfig"
    @record-list="onRecordList"
    @to-show="onShow"
    @to-close="onClose"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useLotteryTarget } from '../use-lottery-v2';
import { useLotteryRecordList } from './use-lottery-record-list';
import { useIarUILoader } from '../../_load-iar-ui-v2';

const { loadIarUI } = useIarUILoader('iar-lottery-ui');

const IarLotteryRecord = defineAsyncComponent(() => loadIarUI('lottery-record'));

const { targetInited, getIarTarget, lotteryConfig } = useLotteryTarget();

const { recordRef, onRecordList, onShow, onClose } = useLotteryRecordList();
</script>
