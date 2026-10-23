import { appEvents, useEventBusListener } from '@/app/app-events';
import { translate } from '@/assets/lang';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { DialogInstance } from '@/components/common-base/dialog/pc-dialog/types';
import { useAuthStore } from '@/store/use-auth-store';
import { AuthSettingItemInfo, AuthType } from '@polyv/live-watch-sdk';
import { storeToRefs } from 'pinia';
import { computed, nextTick, ref } from 'vue';
import { useAuthButtonInject } from '../hooks/use-auth-button';
import { AuthInfoFormInstance } from './hooks/use-auth-info-form';

export type AuthInfoDialogModel = 'form' | 'login';

export const useAuthInfo = () => {
  const authStore = useAuthStore();
  const { computedAuthItem } = useAuthButtonInject<AuthSettingItemInfo>(onClickAuthButton);

  const { authInfoFields } = storeToRefs(authStore);

  const dialogRef = ref<DialogInstance>();

  const dialogModel = ref<AuthInfoDialogModel>('form');

  const { visible: dialogVisible, close: closeDialog } = useSimpleVisible(false);

  const formRef = ref<AuthInfoFormInstance>();

  function onClickAuthButton(): void {
    dialogVisible.value = true;
    dialogModel.value = 'form';
    formRef.value?.resetFormData();
  }

  // 登录回来主动弹：与按钮点击同函数，表单重置行为一致
  useEventBusListener(
    appEvents.global.OpenAuthConditionDialog,
    ({ authType }: { authType: AuthType }) => {
      if (authType === computedAuthItem.value.authType) {
        onClickAuthButton();
      }
    },
  );

  /** 弹层标题 */
  const dialogTitle = computed(() => {
    if (dialogModel.value === 'form') {
      return computedAuthItem.value.infoAuthTips;
    }
    return translate('auth.info.registered.title');
  });

  async function openLogined() {
    dialogModel.value = 'login';
    await nextTick();
    dialogRef.value?.resetPosition();
  }

  async function openAuthInfoForm() {
    dialogModel.value = 'form';
    await nextTick();
    dialogRef.value?.resetPosition();
  }

  return {
    dialogVisible,
    dialogModel,
    dialogTitle,
    dialogRef,
    formRef,

    authInfoFields,
    closeDialog,
    openLogined,
    openAuthInfoForm,
  };
};
