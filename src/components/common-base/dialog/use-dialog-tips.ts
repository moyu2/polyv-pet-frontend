import { inject, InjectionKey, onBeforeUnmount, provide, ref } from 'vue';

export interface DialogTipsInstance {
  /** 显示弹层的提示 */
  showDialogTips: (tips: string) => void;
}

export const DIALOG_TIPS_PROVIDE_KEY: InjectionKey<DialogTipsInstance> =
  Symbol('DIALOG_TIPS_PROVIDE_KEY');

/**
 * 弹层提示 hooks（用于弹层中）
 */
export const useDialogTips = () => {
  let timer: number | undefined;

  const dialogTips = ref<string>();

  /** 显示弹层提示 */
  function showDialogTips(tips: string) {
    dialogTips.value = tips;
    setHiddenTimer();
  }

  /** 设置隐藏定时器 */
  function setHiddenTimer() {
    clearHiddenTimer();

    timer = window.setTimeout(() => {
      dialogTips.value = undefined;
      clearHiddenTimer();
    }, 2000);
  }

  /** 清楚隐藏定时器 */
  function clearHiddenTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
  }

  onBeforeUnmount(() => {
    clearHiddenTimer();
  });

  const dialogTipsInstance: DialogTipsInstance = {
    showDialogTips,
  };

  provide(DIALOG_TIPS_PROVIDE_KEY, dialogTipsInstance);

  return {
    dialogTips,
    showDialogTips,
    dialogTipsInstance,
  };
};

/**
 * 弹层提示 hook
 */
export const useDialogTipsUtils = () => {
  const dialogTipsContext = inject(DIALOG_TIPS_PROVIDE_KEY);

  /** 显示弹层提示 */
  function showDialogTips(tips: string) {
    dialogTipsContext && dialogTipsContext.showDialogTips(tips);
  }

  return {
    showDialogTips,
  };
};
