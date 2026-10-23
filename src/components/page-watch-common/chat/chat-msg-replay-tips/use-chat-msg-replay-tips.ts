import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlaybackStore } from '@/store/use-playback-store';
import { ChatEvents, ChatMsgReplayStatus } from '@polyv/live-watch-sdk';
import { computed, onBeforeMount, ref, unref } from 'vue';

export const useChatMsgReplayTips = () => {
  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();

  const { chatMsgReplayEnabled } = storeDefinitionToRefs(usePlaybackStore);

  const showTips = computed(() => {
    return unref(chatMsgReplayEnabled);
  });

  const replayTipStatus = ref<ChatMsgReplayStatus>();

  const content = computed(() =>
    replayTipStatus.value === ChatMsgReplayStatus.Wait
      ? translate('chat.msg.replay.tips.wait')
      : translate('chat.msg.replay.tips.ing'),
  );

  onBeforeMount(() => {
    watchCore.chat.eventEmitter.on(ChatEvents.ChatMsgReplayStatusChange, ({ status }) => {
      replayTipStatus.value = status;
      if (status !== ChatMsgReplayStatus.Wait && status !== ChatMsgReplayStatus.InitSuccess) {
        console.error('useChatMsgReplayTips', status);
      }
    });
  });

  return {
    showTips,
    content,
  };
};
