import { useGlobalInject } from '@/app/use-global-inject';
import { usePlaybackStore } from '@/store/use-playback-store';
import { usePlayerStore } from '@/store/use-player-store';
import { ChapterItem } from '@polyv/live-watch-sdk';
import { ref, watch, watchEffect } from 'vue';
import { CSSProperties } from 'vue/types/jsx';
import { usePlayerAction } from '../../player/hooks/use-player-action';

export const useChapter = () => {
  const { getWatchCore } = useGlobalInject();

  const { toPlay, toSeekVideo } = usePlayerAction();
  const playbackStore = usePlaybackStore();
  const playerStore = usePlayerStore();

  /** 章节列表 */
  const chapterList = ref<ChapterItem[]>([]);

  /**
   * 获取章节列表
   */
  async function getChapterList() {
    chapterList.value = [];
    const playbackTarget = playbackStore.currentPlaybackTarget;
    if (!playbackTarget) {
      return;
    }

    const watchCore = getWatchCore();
    const list = await watchCore.playback.getChapterList(playbackTarget.playbackOptions);
    chapterList.value = list;
  }

  /**
   * 处理点击章节
   */
  function onClickChapter(item: ChapterItem) {
    toSeekVideo(item.duration);
    toPlay();
  }

  watch(
    () => playbackStore.currentPlaybackTarget,
    () => {
      getChapterList();
    },
    {
      immediate: true,
    },
  );

  const currentIndex = ref(0);

  watchEffect(() => {
    const currentTime = playerStore.currentTime;
    // 时间倒叙寻找能当前能匹配到的最后一个章节
    for (let i = chapterList.value.length - 1; i >= 0; i--) {
      if (currentTime >= chapterList.value[i].duration) {
        currentIndex.value = i;
        break;
      }
    }
  });

  function getChapterCoverStyle(chapterItem: ChapterItem): CSSProperties {
    if (chapterItem.image) {
      return {
        backgroundImage: `url(${chapterItem.image})`,
      };
    } else {
      return {
        backgroundColor: 'rgba(255,255,255,0.4)',
      };
    }
  }

  return {
    getChapterCoverStyle,

    chapterList,
    currentIndex,
    onClickChapter,
  };
};
