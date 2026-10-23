import { useGlobalInject } from '@/app/use-global-inject';
import { ChatEvents, ChatMsgSource, ChatMsgType, ChatUserType } from '@polyv/live-watch-sdk';
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

export const useBulletinMarquee = () => {
  const { getWatchCore } = useGlobalInject();

  const MarqueeContentRef = ref<HTMLDivElement>();

  const watchCore = getWatchCore();

  const content = ref('');

  const animation = ref('');

  /** 处理聊天室消息 */
  function onChatMsgEvent(evt: { chatMsg: ChatMsgType }) {
    const chatMsg = evt.chatMsg;
    if (chatMsg.msgSource !== ChatMsgSource.Speak) {
      return;
    }

    if (chatMsg.user.userType !== ChatUserType.Manager) {
      return;
    }

    content.value = watchCore.chat.parseSpeakContent(chatMsg.content, {
      parseLink: true,
      parseEmotion: true,
    });
  }

  let timer: number | null = null;

  watch(
    () => content.value,
    () => {
      nextTick(() => {
        const $marqueeContent = MarqueeContentRef.value;

        if (!$marqueeContent) {
          animation.value = '';
          return;
        }

        const marqueeWidth = 280;
        const marqueeContentWidth = $marqueeContent && $marqueeContent.clientWidth;
        const duration = (marqueeContentWidth + marqueeWidth) / 55; // 55px每秒

        animation.value = `${duration}s linear 1s infinite normal none running marquee`;

        if (timer) {
          clearTimeout(timer);
        }
        timer = window.setTimeout(() => {
          content.value = '';
          timer = null;
        }, duration * 1000 * 3 + 1000);
      });
    },
    { immediate: true },
  );

  onMounted(() => {
    const watchCore = getWatchCore();
    watchCore.chat.eventEmitter.on(ChatEvents.ChatMessage, onChatMsgEvent);
  });

  onBeforeUnmount(() => {
    const watchCore = getWatchCore();
    watchCore.chat.eventEmitter.off(ChatEvents.ChatMessage, onChatMsgEvent);
  });

  return {
    MarqueeContentRef,

    content,
    animation,
  };
};
