import { useGlobalInject } from '@/app/use-global-inject';

export const useChatTarget = () => {
  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();
  const chatTarget = watchCore.chat.chatTarget!;

  const { ChatMsgSource } = chatTarget;

  return {
    chatTarget,
    ChatMsgSource,
  };
};
