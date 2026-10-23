import { ref, unref, watch } from 'vue';
import { LiveStatus } from '@polyv/live-watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { usePlayerAction } from '../player/hooks/use-player-action';

/**
 * 直播开始提示 hook
 */
export const useLiveStartTips = () => {
  const { toPlay } = usePlayerAction();
  const channelStore = useChannelStore();

  /** 提示是否显示 */
  const tipsVisible = ref(false);

  /** 打开提示 */
  function openTips() {
    tipsVisible.value = true;
  }

  /** 降级重新加载页面 */
  function fallbackReloadPage() {
    if (channelStore.isSeminarChannel) {
      setTimeout(() => {
        window.location.reload();
      }, Math.random() * 1000);
    }
  }

  /** 关闭提示 */
  function closeTips() {
    tipsVisible.value = false;
    if (channelStore.liveStatus === LiveStatus.Live) {
      toPlay();
    }
  }

  watch(
    () => unref(channelStore.liveStatus),
    (newStatus, oldStatus) => {
      if (!oldStatus) return;

      if (newStatus === LiveStatus.Live) {
        openTips();
      } else {
        closeTips();
      }
    },
    {
      immediate: true,
    },
  );

  return {
    tipsVisible,
    closeTips,
    fallbackReloadPage,
  };
};
