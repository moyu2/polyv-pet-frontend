import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { useChannelStore } from '@/store/use-channel-store';
import { translate } from '@/assets/lang';
import { computed } from 'vue';

export const usePlayerStreamStopText = () => {
  const { getWatchCore } = useMultiPolyvWatchApp();
  const watchCore = getWatchCore();
  const channelStore = useChannelStore();

  const isBanPushStream = watchCore.channel.getBanPushStream();

  // 是否显示回放待生成
  const getIsShowWaitPlaybackText = (): boolean => {
    const isPrivateSeminarChannel = channelStore.privateSeminarChannel;
    const showPlaybackWaitTextEnabled = watchCore.channel.getShowPlaybackWaitTextEnabled();
    const enabledPlayback = watchCore.channel.getEnablePlayback();
    const inTargetSession = watchCore.inTargetSession();

    return (
      !inTargetSession && showPlaybackWaitTextEnabled && enabledPlayback && !isPrivateSeminarChannel
    );
  };

  // 是否启用参数directPlayCutOff
  const isEnableDirectPlayCutOff = computed(() => {
    return getIsShowWaitPlaybackText() || isBanPushStream;
  });

  // 获取流停止文本
  const getStreamStopText = () => {
    const isPrivateSeminarChannel = channelStore.privateSeminarChannel;

    // 私有研讨会频道优先返回
    if (isPrivateSeminarChannel) {
      return translate('seminar.noLive');
    }

    if (isBanPushStream) {
      return translate('channel.noLive');
    }

    // 根据回放待生成条件返回对应文本
    return getIsShowWaitPlaybackText()
      ? translate('player.streamStop.waitPlayback')
      : translate('channel.noLive');
  };

  return {
    getStreamStopText,
    getIsShowWaitPlaybackText,
    isEnableDirectPlayCutOff,
  };
};
