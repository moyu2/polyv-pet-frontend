<!-- @file pc端取消关联转播提示 -->
<template>
  <pc-dialog
    :visible.sync="transmitSwitchTipVisible"
    class="c-pc-transmit-switch-tips"
    :title="$lang('base.warmTips')"
    :width="360"
  >
    <div class="c-pc-transmit-switch-tips__content">
      <div class="c-pc-transmit-switch-tips__content__text">
        {{ $lang('channel.transmitSwitch') }}
      </div>
      <normal-button
        class="c-pc-transmit-switch-tips__content__button"
        :text="$lang('base.confirm')"
        :size="ButtonSize.Small"
        @click="reloadPage"
      />
    </div>
  </pc-dialog>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { ButtonSize } from '@/components/common-base/normal-button/types';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';

import { useTransmitSwitchTip } from './use-transmit-switch-tip';
const { transmitSwitchTipVisible, reloadPage } = useTransmitSwitchTip();
</script>

<style lang="scss">
.c-pc-transmit-switch-tips__content {
  padding: 40px 0;
  font-size: 14px;
  color: $--font-color-primary;
  text-align: center;
}
.c-pc-transmit-switch-tips__content__button {
  margin-top: 24px;
}
</style>
