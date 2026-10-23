<!-- @file 竖屏文档位置切换 -->
<template>
  <div
    class="c-portrait-doc-side-switch g-img-cover"
    @click="toggleMainScreen"
  ></div>
</template>

<script setup lang="ts">
import { useLayoutStore } from '@/store/use-layout-store';

const layoutStore = useLayoutStore();
const { toggleMainScreen } = layoutStore;
</script>

<style lang="scss">
.c-portrait-doc-side-switch {
  flex-shrink: 0;
  width: 30px;
  height: 20px;
  background-image: url(./icon-doc-switch.png);
}
</style>
