import { useGlobalInject } from '@/app/use-global-inject';
import { usePolyvAIStore } from '@/store/use-polyv-ai-store';

export const useWatchAICoreSetup = () => {
  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();

  const polyvAIStore = usePolyvAIStore();

  async function loadWatchAICore() {
    try {
      await watchCore.polyvAI.setupWatchAICore();

      polyvAIStore.syncPolyvAIStore();
      polyvAIStore.$patch({
        watchAICoreSetuped: true,
      });
    } catch (error) {
      console.error('watch-ai-core load error', error);
    }
  }

  return {
    loadWatchAICore,
  };
};
