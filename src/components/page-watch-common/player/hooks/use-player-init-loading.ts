import { computed } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlayerStore } from '@/store/use-player-store';

/**
 * 播放器初始化 loading（解决 播放器 未挂载前的短暂黑屏）
 */
export const usePlayerInitLoading = () => {
  const { playerSdkLoadError, playerScriptLoading } = storeDefinitionToRefs(usePlayerStore);

  const initLoadingVisible = computed(() => {
    if (playerSdkLoadError.value) return false;
    return playerScriptLoading.value;
  });

  return {
    initLoadingVisible,
  };
};
