<!-- @file 上下文菜单组件 -->
<!-- @todo 元素边缘控制，层级菜单 -->

<template>
  <div
    class="c-context-menu"
    ref="contextMenuRef"
    :style="contextMenuStyle"
  >
    <div
      v-for="menuItem in displayMenuData"
      :key="menuItem.content"
      class="c-context-menu-item"
      @click="onMenuClick(menuItem)"
    >
      <component
        v-if="menuItem.getIcon"
        :is="menuItem.getIcon()"
        class="c-context-menu-item__icon"
      />
      <span v-html="menuItem.content"></span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { ContextMenuData, ContextMenuInstance, ContextMenuPosition } from './_types';

import { useVue } from '@/hooks/core/use-vue';
import { useClickOutside } from '@/hooks/behaviors/use-click-outside';
import { useAppendTo } from '@/hooks/behaviors/use-append-to';
import { CSSProperties } from 'vue/types/jsx';
import { PlvPopperManager } from '@/plugins/polyv-ui/admin-import';

const { destroyCurrentInstance } = useVue();

const menuData = ref<ContextMenuData[]>([]);

const displayMenuData = computed(() => {
  return menuData.value.filter(item => !item.hidden);
});

function onMenuClick(menuItem: ContextMenuData) {
  menuItem.onClick(menuItem);
  nextTick(() => {
    destroyCurrentInstance();
  });
}

function $updateMenuData(data: ContextMenuData[]) {
  menuData.value = data;
}

const contextMenuPosition = ref<ContextMenuPosition>({
  x: 0,
  y: 0,
});

const contextMenuStyle = computed<CSSProperties>(() => {
  const { offsetX = 0, offsetY = 0 } = contextMenuPosition.value;

  return {
    top: `${contextMenuPosition.value.y + offsetY}px`,
    left: `${contextMenuPosition.value.x + offsetX}px`,
    zIndex: PlvPopperManager.zIndex + 1,
  };
});

function $updatePosition(position: ContextMenuPosition) {
  contextMenuPosition.value = position;
}

const contextMenuRef = ref<HTMLDivElement>();

useAppendTo(contextMenuRef);

useClickOutside([contextMenuRef], () => {
  destroyCurrentInstance();
});

onBeforeMount(() => {
  document.addEventListener('scroll', destroyCurrentInstance, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('scroll', destroyCurrentInstance, true);
});

defineExpose<ContextMenuInstance>({
  $updateMenuData,
  $updatePosition,
});
</script>

<style lang="scss">
.c-context-menu {
  position: absolute;
  box-sizing: border-box;
  min-width: 90px;
  max-width: 200px;
  min-height: 40px;
  padding: 8px 4px;

  font-size: 14px;
  cursor: pointer;

  background: #ffffff;
  border-radius: 4px;
  /* 中层投影 */
  box-shadow: 0 4px 20px 0 rgba(51, 58, 71, 0.102);
}

.c-context-menu-item {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 32px;
  padding: 8px 16px;
  border-radius: 4px;

  &:hover {
    background-color: #f2f3f5;
  }
}

.c-context-menu-item__icon {
  display: inline-flex;
  margin-right: 8px;
}
</style>
