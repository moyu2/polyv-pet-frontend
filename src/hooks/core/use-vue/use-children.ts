import { provide, getCurrentInstance, ComponentPublicInstance, InjectionKey, VNode } from 'vue';
import { ComponentInternalInstance } from './type';

function flattenVNodes(vnodes: VNode[]) {
  const result: VNode[] = [];

  function traverse(vnodes: VNode[]) {
    vnodes.forEach(vnode => {
      result.push(vnode);

      if (vnode.componentInstance) {
        traverse(vnode.componentInstance.$children.map(item => item.$vnode));
      }

      if (vnode.children) {
        traverse(vnode.children);
      }
    });
  }

  traverse(vnodes);
  return result;
}

export function sortChildren(children: ComponentPublicInstance[], parent: Vue) {
  const { componentOptions } = parent.$vnode;
  if (!componentOptions || !componentOptions.children) {
    return;
  }

  const vnodes = flattenVNodes(componentOptions.children);
  children.sort((a, b) => vnodes.indexOf(a.$vnode) - vnodes.indexOf(b.$vnode));
}

export function useChildren<
  // eslint-disable-next-line
  Child extends ComponentPublicInstance = ComponentPublicInstance<{}, any>,
  ProvideValue = never,
>(key: InjectionKey<ProvideValue>) {
  const publicChildren: Child[] = [];
  const internalChildren: ComponentInternalInstance[] = [];
  const parent = getCurrentInstance();
  if (!parent) {
    throw new Error('not exist instance');
  }

  const linkChildren = (value?: ProvideValue) => {
    const link = (child: ComponentInternalInstance) => {
      if (child.proxy) {
        internalChildren.push(child);
        publicChildren.push(child.proxy as unknown as Child);
        sortChildren(publicChildren, parent.proxy);
      }
    };

    const unlink = (child: ComponentInternalInstance) => {
      const index = internalChildren.indexOf(child);
      publicChildren.splice(index, 1);
      internalChildren.splice(index, 1);
    };

    provide(
      key,
      Object.assign(
        {
          link,
          unlink,
          children: publicChildren,
          internalChildren,
        },
        value,
      ),
    );
  };

  return {
    children: publicChildren,
    linkChildren,
  };
}
