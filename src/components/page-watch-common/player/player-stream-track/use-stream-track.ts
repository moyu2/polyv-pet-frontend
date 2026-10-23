import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { LangType } from '@/assets/lang/lang-enum';
import { useChannelStore } from '@/store/use-channel-store';
import { useLangStore } from '@/store/use-lang-store';
import { usePlayerStore } from '@/store/use-player-store';
import {
  ChannelStreamTrackItem,
  ChannelStreamTrackType,
  WatchSdkLangEnum,
} from '@polyv/live-watch-sdk';
import { computed, watch } from 'vue';

export const useStreamTrack = () => {
  const { getWatchCore, getEmitter } = useGlobalInject();

  const watchCore = getWatchCore();
  const langStore = useLangStore();
  const channelStore = useChannelStore();
  const playerStore = usePlayerStore();

  watch(
    () => langStore.currentLang,
    () => {
      const streamTrackConfig = watchCore.channel.getChannelStreamTrackConfig();
      channelStore.$patch({
        streamTrackConfig,
      });
    },
  );

  const streamTrackType = computed(() => {
    if (!channelStore.streamTrackConfig) return ChannelStreamTrackType.Single;

    return channelStore.streamTrackConfig.type;
  });

  const isMultiLanguageTrack = computed(() => {
    if (!channelStore.streamTrackConfig) return false;

    return channelStore.streamTrackConfig.type === ChannelStreamTrackType.MultiLanguageTrack;
  });

  const streamTrackList = computed(() => {
    if (!channelStore.streamTrackConfig) return [];

    return channelStore.streamTrackConfig.trackList;
  });

  function switchStreamTrack(trackItem: ChannelStreamTrackItem) {
    if (!channelStore.streamTrackConfig) return;

    playerStore.$patch({ streamTrackKey: trackItem.key });

    if (channelStore.streamTrackConfig.type === ChannelStreamTrackType.Normal) {
      getEmitter().emit(appEvents.player.ResetUpPlayer);
      return;
    }

    if (channelStore.streamTrackConfig.type === ChannelStreamTrackType.MultiLanguageTrack) {
      const lang = trackItem.lang === WatchSdkLangEnum.English ? LangType.English : LangType.ZH_CN;
      // 切换语言时也会自动重置播放器
      switchLanguage(lang);
    }
  }

  function switchLanguage(lang: LangType) {
    langStore.switchLang(lang);
  }

  function isActiveStreamTrack(trackItem: ChannelStreamTrackItem) {
    return trackItem.key === playerStore.streamTrackKey;
  }

  return {
    isMultiLanguageTrack,

    streamTrackType,
    streamTrackList,

    isActiveStreamTrack,
    switchStreamTrack,
  };
};
