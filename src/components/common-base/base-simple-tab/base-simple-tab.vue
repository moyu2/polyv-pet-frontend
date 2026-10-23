<!-- @file 基础 Tab，不受多皮肤影响 -->
<template>
  <ul
    class="c-base-simple-tabs"
    :class="{
      'c-base-simple-tabs__mobile': isMobile,
      'c-base-simple-tabs--overflow': true,
      'c-base-simple-tabs--hide-border': !border,
    }"
  >
    <li
      v-for="item in tabs"
      :key="item.value"
      class="c-base-simple-tabs__item"
      :class="{
        'c-base-simple-tabs__item--active': value === item.value,
      }"
      @click="onClickTab(item.value)"
    >
      {{ item.label }}
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { isMobile } from '@/assets/utils/browser';
import { simpleTabsEmits, simpleTabsProps, useSimpleTabs } from './use-simple-tab';

const props = defineProps(simpleTabsProps());

const emit = defineEmits(simpleTabsEmits());

const { onClickTab } = useSimpleTabs({
  props,
  emit,
});
</script>

<style lang="scss">
.c-base-simple-tabs {
  display: flex;
  height: 44px;
  font-size: 14px;

  &.c-base-simple-tabs__mobile {
    &.c-base-simple-tabs--overflow {
      @include hidden-scrollbar();
    }
  }

  &.c-base-simple-tabs--overflow {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    @include scrollbar(rgba(#333333, 0.2), 8px);
  }

  &.c-base-simple-tabs--hide-border {
    border-bottom: none;
  }

  .c-base-simple-tabs__item {
    position: relative;
    box-sizing: border-box;
    gap: 8px;
    padding: 12px;
    color: rgba(0, 0, 0, 0.6);
    text-align: center;
    cursor: pointer;

    &.c-base-simple-tabs__item--active {
      font-weight: bold;
      color: #333333;

      &::after {
        position: absolute;
        bottom: 8px;
        left: 50%;
        width: 16px;
        height: 2px;
        content: '';
        background-color: #333333;
        transform: translateX(-50%);
      }
    }
  }
}
</style>
