import { appEvents, useEventBusListener } from '@/app/app-events';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { ref } from 'vue';

export const useLearningDetail = () => {
  /** 显示状态 */
  const dialogVisible = ref(false);

  const { viewerWatchDuration } = storeDefinitionToRefs(useChannelInfoStore);

  useEventBusListener(appEvents.global.OpenLearningDetail, () => {
    dialogVisible.value = true;
  });

  return {
    dialogVisible,

    viewerWatchDuration,
  };
};
