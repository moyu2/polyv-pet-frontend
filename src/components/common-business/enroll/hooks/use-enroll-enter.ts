import { appEvents, useEventBusListener } from '@/app/app-events';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useIdentityStore } from '@/store/use-identity-store';
import { ref, unref } from 'vue';
import { EnrollDialogInstance } from './use-enroll-dialog';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { useGlobalInject } from '@/app/use-global-inject';
import { useLoginReturnEnrollPopup } from '@/components/page-splash-common/hooks/use-login-return-auth-popup';

/**
 * 报名观看入口 hook
 */
export const useEnrollEnter = () => {
  const enrollStore = useEnrollStore();
  const identityStore = useIdentityStore();

  const { getEmitter } = useGlobalInject();

  const dialogRef = ref<EnrollDialogInstance>();

  const { needInterruptUserClick, toInterruptUserClick } = useInterruptUserClick();

  /** 处理点击入口 */
  async function onClickEnter() {
    // 开启用户系统后，报名入口需正式用户：无会话身份者、需转正的游客先弹窗登录（登录成功整页重载，回来再报名）；
    // 正式用户放行原报名动作；用户体系关频道报名行为不变。
    // 身份判定用 identityUnionInfo（UI 层唯一真源；身份变化均经整页重载，快照随之刷新）
    if (
      identityStore.watchUserSystemEnabled &&
      (!identityStore.identityUnionInfo || identityStore.isGuest)
    ) {
      getEmitter().emit(appEvents.global.OpenIdentityLoginDialog, {
        triggerSource: 'enroll',
      });
      return;
    }

    if (enrollStore.needEnrollByChat && needInterruptUserClick.value) {
      toInterruptUserClick({
        triggerSource: 'enroll',
        ignoreSetNick: true,
      });
      return;
    }

    // 开启用户系统后，如果报名观看需要审核且已填写过表单后，则不在显示表单
    if (
      identityStore.watchUserSystemEnabled &&
      enrollStore.needEnrollByEnter &&
      enrollStore.auditNotPass
    ) {
      return;
    }

    const dialogInstance = unref(dialogRef);
    if (dialogInstance) {
      dialogInstance.openEnrollForm();
    }
  }

  useEventBusListener(appEvents.global.OpenEnrollDialog, () => {
    onClickEnter();
  });

  // 登录回来主动弹报名表单（纯报名频道）：挂载时自查回访标记（载体时点即消费时点）
  useLoginReturnEnrollPopup(onClickEnter);

  return {
    dialogRef,
    onClickEnter,
  };
};
