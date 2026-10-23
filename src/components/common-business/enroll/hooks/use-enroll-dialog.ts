import { translate } from '@/assets/lang';
import { useEnrollStore } from '@/store/use-enroll-store';
import { computed, ref } from 'vue';

/**
 * 报名表单实例
 */
export interface EnrollDialogInstance {
  /** 显示报名观看表单弹层 */
  openEnrollForm(): void;
}

export type EnrollDialogModel = 'form' | 'login';

/**
 * 报名观看弹窗 hook
 */
export const useEnrollDialog = () => {
  const enrollStore = useEnrollStore();

  /** 弹层是否显示 */
  const dialogVisible = ref(false);

  function getDefaultDialogModel(): EnrollDialogModel {
    if (enrollStore.needEnrollByChat) return 'form';

    return 'login';
  }

  /** 弹层模式 */
  const dialogModel = ref<EnrollDialogModel>(getDefaultDialogModel());

  /** 弹层标题 */
  const dialogTitle = computed<string>(() => {
    if (dialogModel.value === 'login') {
      return translate('enroll.loginTitle');
    }

    return enrollStore.enrollTitle;
  });

  /** 显示报名观看表单弹层 */
  function openEnrollForm() {
    dialogModel.value = getDefaultDialogModel();
    dialogVisible.value = true;
  }

  /** 关闭报名观看表单弹层 */
  function closeEnrollDialog() {
    dialogVisible.value = false;
  }

  /** 跳转去待报名的表单验证 */
  function redirectToEnroll() {
    dialogModel.value = 'form';
  }

  /** 跳转去已报名的表单 */
  function redirectToEnrolled() {
    dialogModel.value = 'login';
  }

  const enrollDialogInstance: EnrollDialogInstance = {
    openEnrollForm,
  };

  return {
    dialogVisible,
    dialogTitle,
    enrollDialogInstance,
    dialogModel,
    openEnrollForm,
    closeEnrollDialog,
    redirectToEnroll,
    redirectToEnrolled,
  };
};
