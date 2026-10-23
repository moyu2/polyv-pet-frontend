<!-- 移动端平台抽奖活动详情 -->
<template>
  <iar-mobile-lucky-lottery-detail-popup
    v-if="targetInited"
    :lucky-lottery-target="getIarTarget()"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { useLotteryTarget } from './use-lucky-lottery';

const { loadIarUI } = useIarUILoader('iar-lucky-lottery-ui');

const IarMobileLuckyLotteryDetailPopup = defineAsyncComponent(() =>
  loadIarUI('mobile-lucky-lottery-detail'),
);

const { targetInited, getIarTarget } = useLotteryTarget();
</script>
