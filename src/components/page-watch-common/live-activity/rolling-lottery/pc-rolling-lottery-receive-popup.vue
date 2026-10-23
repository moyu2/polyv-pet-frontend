<!-- @file PC 端滚动抽奖领奖弹层。 -->
<template>
  <div ref="popupRef">
    <rolling-lottery-provider
      v-if="uiLoaded && targetInited"
      :rolling-lottery-target="getRollingLotteryTarget()"
    >
      <rolling-lottery-receive :popup-config="popupConfig" />
    </rolling-lottery-provider>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, unref } from 'vue';
import { useRollingLotteryUILoader } from '../_load-live-activity';
import { RollingLotteryProvider } from './rolling-lottery-provider';
import { useRollingLotteryTarget } from './use-rolling-lottery';

const { loadRollingLotteryUI } = useRollingLotteryUILoader();
const { targetInited, getRollingLotteryTarget } = useRollingLotteryTarget();

const RollingLotteryReceive = defineAsyncComponent(async () => {
  const Pkg = await loadRollingLotteryUI();
  return Pkg.RollingLotteryReceive;
}) as unknown;

const uiLoaded = ref(false);
const popupRef = ref<HTMLElement>();

const popupConfig = computed(() => ({
  position: 'right',
  appendTo: unref(popupRef),
  showModal: false,
}));

onMounted(async () => {
  try {
    await loadRollingLotteryUI();
    uiLoaded.value = true;
  } catch (error) {
    console.error('[rolling-lottery-ui] PC receive popup load failed', error);
  }
});
</script>
