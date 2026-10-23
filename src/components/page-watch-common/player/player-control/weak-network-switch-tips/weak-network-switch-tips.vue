<template>
  <span class="c-weak-network-switch-tips">
    <span v-if="isShowChangeLine || isShowChangeQuality"
      >{{ networkTips }}
      <span
        class="c-weak-network-switch-tips__switch"
        v-if="isShowChangeLine || isShowChangeQuality"
        @click="handleSwitch"
        >{{ $lang('player.tips.clickToSwitch') }}</span
      >
    </span>
    <span v-else> {{ $lang('player.tips.networkError') }} </span>
  </span>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useWeakNetworkSwitch } from './use-weak-network-switch';
import { translate } from '@/assets/lang';

const {
  updateWeakNetworkTips,
  isShowChangeLine,
  isShowChangeQuality,
  switchNextQuality,
  switchNextLine,
} = useWeakNetworkSwitch();

onMounted(() => {
  updateWeakNetworkTips();
});

const networkTips = computed(() => {
  const text = isShowChangeLine.value ? translate('player.line') : translate('player.quality');
  return `
    ${translate('player.tips.badNetworkTips') + text}
  `;
});

function handleSwitch() {
  if (isShowChangeLine.value) {
    switchNextLine();
  } else if (isShowChangeQuality.value) {
    switchNextQuality();
  }
}
</script>

<style lang="scss">
.c-weak-network-switch-tips__switch {
  padding: 0 3px;
  color: #3f76fc;
  cursor: pointer;
}
</style>
