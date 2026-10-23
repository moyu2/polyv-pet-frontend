/**
 * @file 观看页轮询相关的 hook
 */
import { useChannelStore } from '@/store/use-channel-store';
import { onBeforeUnmount, watchEffect } from 'vue';
import { LiveStatus } from '@polyv/live-watch-sdk';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useGlobalInject } from '@/app/use-global-inject';

/**
 * 根据 liveStatus 设置 pv 轮询
 */
export const usePageViewPolling = () => {
  const channelStore = useChannelStore();
  const channelInfoStore = useChannelInfoStore();

  const { getWatchCore } = useGlobalInject();

  watchEffect(() => {
    const watchCore = getWatchCore();

    if (channelStore.liveStatus === LiveStatus.Live) {
      watchCore.channel.startPageViewPolling((pageViewCount: number) => {
        if (channelInfoStore.pageViewCount !== pageViewCount) {
          channelInfoStore.$patch({
            pageViewCount,
          });
        }
      });
    } else {
      watchCore.channel.stopPageViewPolling();

      // eslint-disable-next-line promise/prefer-await-to-then
      watchCore.channel.getLatestPageView().then(pageViewCount => {
        channelInfoStore.$patch({
          pageViewCount,
        });
      });
    }
  });

  onBeforeUnmount(() => {
    const watchCore = getWatchCore();
    watchCore.channel.stopPageViewPolling();
  });
};

/**
 * 会议模式轮询
 * @desc 由于会议模式下不需要用到播放器，需要手动开启直播状态轮询
 */
export const usePolyvMeetingPolling = () => {
  const { getWatchCore } = useGlobalInject();

  const watchAppStore = useWatchAppStore();

  watchEffect(() => {
    if (watchAppStore.meetingMode) {
      const watchCore = getWatchCore();
      watchCore.channel.startLiveStatusPolling();
    }
  });
};

/**
 * 小班课轮询
 * @desc 由于小班课场景下只连麦不使用播放器直播，需要手动开启直播状态轮询
 */
export const useSmallClassPolling = () => {
  const { getWatchCore } = useGlobalInject();
  const channelStore = useChannelStore();
  const pollingId = 'small-class-polling';
  const watchCore = getWatchCore();

  watchEffect(() => {
    if (channelStore.isSmallClassChannel) {
      watchCore.channel.startLiveStatusPolling(pollingId);
    }
  });

  onBeforeUnmount(() => {
    watchCore.channel.removeLiveStatusPolling(pollingId);
  });
};
