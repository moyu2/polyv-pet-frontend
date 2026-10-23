import { useGlobalInject } from '@/app/use-global-inject';
import { usePlaybackStore } from '@/store/use-playback-store';
import { AISubtitleParsedItem } from '@polyv/live-watch-sdk';
import { ref, watch } from 'vue';

const jsonRecord: Record<string, Promise<AISubtitleParsedItem[]>> = {};

export const useAISubtitleList = () => {
  const { getWatchCore } = useGlobalInject();

  const playbackStore = usePlaybackStore();

  const watchCore = getWatchCore();

  const aiSubtitleListEnabled = ref(true);

  const srtUrl = ref<string>();

  const srtData = ref<AISubtitleParsedItem[]>();

  function getJsonData(url: string) {
    if (!jsonRecord[url]) {
      jsonRecord[url] = new Promise(resolve => {
        (async () => {
          const data = await watchCore.playback.getAiSubtitleList(url);
          resolve(data);
        })();
      });
    }
    return jsonRecord[url];
  }

  async function getSrtUrl() {
    const playbackTarget = playbackStore.currentPlaybackTarget;
    if (!playbackTarget || !playbackTarget.subtitleList) {
      return '';
    }

    const originSubtitle = playbackTarget.subtitleList.find(i => i.isOriginal === 'Y');
    if (!originSubtitle) {
      return '';
    }

    return originSubtitle.srtUrl;
  }

  async function getSrtData() {
    srtUrl.value = await getSrtUrl();
    if (!srtUrl.value) {
      srtData.value = undefined;
      return;
    }

    const data = await getJsonData(srtUrl.value);
    srtData.value = data;
  }

  watch(
    () => playbackStore.currentPlaybackTarget,
    () => {
      getSrtData();
    },
    {
      immediate: true,
    },
  );

  return {
    srtUrl,
    srtData,
    aiSubtitleListEnabled,
  };
};
