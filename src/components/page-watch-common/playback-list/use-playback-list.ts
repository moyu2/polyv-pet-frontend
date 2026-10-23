import { appEvents } from '@/app/app-events';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { useChannelStore } from '@/store/use-channel-store';

import { usePlaybackStore } from '@/store/use-playback-store';
import { LiveStatus, PlaybackTarget, plvWait } from '@polyv/live-watch-sdk';

export const usePlaybackList = () => {
  const playbackStore = usePlaybackStore();
  const channelStore = useChannelStore();
  const { getEmitter, getWatchCore } = useMultiPolyvWatchApp();
  const watchCore = getWatchCore();

  /**
   * 处理点击回放节点
   */
  async function onClickPlaybackItem(target: PlaybackTarget) {
    // 处理直播结束后，首次点击播放往期视频的情况
    if (!playbackStore.currentPlaybackTarget && target) {
      channelStore.$patch({
        liveStatus: LiveStatus.Playback,
      });
      playbackStore.updateCurrentPlaybackTarget(target);
      getEmitter().emit(appEvents.player.ResetUpPlayer);
      return;
    }

    playbackStore.updateCurrentPlaybackTarget(target);

    // 聊天重放需要重新渲染聊天列表
    if (playbackStore.chatMsgReplayEnabled) {
      getEmitter().emit(appEvents.chat.ResetUpChatMsgList);
    }

    await watchCore.player.changePlayback(target.playbackOptions);

    await plvWait(300);
    watchCore.player.play();
  }

  return {
    onClickPlaybackItem,
  };
};
