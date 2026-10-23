<template>
  <div class="c-portrait__ask__tip">
    <mobile-icon-ask size="13"></mobile-icon-ask>
    <span class="c-portrait__ask__tip__text">{{ $lang('chat.ask.channel') }}</span>
  </div>
</template>

<script setup lang="ts">
import { MobileIconAsk } from '@/components/component-icons/mobile/map';
</script>

<style lang="scss">
.c-portrait__ask__tip {
  position: absolute;
  top: -35px;
  display: flex;
  align-items: center;
  padding: 6px 8px;
  background: #333333;
  border-radius: 14px;
  opacity: 0.6;
}
.c-portrait__ask__tip__text {
  padding-left: 4px;
  font-size: 14px;
}
</style>
