<!-- @file PC 端常规 Tabs 标签页 -->
<template>
  <div class="c-pc-normal-tabs pws-next-pc-normal-tabs">
    <pc-normal-tab-header v-show="!isEmptyMenu" />
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import PcNormalTabHeader from './pc-normal-tab-header.vue';
import { tabsProps, tabsEmits, useTabs } from '../hooks/use-tabs';

const props = defineProps(tabsProps());

const emit = defineEmits(tabsEmits());

const { tabsInstance, isEmptyMenu } = useTabs({
  props,
  emit,
});

defineExpose(tabsInstance);
</script>

<style lang="scss">
.c-pc-normal-tabs {
  padding: 4px 12px;
  background: $--color-white;
}
</style>
