<!-- @file 移动端菜单栏 Tabs 标签页 -->
<template>
  <div class="c-mobile-popup-tabs">
    <mobile-popup-tab-header v-show="!isEmptyMenu" />

    <div class="c-mobile-popup-tabs__body">
      <div
        v-if="isEmptyMenu"
        class="c-mobile-popup-tabs__empty"
      >
        {{ $lang('menu.empty') }}
      </div>

      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import MobilePopupTabHeader from './mobile-popup-tab-header.vue';
import { appEvents } from '@/app/app-events';
import { tabsProps, tabsEmits, useTabs } from '../hooks/use-tabs';

const props = defineProps(tabsProps());

const emit = defineEmits(tabsEmits());

const { tabsInstance, isEmptyMenu } = useTabs({
  props,
  emit,
  switchEvent: appEvents.global.MobileBottomMenuSwitch,
});

defineExpose(tabsInstance);
</script>

<style lang="scss">
.c-mobile-popup-tabs {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.c-mobile-popup-tabs__body {
  position: relative;
  flex: 1;
}

.c-mobile-popup-tabs__empty {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);

  &::before {
    width: 88px;
    height: 88px;
    margin-bottom: 8px;
    content: '';
    background-size: 100% 100%;
  }
}
</style>
