<!-- @file 移动端取消关联转播开始提示 -->
<template>
  <div class="c-mobile-transmit-switch-tips"></div>
</template>

<script setup lang="ts">
import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';
import { unref, watch } from 'vue';
import { useTransmitSwitchTip } from './use-transmit-switch-tip';
const { transmitSwitchTipVisible } = useTransmitSwitchTip();

const { toast } = useToastManager();

watch(
  () => unref(transmitSwitchTipVisible),
  () => {
    if (unref(transmitSwitchTipVisible)) {
      toast.success(translate('channel.transmitSwitch'));
    }
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss">
.c-mobile-transmit-switch-tips {
  display: none;
  pointer-events: none;
}
</style>
