<!-- 福袋入口挂件 -->
<template>
  <lucky-bag-provider v-if="luckyBagUILoaded">
    <lucky-bag-pendant />
  </lucky-bag-provider>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from 'vue';
import type { PolyvLuckyBagUIPkg } from '../_load-iar-ui-v2/pkg';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { LuckyBagProvider } from './lucky-bag-provider';

const { loadIarUIEntrance } = useIarUILoader('lucky-bag-ui-receive');

const LuckyBagPendant = defineAsyncComponent(async () => {
  const Pkg = await loadIarUIEntrance<typeof PolyvLuckyBagUIPkg>();
  return Pkg.LuckyBagPendant;
}) as unknown;

const luckyBagUILoaded = ref(false);

onMounted(async () => {
  await loadIarUIEntrance<typeof PolyvLuckyBagUIPkg>();
  luckyBagUILoaded.value = true;
});
</script>
