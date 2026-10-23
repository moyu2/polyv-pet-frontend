<!-- @file PC 端弹幕 -->
<template>
  <div class="c-pc-barrage">
    <div
      ref="containerRef"
      class="c-pc-barrage__content"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { useBarrage } from './use-barrage';

const { containerRef } = useBarrage();
</script>

<style lang="scss">
.c-pc-barrage {
  position: absolute;
  top: 0;
  left: 0;
  z-index: $--zIndex-top - 2;
  width: 100%;
  height: 100%;
  overflow: hidden;
  // stylelint-disable-next-line
  text-shadow: rgba(#000, 0.8) 0 0 2px, rgba(#000, 0.8) 0 1px 0, rgba(#000, 0.8) 0 0 2px,
    rgba(#000, 0.8) 0 0 1px;
}
.c-pc-barrage__content {
  position: relative;
  height: 100%;
}
</style>
