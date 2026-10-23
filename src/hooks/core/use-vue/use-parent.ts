import {
  ref,
  inject,
  computed,
  onUnmounted,
  InjectionKey,
  getCurrentInstance,
  ComponentPublicInstance,
} from 'vue';
import { ComponentInternalInstance } from './type';

type ParentProvide<T> = T & {
  link(child: ComponentInternalInstance): void;
  unlink(child: ComponentInternalInstance): void;
  children: ComponentPublicInstance[];
  internalChildren: ComponentInternalInstance[];
};

export function useParent<T>(key: InjectionKey<ParentProvide<T>>) {
  const parent = inject(key, null);
  const instance = getCurrentInstance();

  if (parent && instance) {
    const { link, unlink, internalChildren } = parent;

    link(instance);
    onUnmounted(() => unlink(instance));

    const index = computed(() => internalChildren.indexOf(instance));

    return {
      parent,
      index,
    };
  }

  return {
    parent: null,
    index: ref(-1),
  };
}
