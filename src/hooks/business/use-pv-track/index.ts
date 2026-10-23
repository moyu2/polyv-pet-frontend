import { useGlobalInject } from '@/app/use-global-inject';
import { useChannelStore } from '@/store/use-channel-store';
import { RtasTrackPageType } from '@polyv/live-watch-sdk';
import { watchEffect } from 'vue';

export const usePvTrack = (pageType: RtasTrackPageType) => {
  const channelStore = useChannelStore();

  const { getWatchCore } = useGlobalInject();

  watchEffect(() => {
    const watchCore = getWatchCore();
    watchCore.rtas.trackPageUV(pageType, channelStore.liveStatus);
  });
};
