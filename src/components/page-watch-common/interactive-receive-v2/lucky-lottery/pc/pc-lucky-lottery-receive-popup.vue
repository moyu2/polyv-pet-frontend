<!-- PC 平台抽奖中奖领取弹层 -->
<template>
  <div ref="popupRef">
    <iar-mobile-lucky-lottery-receive
      v-if="targetInited"
      :lucky-lottery-target="getIarTarget()"
      :popup-config="popupConfig"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, unref, computed } from 'vue';
import { useIarUILoader } from '../../_load-iar-ui-v2';
import { useLotteryTarget } from '../use-lucky-lottery';

const { loadIarUI } = useIarUILoader('iar-lucky-lottery-ui');

const IarMobileLuckyLotteryReceive = defineAsyncComponent(() =>
  loadIarUI('mobile-lucky-lottery-receive'),
);

const { targetInited, getIarTarget } = useLotteryTarget();

const popupRef = ref<HTMLElement>();

const popupConfig = computed(() => {
  return {
    position: 'right',
    appendTo: unref(popupRef),
    showModal: false,
  };
});
</script>
