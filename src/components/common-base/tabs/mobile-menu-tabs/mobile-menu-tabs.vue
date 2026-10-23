<!-- @file 移动端菜单栏 Tabs 标签页 -->
<template>
  <div class="c-mobile-menu-tabs">
    <mobile-menu-tab-header
      v-show="!isEmptyMenu || forceShowHeader"
      :header-config="headerConfig"
    >
      <template #header-suffix>
        <slot name="header-suffix"></slot>
      </template>
    </mobile-menu-tab-header>

    <div class="c-mobile-menu-tabs__body">
      <div
        v-if="isEmptyMenu"
        class="c-mobile-menu-tabs__empty pws-main-tab-empty"
      >
        {{ $lang('menu.empty') }}
      </div>

      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import MobileMenuTabHeader from './mobile-menu-tab-header.vue';
import { appEvents } from '@/app/app-events';
import { tabsProps, tabsEmits, useTabs } from '../hooks/use-tabs';
import { PropUtils } from '@polyv/vue-components';

const props = defineProps({
  ...tabsProps(),
  /** 强制显示头部 */
  forceShowHeader: PropUtils.bool.def(false),
});

const emit = defineEmits(tabsEmits());

const { tabsInstance, isEmptyMenu } = useTabs({
  props,
  emit,
  switchEvent: appEvents.global.MobileBottomMenuSwitch,
});

defineExpose(tabsInstance);
</script>

<style lang="scss">
.c-mobile-menu-tabs {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  color: $--color-white;
  // background: #202127;
}

.c-mobile-menu-tabs__body {
  position: relative;
  flex: 1;
}

.c-mobile-menu-tabs__empty {
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
