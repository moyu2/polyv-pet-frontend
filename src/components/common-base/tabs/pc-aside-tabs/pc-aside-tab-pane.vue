<!-- @file PC 端侧边 Tabs 标签页面板 -->
<template>
  <div
    v-show="paneVisible"
    class="c-pc-aside-tab-pane"
  >
    <template v-if="renderSlot">
      <slot></slot>
    </template>
  </div>
</template>

<script setup lang="ts">
import { tabPaneProps, useTabPane } from '../hooks/use-tab-pane';

const props = defineProps(tabPaneProps());

const { paneVisible, renderSlot, tabPaneInstance } = useTabPane({ props });

defineExpose(tabPaneInstance);
</script>

<style lang="scss">
.c-pc-aside-tab-pane {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
  @include pc-watch-card-radius-bottom;
}
</style>
