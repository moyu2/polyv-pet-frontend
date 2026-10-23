import { previewImage } from '@/hooks/components/use-image-preview';
import { ChatMsgEmotionType } from '@polyv/live-watch-sdk';
import { computed, ref, unref } from 'vue';
import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';

export const useEmotionMsg = () => {
  const { chatMsg } = useChatMsgDataInject<ChatMsgEmotionType>();

  /** 表情图片地址 */
  const emotionUrl = computed(() => {
    return unref(chatMsg).emotionUrl;
  });

  /** 是否加载完成 */
  const isLoaded = ref(false);

  function onImgLoad() {
    isLoaded.value = true;
  }

  function onClickEmotion() {
    previewImage([unref(emotionUrl)]);
  }

  return {
    emotionUrl,
    isLoaded,
    onImgLoad,
    onClickEmotion,
  };
};
