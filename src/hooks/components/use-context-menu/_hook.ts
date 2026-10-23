import Vue, { ref } from 'vue';
import ContextMenuVue from './context-menu.vue';
import {
  ContextMenuData,
  ContextMenuInstance,
  ContextMenuPosition,
  ContextMenuVueInstanceType,
} from './_types';

export const useContextMenu = () => {
  const contextMenuInstance = ref<ContextMenuInstance>();

  function createContextMenu(
    position: ContextMenuPosition,
    menuData: ContextMenuData[],
  ): ContextMenuInstance {
    const __ContextMenuConstructor = Vue.extend(ContextMenuVue);
    const instance: ContextMenuVueInstanceType = new __ContextMenuConstructor();

    instance.$updatePosition(position);
    instance.$updateMenuData(menuData);
    instance.$mount();

    contextMenuInstance.value = instance as unknown as ContextMenuInstance;
    return instance;
  }

  return {
    contextMenuInstance,
    createContextMenu,
  };
};
