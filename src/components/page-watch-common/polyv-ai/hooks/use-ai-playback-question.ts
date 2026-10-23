import { useGlobalInject } from '@/app/use-global-inject';
import { usePlaybackStore } from '@/store/use-playback-store';
import { ref, watch } from 'vue';
import type { PlaybackQuestionData } from '@polyv/live-watch-sdk';

const jsonRecord: Record<string, Promise<PlaybackQuestionData>> = {};

export const useAIPlaybackQuestion = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const playbackStore = usePlaybackStore();

  const questionUrl = ref<string>();

  // 答题数据
  const questionData = ref<PlaybackQuestionData>();

  function getJsonData(url: string) {
    if (!jsonRecord[url]) {
      jsonRecord[url] = new Promise(resolve => {
        (async () => {
          const data = await watchCore.playback.getQuestionList(url);
          resolve(data);
        })();
      });
    }
    return jsonRecord[url];
  }

  function getQuestionUrl() {
    const playbackTarget = playbackStore.currentPlaybackTarget;
    if (!playbackTarget || !playbackTarget.outline?.questionUrl) {
      return '';
    }

    return playbackTarget.outline.questionUrl;
  }

  async function getQuestionData() {
    questionUrl.value = getQuestionUrl();
    if (!questionUrl.value) {
      questionData.value = undefined;
      return;
    }

    if (!playbackStore.aiKnowledgeQuizEnabled) {
      questionData.value = undefined;
      return;
    }

    const data = await getJsonData(questionUrl.value);
    questionData.value = data;
  }

  watch(
    () => playbackStore.currentPlaybackTarget,
    () => {
      getQuestionData();
    },
    {
      immediate: true,
    },
  );

  return {
    questionUrl,
    questionData,
  };
};
