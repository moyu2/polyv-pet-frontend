<!-- @file 移动端侧边 Tabs 标签页面板 -->
<template>
  <transition :name="transitionName">
    <div
      v-show="paneVisible"
      class="c-mobile-menu-tab-pane"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <template v-if="renderSlot">
        <slot :weixin-btn-id="generateHackWeixinBtnId(props.name, true)"></slot>
      </template>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { tabPaneProps, useTabPane } from '../hooks/use-tab-pane';
import { generateHackWeixinBtnId } from '../hooks/use-tabs';

const props = defineProps(tabPaneProps());

const { paneVisible, renderSlot, tabPaneInstance, transitionName } = useTabPane({ props });

const onMultiPolyvWatchTouch = useMultiPolyvWatchApp();

const onTouchStart = (evt: TouchEvent) => {
  onMultiPolyvWatchTouch.onTouchStart(evt);
};

const onTouchMove = (evt: TouchEvent) => {
  onMultiPolyvWatchTouch.onTouchMove(evt);
};

const onTouchEnd = (evt: TouchEvent) => {
  onMultiPolyvWatchTouch.onTouchEnd(evt);
};

defineExpose(tabPaneInstance);
</script>

<style lang="scss">
.c-mobile-menu-tab-pane {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
