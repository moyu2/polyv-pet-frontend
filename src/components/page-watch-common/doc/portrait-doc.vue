<!-- @file 竖屏端文档组件 -->
<template>
  <div class="c-portrait-doc">
    <div
      ref="wrapRef"
      class="c-portrait-doc__wrap"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { useDoc } from './use-doc';

const { wrapRef } = useDoc({
  setupOptions: {
    mobileFullScreenVisible: false,
  },
});
</script>

<style lang="scss">
.c-portrait-doc {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.c-portrait-doc__wrap {
  width: 100%;
  height: 100%;
}
</style>
