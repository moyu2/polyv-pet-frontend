import { useGlobalInject } from '@/app/use-global-inject';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlaybackStore } from '@/store/use-playback-store';
import { onBeforeUnmount, watch } from 'vue';

/** 只衔接观看页生命周期；接口、时间和原数据投递均由观看页 SDK 处理。 */
export function useChatReplay() {
  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();
  const { currentPlaybackTarget, chatReplayEnabled, chatMsgReplayEnabled } =
    storeDefinitionToRefs(usePlaybackStore);

  watch(
    [currentPlaybackTarget, chatReplayEnabled, chatMsgReplayEnabled],
    async () => {
      if (chatReplayEnabled.value) {
        // init 内同步废弃旧请求，分段就绪后按最新时间恢复快照。
        const ready = watchCore.chat.initChatMsgReplay({ useChatSdkV2: true });
        watchCore.chat.processChatMsgReplay({
          currentTime: watchCore.player.getCurrentTime(),
          durationTime: watchCore.player.getPlayerInfo().durationTime,
        });
        await ready;
      } else {
        watchCore.chat.resetChatMsgReplay();
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => watchCore.chat.resetChatMsgReplay());
  return { chatMsgReplayEnabled };
}
