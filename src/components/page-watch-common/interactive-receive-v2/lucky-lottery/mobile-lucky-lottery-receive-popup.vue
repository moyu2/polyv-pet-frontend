<!-- 移动端平台抽奖中奖领取弹层 -->
<template>
  <iar-mobile-lucky-lottery-receive
    v-if="targetInited"
    :lucky-lottery-target="getIarTarget()"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { useLotteryTarget } from './use-lucky-lottery';

const { loadIarUI } = useIarUILoader('iar-lucky-lottery-ui');

const IarMobileLuckyLotteryReceive = defineAsyncComponent(() =>
  loadIarUI('mobile-lucky-lottery-receive'),
);

const { targetInited, getIarTarget } = useLotteryTarget();
</script>
