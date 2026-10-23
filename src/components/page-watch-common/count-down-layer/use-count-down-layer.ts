import { computed } from 'vue';
import { ChannelPlayMode } from '@polyv/live-watch-sdk';
import { useGlobalInject } from '@/app/use-global-inject';
import { useThemeStore } from '@/store/use-theme-store';

export const useCountDownLayer = () => {
  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();

  const themeStore = useThemeStore();

  /** 是否显示右上角模式 */
  const isTopRightStyle = computed<boolean>(() => {
    // return false;
    if (themeStore.watchThemeStyleConfig) {
      return true;
    }

    const playMode = watchCore.channel.getChannelPlayMode();
    return typeof playMode !== 'undefined' && playMode !== ChannelPlayMode.End;
  });

  return {
    isTopRightStyle,
  };
};
