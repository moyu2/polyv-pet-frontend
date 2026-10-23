<!-- @file 移动端侧边 Tabs 标签页面板 -->
<template>
  <transition :name="transitionName">
    <div
      v-show="paneVisible"
      class="c-mobile-popup-tab-pane"
    >
      <template v-if="renderSlot">
        <slot></slot>
      </template>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { tabPaneProps, useTabPane } from '../hooks/use-tab-pane';

const props = defineProps(tabPaneProps());

const { paneVisible, renderSlot, tabPaneInstance, transitionName } = useTabPane({ props });

defineExpose(tabPaneInstance);
</script>

<style lang="scss">
.c-mobile-popup-tab-pane {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  overflow-y: auto;
}
</style>
