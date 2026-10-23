import Vue from 'vue';
import { CombinedVueInstance, ExtendedVue } from 'vue/types/vue';

import { isMobile } from '@/assets/utils/browser';

import PcToast from './_components/pc-toast.vue';
import MobileToast from './_components/mobile-toast.vue';
import { ToastPropsType } from './_hooks/use-toast-comp';
import { ToastInstance, ToastType } from './_toast_type';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';

type ToastPropPickOptions = Pick<ToastPropsType, 'duration'>;

type ToastConstructorCtorType = ExtendedVue<
  Vue,
  Record<string, never>,
  ToastInstance,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>;

type ToastManagerOptions = {
  /** 提示组件构造器 */
  ToastConstructor: ToastConstructorCtorType;
  /** 最大显示数量，默认：5 */
  maxCount?: number;
  /** 渲染的父容器 */
  mountEl?: string | HTMLElement;
};

type ToastInstanceVue = CombinedVueInstance<
  Vue,
  Record<string, never>,
  ToastInstance,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>;
/** 提示管理器 */
class ToastManager {
  /** 用于创建的组件 */
  private __ToastConstructor: ToastConstructorCtorType;
  /** 提示队列 */
  private __toastQueue: ToastPropsType[] = [];
  /** 当前正在显示的 toast 实例 */
  private __toasts: ToastInstanceVue[] = [];
  /** 第一个 toast 的 top */
  private __startTop = 20;
  /** 两个 toast 之间的距离 */
  private __instanceSpacing = 16;
  /** 最大显示数量 */
  private __maxCount: number;
  /** 渲染的父容器 */
  private _mountEl?: string | HTMLElement;

  constructor(options: ToastManagerOptions) {
    this.__ToastConstructor = options.ToastConstructor;
    this.__maxCount = options.maxCount ?? 5;
    this._mountEl = options.mountEl;
  }

  /** 插入一个提示 */
  private __push(props: ToastPropsType) {
    this.__toastQueue.push(props);
    this.__checkQueue();
  }

  /** 检查队列 */
  private __checkQueue() {
    if (this.__toasts.length >= this.__maxCount || this.__toastQueue.length === 0) {
      return;
    }

    const joins = this.__toastQueue.splice(0, this.__maxCount - this.__toasts.length);
    this.__toastList(joins);
  }

  /**
   * 提示列表
   */
  private __toastList(list: ToastPropsType[]) {
    list.forEach(props => {
      const ToastConstructor = this.__ToastConstructor;

      const instance = new ToastConstructor({
        propsData: {
          ...props,
          mountEl: this._mountEl,
        },
      });
      instance.$mount();
      instance.openToast();

      this.__toasts.push(instance);
      this.__resetTop();

      instance.$once('close', () => {
        this.__remove(instance);
      });
    });
  }

  /** 移除提示实例 */
  private __remove(instance: ToastInstance) {
    this.__toasts = this.__toasts.filter(_instance => _instance !== instance);
    this.__resetTop();
    this.__checkQueue();
  }

  /** 重置提示实例的 top 定位 */
  private __resetTop() {
    let toastTop = this.__startTop;
    this.__toasts.forEach(instance => {
      instance.setToastTop(toastTop);
      const elem = instance.$el as HTMLElement;

      toastTop += elem.offsetHeight + this.__instanceSpacing;
    });
  }

  /** 信息类提示 */
  public info(msg: string, opts: ToastPropPickOptions = {}) {
    this.__push({ msg, type: ToastType.Info, ...opts });
  }

  /** 成功类提示 */
  public success(msg: string, opts: ToastPropPickOptions = {}) {
    this.__push({ msg, type: ToastType.Success, ...opts });
  }

  /** 警告类提示 */
  public warning(msg: string, opts: ToastPropPickOptions = {}) {
    this.__push({ msg, type: ToastType.Warning, ...opts });
  }

  /** 异常类提示 */
  public error(msg: string, opts: ToastPropPickOptions = {}) {
    this.__push({ msg, type: ToastType.Error, ...opts });
  }

  /** 帮助类提示 */
  public help(msg: string, opts: ToastPropPickOptions = {}) {
    this.__push({ msg, type: ToastType.Help, ...opts });
  }

  /** 加载中提示 */
  public loading(msg: string, opts: ToastPropPickOptions = {}) {
    this.__push({ msg, type: ToastType.Loading, ...opts });
  }
}

function getToastConstructor() {
  if (isMobile) {
    return MobileToast;
  }

  return PcToast;
}

/** 主屏消息提示对象 */
let __toast: null | ToastManager = null;

export const useToastManager = () => {
  const { getAppRootElement } = useMultiPolyvWatchApp();

  if (!__toast) {
    __toast = new ToastManager({
      ToastConstructor: Vue.extend(getToastConstructor() as unknown as ToastConstructorCtorType),
      mountEl: getAppRootElement(),
    });
  }

  return {
    toast: __toast,
  };
};
