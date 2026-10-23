import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import {
  PlayerEvents,
  PlayerEventsRelations,
  ReplaySubtitleItem,
  SubtitleParsedItem,
} from '@polyv/live-watch-sdk';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { useLayoutStore } from '@/store/use-layout-store';
import { ynToBool } from '@polyv/utils/boolean';
import { getSubtitleSettings, setSubtitleSettings } from './subtitle-settings-storage';

const TIME_RATIO = 1000;

let replaySubtitleInstanceCount = 0;

export const useReplaySubtitle = () => {
  const subtitleStore = useSubtitleStore();
  const { isPortraitWatchLayout } = storeDefinitionToRefs(useLayoutStore);

  const {
    mainReplaySubtitleShow,
    subReplaySubtitleShow,
    replaySubtitleList,
    curSelectedReplaySubtitleItemId,
  } = storeDefinitionToRefs(useSubtitleStore);

  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();

  // 主字幕集合
  const mainSrtList = ref<SubtitleParsedItem[]>([]);
  // 翻译字幕集合
  const translatedSrtListMap = ref<{ [langId: string]: SubtitleParsedItem[] }>({});
  // 主字幕-单行
  const mainText = ref('');
  // 翻译字幕-单行
  const translatedText = ref('');
  const lastTime = ref(0);

  // const shouldRememberState = computed(() => isPortraitWatchLayout.value); // 是否记住开关设置
  const shouldRememberState = computed(() => isPortraitWatchLayout.value); // 是否记住开关设置

  const resetSubtitleCollections = () => {
    translatedSrtListMap.value = {};
    mainSrtList.value = [];
    mainText.value = '';
    translatedText.value = '';
  };

  const handleEmptyList = (rememberState: boolean, prevMainShow: boolean, prevSubShow: boolean) => {
    if (!rememberState) {
      subtitleStore.changeMainReplaySubtitleShow(false);
      subtitleStore.changeSubReplaySubtitleShow(false);
      return;
    }

    if (prevMainShow) {
      subtitleStore.changeMainReplaySubtitleShow(false);
    }
    if (prevSubShow) {
      subtitleStore.changeSubReplaySubtitleShow(false);
    }
  };

  const syncSubtitleVisibility = (
    list: ReplaySubtitleItem[],
    rememberState: boolean,
    prevMainShow: boolean,
    prevSubShow: boolean,
  ) => {
    const hasOriginalSubtitle = list.some(item => ynToBool(item.isOriginal));
    const hasTranslateSubtitle = list.some(item => !ynToBool(item.isOriginal));

    if (!rememberState) {
      subtitleStore.changeMainReplaySubtitleShow(hasOriginalSubtitle);
      subtitleStore.changeSubReplaySubtitleShow(hasTranslateSubtitle);
      return;
    }

    if (!hasOriginalSubtitle && mainReplaySubtitleShow.value) {
      subtitleStore.changeMainReplaySubtitleShow(false);
    } else if (hasOriginalSubtitle && prevMainShow !== mainReplaySubtitleShow.value) {
      subtitleStore.changeMainReplaySubtitleShow(prevMainShow);
    }

    if (!hasTranslateSubtitle && subReplaySubtitleShow.value) {
      subtitleStore.changeSubReplaySubtitleShow(false);
    } else if (hasTranslateSubtitle && prevSubShow !== subReplaySubtitleShow.value) {
      subtitleStore.changeSubReplaySubtitleShow(prevSubShow);
    }
  };

  const setReplaySubtitleList = (list: ReplaySubtitleItem[]) => {
    watchCore.subtitle.setReplaySubtitleList(list);
  };

  const setReplaySrtList = async (subtitleItem: ReplaySubtitleItem) => {
    if (!subtitleItem.srtUrl) return;

    const subtitleContent = await watchCore.subtitle.getReplaySubtitleContent(subtitleItem.srtUrl);
    const parsedList = watchCore.subtitle.parseReplaySubtitleContent(subtitleContent);

    const normalizedList = parsedList.map(item => {
      return {
        start: item.start / TIME_RATIO,
        end: item.end / TIME_RATIO,
        text: item.text,
        index: item.index,
      };
    });

    if (ynToBool(subtitleItem.isOriginal)) {
      mainSrtList.value = normalizedList;
      if (!shouldRememberState.value) {
        subtitleStore.changeMainReplaySubtitleShow(true);
      }
    } else {
      translatedSrtListMap.value[String(subtitleItem.id)] = normalizedList;
      if (!shouldRememberState.value) {
        subtitleStore.changeSubReplaySubtitleShow(true);
      }
    }
  };

  const getDisplayTextByTime = (list: SubtitleParsedItem[], time: number) => {
    if (!list.length) return '';
    const target = list.find(item => time >= item.start && time <= item.end);
    return target?.text ?? '';
  };

  const updateTranslatedText = (time: number) => {
    const targetList = translatedSrtListMap.value[curSelectedReplaySubtitleItemId.value];
    if (targetList) {
      translatedText.value = getDisplayTextByTime(targetList, time);
    } else {
      translatedText.value = '';
    }
  };

  const selectFirstAvailableTranslateSubtitle = () => {
    const currentList = replaySubtitleList.value;
    const translateCandidates = currentList.filter(item => !ynToBool(item.isOriginal));
    if (!translateCandidates.length) return;

    const currentExists = translateCandidates.some(
      item => String(item.id) === curSelectedReplaySubtitleItemId.value,
    );
    if (!shouldRememberState.value) {
      subtitleStore.$patch({
        curSelectedReplaySubtitleItemId: String(translateCandidates[0].id),
      });
      return;
    }

    if (!currentExists) {
      subtitleStore.$patch({
        curSelectedReplaySubtitleItemId: String(translateCandidates[0].id),
      });
    }
  };

  const onPlayerTimeUpdate = (params: PlayerEventsRelations[PlayerEvents.TimeUpdate]) => {
    lastTime.value = params.currentTime;
    mainText.value = getDisplayTextByTime(mainSrtList.value, params.currentTime);
    updateTranslatedText(params.currentTime);
  };

  const onPlayerUIReplaySubtitleChecked = (
    data: PlayerEventsRelations[PlayerEvents.PlayerUIReplaySubtitleChecked],
  ) => {
    if (ynToBool(data.isOriginal)) {
      subtitleStore.changeMainReplaySubtitleShow(data.checked);
    } else {
      subtitleStore.changeSubReplaySubtitleShow(data.checked);
    }
  };

  const bindPlayerEvents = () => {
    watchCore.player.eventEmitter.on(
      PlayerEvents.PlayerUIReplaySubtitleChecked,
      onPlayerUIReplaySubtitleChecked,
    );
    watchCore.player.eventEmitter.on(PlayerEvents.TimeUpdate, onPlayerTimeUpdate);
  };

  const unbindPlayerEvents = () => {
    watchCore.player.eventEmitter.off(
      PlayerEvents.PlayerUIReplaySubtitleChecked,
      onPlayerUIReplaySubtitleChecked,
    );
    watchCore.player.eventEmitter.off(PlayerEvents.TimeUpdate, onPlayerTimeUpdate);
  };

  const stopReplayListWatch = watch(
    () => replaySubtitleList.value,
    list => {
      const prevMainShow = mainReplaySubtitleShow.value;
      const prevSubShow = subReplaySubtitleShow.value;
      const rememberState = shouldRememberState.value;

      resetSubtitleCollections();

      if (!list.length) {
        handleEmptyList(rememberState, prevMainShow, prevSubShow);
        return;
      }

      setReplaySubtitleList(list);

      list.forEach(item => {
        setReplaySrtList(item);
      });

      syncSubtitleVisibility(list, rememberState, prevMainShow, prevSubShow);

      selectFirstAvailableTranslateSubtitle();
    },
    { immediate: true },
  );

  const initReplaySettingsFromStorage = () => {
    if (!shouldRememberState.value) return;
    const settings = getSubtitleSettings();
    subtitleStore.changeMainReplaySubtitleShow(settings.portraitReplayMainEnabled);
    subtitleStore.changeSubReplaySubtitleShow(settings.portraitReplaySubEnabled);
  };

  watch(
    () => shouldRememberState.value,
    remember => {
      if (remember) {
        initReplaySettingsFromStorage();
      }
    },
    { immediate: true },
  );

  watch(
    () => [mainReplaySubtitleShow.value, subReplaySubtitleShow.value],
    ([mainShow, subShow]) => {
      if (!shouldRememberState.value) return;
      setSubtitleSettings({
        portraitReplayMainEnabled: !!mainShow,
        portraitReplaySubEnabled: !!subShow,
      });
    },
  );

  const stopSelectedWatch = watch(
    () => curSelectedReplaySubtitleItemId.value,
    () => {
      updateTranslatedText(lastTime.value);
    },
  );

  onMounted(() => {
    replaySubtitleInstanceCount += 1;
    bindPlayerEvents();
  });

  onBeforeUnmount(() => {
    unbindPlayerEvents();
    stopReplayListWatch();
    stopSelectedWatch();
    replaySubtitleInstanceCount -= 1;
    if (replaySubtitleInstanceCount <= 0) {
      setReplaySubtitleList([]);
      replaySubtitleInstanceCount = 0;
    }
  });

  return {
    mainText,
    translatedText,
    mainReplaySubtitleShow,
    subReplaySubtitleShow,
  };
};
