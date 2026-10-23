import { useGlobalInject } from '@/app/use-global-inject';
import { usePlaybackStore } from '@/store/use-playback-store';
import type { PlaybackOutlineData } from '@polyv/live-watch-sdk';
import { ref, watch } from 'vue';

const jsonRecord: Record<string, Promise<PlaybackOutlineData>> = {};

export const useAIPlaybackOutline = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const playbackStore = usePlaybackStore();

  const aiOutlineEnabled = ref(true);

  const outlineUrl = ref<string>('');

  // 大纲数据
  const outlineData = ref<PlaybackOutlineData>();

  function getJsonData(url: string) {
    if (!jsonRecord[url]) {
      jsonRecord[url] = new Promise(resolve => {
        (async () => {
          const data = await watchCore.playback.getOutlineList(url);
          resolve(data);
        })();
      });
    }
    return jsonRecord[url];
  }

  function getOutlineUrl() {
    const playbackTarget = playbackStore.currentPlaybackTarget;
    if (!playbackTarget || !playbackTarget.outline?.outlineUrl) {
      return '';
    }

    return playbackTarget.outline.outlineUrl;
  }

  async function getOutlineData() {
    outlineUrl.value = getOutlineUrl();
    if (!outlineUrl.value) {
      outlineData.value = undefined;
      return;
    }

    const data = await getJsonData(outlineUrl.value);
    outlineData.value = data;
  }

  watch(
    () => playbackStore.currentPlaybackTarget,
    () => {
      getOutlineData();
    },
    {
      immediate: true,
    },
  );

  return {
    outlineUrl,
    outlineData,
    aiOutlineEnabled,
  };
};
