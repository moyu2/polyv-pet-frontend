<template>
  <ul
    class="c-portrait-normal-tabs"
    :class="{
      'c-portrait-normal-tabs--hide-border': !border,
    }"
  >
    <li
      v-for="item in tabs"
      :key="item.value"
      class="c-portrait-normal-tabs__item"
      :class="{
        'c-portrait-normal-tabs__item--active pws-portrait-normal-tabs__item--active':
          value === item.value,
      }"
      @click="onClickTab(item.value)"
    >
      {{ item.label }}
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { simpleTabsEmits, simpleTabsProps, useSimpleTabs } from '../hooks/use-simple-tabs';

const props = defineProps(simpleTabsProps());

const emit = defineEmits(simpleTabsEmits());

const { onClickTab } = useSimpleTabs({
  props,
  emit,
});
</script>

<style lang="scss">
.c-portrait-normal-tabs {
  display: flex;
  justify-content: center;
  height: 42px;
  margin: 0 16px;
  font-size: 14px;
  line-height: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  &.c-portrait-normal-tabs--hide-border {
    border-bottom: none;
  }
  .c-portrait-normal-tabs__item {
    position: relative;
    margin: 0 20px;
    color: #fff;
    text-align: center;
    &.c-portrait-normal-tabs__item--active {
      color: #ffd16b;
      &::after {
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 56px;
        height: 2px;
        content: '';
        background: #ffd16b;
        transform: translateX(-50%);
      }
    }
  }
}
</style>
