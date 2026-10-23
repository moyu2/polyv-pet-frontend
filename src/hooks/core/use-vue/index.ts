/* eslint-disable @typescript-eslint/no-explicit-any */

import { DefineComponent, getCurrentInstance, VNode } from 'vue';

export type ConvertReadonly<T> = {
  -readonly [P in keyof T]: T[P];
};

export type ComponentInstance<T> = T extends new (...args: any[]) => infer R
  ? R
  : T extends (...args: any[]) => infer R
  ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
    R extends { __ctx?: infer K }
    ? Exclude<K, void> extends { expose: (...args: infer K) => void }
      ? K[0] & InstanceType<DefineComponent>
      : any
    : any
  : any;

/**
 * @hook 对 Vue 一些方法的简单封装
 */
export const useVue = () => {
  /** 当前 vue 实例 */
  const instanceVm = getCurrentInstance();

  /** 获取当前 vue 实例对象 */
  function getInstance() {
    return instanceVm?.proxy;
  }

  /** 销毁当前 vue 实例对象 */
  function destroyCurrentInstance() {
    getInstance()?.$destroy();
  }

  /** 获取当前组件的 dom 节点 */
  function getCurrentElem() {
    const instance = getInstance();
    return instance?.$el;
  }

  /** 获取当前组件的子组件 */
  function getCurrentChildrens() {
    return getInstance()?.$children;
  }

  /** 获取指定的 slot */
  function getSlot(slotName = 'default'): VNode[] {
    const instance = getInstance();
    return (instance?.$slots && instance.$slots[slotName]) || [];
  }

  return {
    getInstance,
    destroyCurrentInstance,
    getCurrentElem,
    getCurrentChildrens,
    getSlot,
  };
};
