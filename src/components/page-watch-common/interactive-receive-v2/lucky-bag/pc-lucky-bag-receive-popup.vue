<!-- PC 福袋中奖领取弹层 -->
<template>
  <div ref="popupRef">
    <lucky-bag-provider v-if="luckyBagUILoaded">
      <lucky-bag-receive :popup-config="popupConfig" />
    </lucky-bag-provider>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, unref } from 'vue';
import type { PolyvLuckyBagUIPkg } from '../_load-iar-ui-v2/pkg';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { LuckyBagProvider } from './lucky-bag-provider';

const { loadIarUIEntrance } = useIarUILoader('lucky-bag-ui-receive');

const LuckyBagReceive = defineAsyncComponent(async () => {
  const Pkg = await loadIarUIEntrance<typeof PolyvLuckyBagUIPkg>();
  return Pkg.LuckyBagReceive;
}) as unknown;

const luckyBagUILoaded = ref(false);

const popupRef = ref<HTMLElement>();

// PC 端挂到容器内右侧，不显示遮罩（对齐抽奖）
const popupConfig = computed(() => {
  return {
    position: 'right',
    appendTo: unref(popupRef),
    showModal: false,
  };
});

onMounted(async () => {
  await loadIarUIEntrance<typeof PolyvLuckyBagUIPkg>();
  luckyBagUILoaded.value = true;
});
</script>
