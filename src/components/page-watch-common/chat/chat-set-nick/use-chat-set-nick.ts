import { appEvents, useEventBusListener } from '@/app/app-events';
import { translate } from '@/assets/lang';
import { validateSpecialString } from '@/assets/utils/validate';
import { useToastManager } from '@/hooks/components/use-toast';
import { ValidatorRules } from '@/plugins/async-validator';
import { UserEvents } from '@polyv/live-watch-sdk';
import { computed, onBeforeUnmount, reactive, ref } from 'vue';
import { useGlobalInject } from '@/app/use-global-inject';

/**
 * 设置昵称 hook
 */
export const useChatSetNick = () => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  /** 显示状态 */
  const dialogVisible = ref(false);

  /** 昵称最大字符长度 */
  const nickMaxLength = 20;

  /** 表单 */
  const formData = reactive({
    nickname: '',
  });

  const formRules = computed<ValidatorRules>(() => {
    return {
      nickname: [
        { type: 'string', message: translate('chat.setNick.error.empty'), required: true },
        {
          validator: () => {
            if (validateSpecialString(formData.nickname)) {
              return [translate('chat.setNick.error.special')];
            }
            return [];
          },
        },
      ],
    };
  });

  /** 设置弹层状态 */
  function setDialogVisible(visible = true) {
    dialogVisible.value = visible;
  }

  /** 提交表单 */
  function submitSetNick() {
    const watchCore = getWatchCore();
    watchCore.user.updateUserNick(formData.nickname);
    listenSetNickEvent();
  }

  /** 处理设置昵称成功 */
  function onSetNickSuccess() {
    toast.success(translate('chat.setNick.success'));
    setDialogVisible(false);
    unlistenSetNickEvent();
  }

  /** 处理设置昵称失败 */
  function onSetNickError(evt: { message: string }) {
    toast.error(evt.message);
    unlistenSetNickEvent();
  }

  /** 监听设置昵称事件 */
  function listenSetNickEvent() {
    unlistenSetNickEvent();
    const watchCore = getWatchCore();
    watchCore.user.eventEmitter.on(UserEvents.CurrentUserSetNick, onSetNickSuccess);
    watchCore.user.eventEmitter.on(UserEvents.SetNickError, onSetNickError);
  }

  /** 移除事件监听 */
  function unlistenSetNickEvent() {
    const watchCore = getWatchCore();
    watchCore.user.eventEmitter.off(UserEvents.CurrentUserSetNick, onSetNickSuccess);
    watchCore.user.eventEmitter.off(UserEvents.SetNickError, onSetNickError);
  }

  useEventBusListener(appEvents.chat.OpenSetNick, setDialogVisible);

  onBeforeUnmount(() => {
    unlistenSetNickEvent();
  });

  return {
    dialogVisible,
    setDialogVisible,

    formData,
    formRules,
    submitSetNick,

    nickMaxLength,
  };
};
