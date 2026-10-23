import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { onBeforeMount, ref } from 'vue';

export const useIdentityCollectInfo = () => {
  const { getWatchCore } = useGlobalInject();

  const renderEnabled = ref(false);

  const dialogInstance = ref<{ openDialog: () => void }>();

  const watchCore = getWatchCore();

  const autoOpen = ref(false);

  useEventBusListener(appEvents.global.OpenBindIdentityInfoDialog, () => {
    dialogInstance.value?.openDialog();
  });

  async function initAutoOpenDialog() {
    // 信息流场景下不需要通过观看页来自动打开
    if (isBuildForFeedMainMode()) {
      autoOpen.value = false;
      renderEnabled.value = false;
      return;
    }

    const collectEnabled = await watchCore.identity.checkCollectEnabled();
    if (collectEnabled) {
      autoOpen.value = true;
    }
    renderEnabled.value = true;
  }

  onBeforeMount(() => {
    initAutoOpenDialog();
  });

  return {
    renderEnabled,
    dialogInstance,

    autoOpen,
  };
};
