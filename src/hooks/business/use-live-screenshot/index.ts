import { useGlobalInject } from '@/app/use-global-inject';
import { useChannelStore } from '@/store/use-channel-store';
import { concat as appendToURL } from '@polyv/utils/querystring';
import { LiveStatus, PlayerEvents } from '@polyv/live-watch-sdk';
import { useSetInterval } from '@polyv/vue-components';
import { onMounted, ref, watch } from 'vue';

/**
 * 直播截图 hook
 */
export const useLiveScreenshot = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const channelStore = useChannelStore();

  /** 直播截图地址 */
  const liveScreenshotUrl = ref<string>();

  /**
   * 刷新直播截图
   */
  function refreshLiveScreenshotUrl() {
    if (channelStore.liveStatus !== LiveStatus.Live) {
      liveScreenshotUrl.value = undefined;
      return;
    }

    const url = watchCore.player.getLiveStreamCaptureUrl();
    if (!url) {
      return;
    }

    liveScreenshotUrl.value = appendToURL(url, {
      t: Date.now(),
    });
  }

  const { startInterval, closeInterval } = useSetInterval(refreshLiveScreenshotUrl, 2 * 60 * 1000);

  onMounted(() => {
    refreshLiveScreenshotUrl();
    startInterval();

    watchCore.player.eventEmitter.once(PlayerEvents.PlayerInited, () => {
      refreshLiveScreenshotUrl();
    });
  });

  watch(
    () => channelStore.liveStatus,
    () => {
      if (channelStore.liveStatus === LiveStatus.Live) {
        startInterval();
      } else {
        closeInterval();
      }
      refreshLiveScreenshotUrl();
    },
    {
      immediate: true,
    },
  );

  return {
    liveScreenshotUrl,
    refreshLiveScreenshotUrl,
  };
};
