<template>
  <div class="c-mobile-tree-select">
    <mobile-sidebar
      class="c-mobile-tree-select__nav"
      :model-value="sidebarNavActiveIndex"
      @change="onSidebarChange"
    >
      <mobile-sidebar-item
        v-for="(item, idx) in props.items"
        :key="'nav-item__' + item.value"
        :class="['c-mobile-tree-select__nav-item', item.className]"
        :disabled="item.disabled"
        @click="() => onClickSidebarItem(idx)"
      >
        <template #title>
          <slot
            name="nav-text"
            :item="item"
          >
            {{ item.label }}
          </slot>
        </template>
      </mobile-sidebar-item>
    </mobile-sidebar>
    <div
      v-if="selected.children"
      class="c-mobile-tree-select__content"
      :key="sidebarNavActiveIndex"
    >
      <div
        v-for="item in selected.children"
        :key="'select-item__' + item.value"
        class="g-singleline c-mobile-tree-select__item"
        :class="{
          'c-mobile-tree-select__item--active': isActiveItem(item.value),
          'c-mobile-tree-select__item--disabled': item.disabled,
        }"
        @click="() => onClickContentItem(item)"
      >
        {{ item.label }}
        <mobile-icon-check
          v-if="isActiveItem(item.value)"
          class="c-mobile-tree-select__selected"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

import MobileSidebar from '../sidebar/mobile-sidebar.vue';
import MobileSidebarItem from '../sidebar-item/mobile-sidebar-item.vue';
import { PropUtils } from '@polyv/vue-components';
import { MobileIconCheck } from '@/components/component-icons/mobile/map';
import { TreeSelectItem, TreeSelectChild, TreeSelectDataValue } from './tree-select-types';

const props = defineProps({
  items: PropUtils.array<TreeSelectItem>().def(),
  activeValues: PropUtils.array<TreeSelectDataValue>().def(),
});

const emit = defineEmits<{
  (e: 'click-nav', payload: { index: number; item: TreeSelectItem }): void;
  (e: 'click-item', item: TreeSelectChild): void;
  (e: 'update:activeValues', values: TreeSelectDataValue[]): void;
  (e: 'finish', values: TreeSelectDataValue[]): void;
}>();

const sidebarNavActiveIndex = ref(
  (() => {
    const itemVal = props.activeValues[0];
    const index = props.items.findIndex(i => i.value === itemVal);
    return index === -1 ? 0 : index;
  })(),
);

const isActiveItem = (itemVal: TreeSelectDataValue) => props.activeValues.includes(itemVal);

function onSidebarChange(index: number) {
  sidebarNavActiveIndex.value = index;
}

function onClickSidebarItem(index: number) {
  const item = props.items[index];
  emit('click-nav', { index, item });

  emit('update:activeValues', [item.value]);

  const children = item.children;
  if (!children || (Array.isArray(children) && children.length === 0)) {
    emit('update:activeValues', [item.value]);
    emit('finish', [item.value]);
  }
}

function onClickContentItem(item: TreeSelectChild) {
  if (item.disabled) return;

  const __activeValues = props.activeValues.slice();
  __activeValues.splice(1, 1, item.value);

  emit('update:activeValues', __activeValues);
  emit('click-item', item);
  emit('finish', __activeValues.slice());
}

const selected = computed(() => props.items[sidebarNavActiveIndex.value] || {});
</script>

<style lang="scss">
$--c-mobile-tree-select-font-size: 16px;
$--c-mobile-tree-select-nav-background: #f2f3f5;
$--c-mobile-tree-select-content-background: #fff;
$--c-mobile-tree-select-item-height: 56px;
$--c-mobile-tree-select-item-active-color: $--color-primary;
$--c-mobile-tree-select-item-disabled-color: #c8c9cc;
$--c-mobile-tree-select-item-selected-size: 24px;

.c-mobile-tree-select {
  position: relative;
  display: flex;
  min-height: 300px;
  font-size: $--c-mobile-tree-select-font-size;
  transform: translate3d(0, 0, 0);

  &__nav {
    flex: 1;
    overflow-y: auto;
    background: $--c-mobile-tree-select-nav-background;
    -webkit-overflow-scrolling: touch;
  }

  &__content {
    flex: 2;
    overflow-y: auto;
    background: $--c-mobile-tree-select-content-background;
    -webkit-overflow-scrolling: touch;
  }

  &__item {
    position: relative;
    padding: 0 48px 0 16px;
    font-weight: 500;
    line-height: $--c-mobile-tree-select-item-height;
    cursor: pointer;
    user-select: none;

    &--active {
      color: $--c-mobile-tree-select-item-active-color;
    }

    &--disabled {
      color: $--c-mobile-tree-select-item-disabled-color;
      cursor: not-allowed;

      &:active {
        background-color: transparent;
      }
    }
  }

  &__selected {
    position: absolute;
    right: 16px;
    font-size: $--c-mobile-tree-select-item-selected-size;
  }
}
</style>
