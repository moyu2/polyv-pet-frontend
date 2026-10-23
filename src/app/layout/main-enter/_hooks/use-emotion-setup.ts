import { useGlobalInject } from '@/app/use-global-inject';
import { useChatStore } from '@/store/use-chat-store';

export const useEmotionSetup = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();
  const chatStore = useChatStore();

  async function setupEmotionParser() {
    try {
      await watchCore.emotion.setupEmotionParser();
      chatStore.$patch({
        emotionResourceLoaded: true,
      });
    } catch (error) {
      console.error('setupEmotionParser error', error);
    }
  }

  return {
    setupEmotionParser,
  };
};
