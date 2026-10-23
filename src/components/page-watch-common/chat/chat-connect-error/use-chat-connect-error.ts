import { translate } from '@/assets/lang';
import { useChatStore } from '@/store/use-chat-store';
import { computed, ref, watch } from 'vue';
import { generateRandomInteger } from '@/assets/utils/number';

/**
 * 聊天室连接失败 hook
 */
export const useChatConnectError = () => {
  const chatStore = useChatStore();

  /** 连接失败提示是否显示 */
  const connectErrorVisible = ref(false);

  const displayMode = ref<'auto' | 'manual'>('manual');

  function changeManualDisplayMode() {
    if (connectErrorVisible.value) {
      displayMode.value = 'manual';
    }
  }

  watch(
    () => chatStore.connectError,
    () => {
      connectErrorVisible.value = chatStore.connectError;

      displayMode.value = 'auto';
      if (connectErrorVisible.value) {
        // 30s-35s 检查，如果还是显示连麦失败，引导用户手动刷新
        const waitTime = generateRandomInteger(30, 35);
        setTimeout(() => {
          changeManualDisplayMode();
        }, waitTime * 1000);
      }
    },
    { immediate: true },
  );

  const errorTipsText = computed(() => {
    return translate('chat.connectError.tips2');
  });

  /** 处理确认点击 */
  function onConfirm(): void {
    connectErrorVisible.value = false;
    window.location.reload();
  }

  /** 处理取消点击 */
  function onCancel(): void {
    connectErrorVisible.value = false;
  }

  return {
    displayMode,
    connectErrorVisible,
    errorTipsText,
    onConfirm,
    onCancel,
  };
};
