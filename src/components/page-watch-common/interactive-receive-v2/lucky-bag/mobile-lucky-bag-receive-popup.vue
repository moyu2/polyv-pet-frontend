<!-- 移动端福袋中奖领取弹层 -->
<template>
  <lucky-bag-provider v-if="luckyBagUILoaded">
    <lucky-bag-receive />
  </lucky-bag-provider>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from 'vue';
import type { PolyvLuckyBagUIPkg } from '../_load-iar-ui-v2/pkg';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { LuckyBagProvider } from './lucky-bag-provider';

const { loadIarUIEntrance } = useIarUILoader('lucky-bag-ui-receive');

const LuckyBagReceive = defineAsyncComponent(async () => {
  const Pkg = await loadIarUIEntrance<typeof PolyvLuckyBagUIPkg>();
  return Pkg.LuckyBagReceive;
}) as unknown;

const luckyBagUILoaded = ref(false);

onMounted(async () => {
  await loadIarUIEntrance<typeof PolyvLuckyBagUIPkg>();
  luckyBagUILoaded.value = true;
});
</script>
