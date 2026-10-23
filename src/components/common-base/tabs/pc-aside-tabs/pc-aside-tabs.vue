<!-- @file PC 端侧边 Tabs 标签页 -->
<template>
  <div class="c-pc-aside-tabs">
    <!-- tab 头部 -->
    <pc-aside-tab-header
      v-show="!isEmptyMenu || forceShowHeader"
      :header-config="headerConfig"
    >
      <template #header-suffix>
        <slot name="header-suffix"></slot>
      </template>
    </pc-aside-tab-header>

    <!-- tab 主体 -->
    <div class="c-pc-aside-tabs__body pws-main-tab-body pws-theme-mask-bg">
      <div
        v-if="isEmptyMenu"
        class="c-pc-aside-tabs__empty pws-main-tab-empty"
      >
        {{ $lang('menu.empty') }}
      </div>

      <!-- 面板插槽 -->
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import PcAsideTabHeader from './pc-aside-tab-header.vue';
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
  switchEvent: appEvents.global.PcAsideMenuSwitch,
});

defineExpose(tabsInstance);
</script>

<style lang="scss">
.c-pc-aside-tabs {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: inherit;
}

.c-pc-aside-tabs__body {
  position: relative;
  flex: 1;

  @include pc-watch-card-radius-bottom;
  &::before {
    @include pc-watch-card-radius-bottom;
  }
}

.c-pc-aside-tabs__empty {
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
