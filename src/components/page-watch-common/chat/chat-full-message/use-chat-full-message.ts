import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { copyText } from '@/assets/utils/copy';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { useToastManager } from '@/hooks/components/use-toast';
import { ChatMsgSpeakType } from '@polyv/live-watch-sdk';
import { ref } from 'vue';
import { useChatMsgUser } from '../chat-msg-list/msg-items/_hooks/chat-msg-user-hook';
import { FullMsgData } from './type';

export const useChatFullMessage = () => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const { visible, setVisible } = useSimpleVisible();

  const fullContent = ref('');

  const chatMsg = ref<ChatMsgSpeakType>();

  const { msgUserAvatar, msgUserActor, msgUserNick, msgUserType } = useChatMsgUser({
    chatMsg,
  });

  useEventBusListener(appEvents.chat.ShowFullMessage, (data: FullMsgData) => {
    const watchCore = getWatchCore();
    // 表情标签转换
    fullContent.value = watchCore.chat.parseSpeakContent(data.fullContent, {
      parseEmotion: true,
      parseLineBreak: true,
    });

    chatMsg.value = data.chatMsg;
    setVisible(true);
  });

  /**
   * 复制内容
   */
  async function copyContent() {
    await copyText(fullContent.value);
    toast.success(translate('copy.success'));
  }

  return {
    visible,
    fullContent,
    chatMsg,
    msgUserAvatar,
    msgUserNick,
    msgUserType,
    msgUserActor,
    copyContent,
  };
};
