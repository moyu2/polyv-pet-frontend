import { computed } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlayerStore } from '@/store/use-player-store';
import { useThemeStore } from '@/store/use-theme-store';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { usePlayerStreamStopText } from '../../hooks/use-player-stream-stop-text';

interface NoneLivePanelOptions {
  /**
   * 开启直播预约倒计时时是否仍显示占位面板
   * @description 竖屏的倒计时层是个小胶囊，不接管播放器区域，故需要继续显示占位面板
   * @default false
   */
  showOnLiveCountDown?: boolean;
}

/** 暂无直播占位面板 */
export const useNoneLivePanel = (options: NoneLivePanelOptions = {}) => {
  const { showOnLiveCountDown = false } = options;

  const { noneLiveVisible, warmUpRenderCover, isPlayStarted } =
    storeDefinitionToRefs(usePlayerStore);

  const { watchThemeStyleConfig } = storeDefinitionToRefs(useThemeStore);

  const { showLiveCountDown } = storeDefinitionToRefs(useChannelInfoStore);

  const { getIsShowWaitPlaybackText } = usePlayerStreamStopText();

  /** 暂无直播占位面板是否显示 */
  const noneLivePanelVisible = computed<boolean>(() => {
    // 回放待生成状态需要展示占位面板的提示文案，不让位于主题默认图 / 封面图
    const isWaitPlayback = getIsShowWaitPlaybackText();

    // 多皮肤主题下，播放器区域由封面图组件的主题默认图接管
    if (watchThemeStyleConfig.value && !isWaitPlayback) {
      return false;
    }

    // 开启直播预约倒计时时，播放器区域由倒计时层接管
    if (!showOnLiveCountDown && showLiveCountDown.value && !isWaitPlayback) {
      return false;
    }

    // 配置了播放器封面图（暖场图）且未开始播放时，播放器区域由封面图接管。
    // PC / 移动端横屏在 CDN 播放器下不由页面渲染封面图（见 usePlayerStore.showWarmUpImg），
    // 而是播放器自身渲染，故这里不能只看 noneLiveVisible，否则会把封面图盖住
    if (warmUpRenderCover.value && !isPlayStarted.value && !isWaitPlayback) {
      return false;
    }

    return noneLiveVisible.value;
  });

  return {
    noneLivePanelVisible,
  };
};
