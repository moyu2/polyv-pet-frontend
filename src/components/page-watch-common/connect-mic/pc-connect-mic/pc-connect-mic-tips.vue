<!-- @file PC 端连麦设备采集失败提示 -->
<template>
  <div class="c-pc-rtc__device_recover--failed">
    <pc-icon-warning-round-fill class="c-pc-rtc__device_recover--failed__icon" />
    <span>{{ $lang('connectMic.deviceAutoRecoverFailed.tips1') }}</span>
    <a
      :href="watchLink"
      rel="noopener"
      >{{ $lang('connectMic.deviceAutoRecoverFailed.tips2') }}</a
    >
    <span>{{ $lang('connectMic.deviceAutoRecoverFailed.tips3') }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PcIconWarningRoundFill } from '@/components/component-icons/pc/map';

const watchLink = computed(() => {
  return window.location.href;
});
</script>

<style lang="scss">
.c-pc-rtc__device_recover--failed {
  position: absolute;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  margin-top: 8px;
  font-size: 12px !important;
  color: #ffffff;
  letter-spacing: 0.51px;
  background: rgba(255, 103, 103, 1);
  border-radius: 4px;
  transform: translateX(-50%);

  .c-pc-rtc__device_recover--failed__icon {
    display: flex;
    margin-right: 8px;
    font-size: 16px !important;
  }

  a {
    color: #3082fe;
    text-decoration: none;
  }
}
</style>
