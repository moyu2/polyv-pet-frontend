<!-- 移动端平台抽奖活动列表 -->
<template>
  <iar-mobile-lucky-lottery-list-popup
    v-if="targetInited"
    :lucky-lottery-target="getIarTarget()"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useLotteryTarget } from './use-lucky-lottery';
import { useIarUILoader } from '../_load-iar-ui-v2';

const { loadIarUI } = useIarUILoader('iar-lucky-lottery-ui');

const IarMobileLuckyLotteryListPopup = defineAsyncComponent(() =>
  loadIarUI('mobile-lucky-lottery-list'),
);
const { targetInited, getIarTarget } = useLotteryTarget();
</script>
