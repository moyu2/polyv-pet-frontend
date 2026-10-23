import { useVue } from '@/hooks/core/use-vue';
import { getElement } from '@/assets/utils/dom';
import { FormatProps, PropUtils, VueProps, emitFunc, VueEmit } from '@polyv/vue-components';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useAutoTopmostToShow } from '@/hooks/components/use-popper/use-auto-topmost-show';
import { ToastInstance, ToastType } from '../_toast_type';

export const toastProps = () => ({
  /** 提示内容 */
  msg: PropUtils.string.def('提示'),
  /** 提示类型，默认：info */
  type: PropUtils.enum<ToastType>().def(ToastType.Info),
  /** 关闭时间，默认：3000 */
  duration: PropUtils.number.def(3000),
  /** 渲染的父容器节点，默认：document.body */
  mountEl: PropUtils.oneOfType<string | HTMLElement>([String, HTMLElement]).def(
    () => document.body,
  ),
});

export type ToastPropsType = FormatProps<typeof toastProps>;

export const toastEmits = () => ({
  /** toast 打开 */
  open: emitFunc<void>(),
  /** toast 关闭 */
  close: emitFunc<void>(),
  /** 进入之后 */
  'after-enter': emitFunc<void>(),
  /** 离开之后 */
  'after-leave': emitFunc<void>(),
});

/**
 * @hook Toast 组件 hook
 */
export const useToastComp = (options: {
  props: VueProps<typeof toastProps>;
  emit: VueEmit<typeof toastEmits>;
  /** class 前缀 */
  prefixCls: string;
}) => {
  const { getInstance } = useVue();

  const { props, emit, prefixCls } = options;
  const toastRef = ref<HTMLDivElement>();

  /** 元素的 top 样式值 */
  const top = ref(0);
  /** 设置提示元素的 top 样式值 */
  function setToastTop(_top: number) {
    top.value = _top;
  }

  /** 提示的 class */
  const toastClasses = computed(() => {
    const classes: string[] = [];

    if (props.type) {
      classes.push(`${prefixCls}--${props.type}`);
    }

    return classes;
  });

  /** 提示的样式 */
  const toastStyle = computed(() => {
    return {
      top: `${top.value}px`,
    };
  });

  /** 提示是否显示 */
  const toastVisible = ref(false);

  /** 显示提示 */
  function openToast() {
    toastVisible.value = true;
    startCloseTimer();
    emit('open');
  }

  /** 关闭提示 */
  function closeToast() {
    toastVisible.value = false;
    clearCloseTimer();
    emit('close');
  }

  /** 关闭定时器 */
  let closeTimer: number | undefined;

  /** 开启关闭定时器 */
  function startCloseTimer() {
    closeTimer = window.setTimeout(() => {
      closeToast();
    }, props.duration);
  }

  /** 清空关闭定时器 */
  function clearCloseTimer() {
    window.clearTimeout(closeTimer);
    closeTimer = undefined;
  }

  /** 处理动画进入之后 */
  function onAfterEnter() {
    emit('after-enter');
  }

  /** 处理动画离开之后 */
  function onAfterLeave() {
    emit('after-leave');
    // 销毁组件
    const instance = getInstance();
    const $el = instance?.$el;
    $el?.parentElement?.removeChild($el);

    instance?.$destroy();
  }

  onMounted(() => {
    const instance = getInstance();
    const parentEl = getElement(props.mountEl);
    if (instance?.$el) {
      parentEl?.appendChild(instance.$el);
    }
  });

  onBeforeUnmount(() => {
    clearCloseTimer();
  });

  useAutoTopmostToShow(toastVisible, toastRef);

  const toastInstance: ToastInstance = {
    setToastTop,
    openToast,
    closeToast,
  };

  return {
    toastRef,
    toastVisible,
    toastClasses,
    toastStyle,
    openToast,
    closeToast,
    onAfterEnter,
    onAfterLeave,
    toastInstance,
  };
};
