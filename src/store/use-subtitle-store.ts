/**
 * @file 实时字幕 store
 */
import {
  LiveStatus,
  PlaybackType,
  PlvSubtitleModule,
  ReplaySubtitleItem,
  SubtitleSourceLanguage,
  SubtitleSourceTranslateLanguage,
  SubtitleTranslateOption,
  YN,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, watch } from 'vue';
import { useChannelStore } from './use-channel-store';
import { useWatchAppStore } from './use-watch-app-store';
import { useLangStore } from './use-lang-store';
import { usePlaybackStore } from './use-playback-store';
import {
  getSubtitleSettings,
  setSubtitleSettings,
} from '@/components/page-watch-common/subtitle/subtitle-settings-storage';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

export interface SubtitleStoreState {
  /** 实时字幕开关 */
  subtitleRealTimeEnabled: Ref<boolean>;
  /** 实时字幕翻译开关 */
  subtitleTranslateEnabled: Ref<boolean>;
  /** 讲师是否打开实时字幕 */
  subtitlesTeacherEnable: Ref<boolean>;
  /** 本地实时字幕是否开启 */
  localUerSubtitlesEnable: Ref<boolean>;
  /** 字幕显示模式 */
  subtitleDisplayMode: Ref<'all' | 'source' | 'translate'>;
  /** 实时字幕是否可用 */
  liveSubtitlesEnable: ComputedRef<boolean>;
  /** 仅控制字幕界面的展示 */
  liveSubtitlesShow: ComputedRef<boolean>;
  /** 原声语言 */
  liveSubtitleSourceLanguage: Ref<SubtitleSourceLanguage>;
  /** 翻译语言 */
  liveSubtitleSourceTranslateLanguage: Ref<SubtitleSourceTranslateLanguage>;
  /** 翻译语言（可选列表） */
  liveSubtitleSourceTranslateLanguages: Ref<SubtitleSourceTranslateLanguage[]>;
  /** 实时字幕翻译可选项 */
  liveSubtitleSourceTranslateLanguageOptions: ComputedRef<SubtitleTranslateOption[]>;
  /** 实时字幕原声语言可选项 */
  liveSubtitleSourceLanguageOptions: ComputedRef<SubtitleTranslateOption[]>;
  /** 实时字幕显示数量限制开关 */
  subtitleDisplayNumberLimitEnabled: Ref<boolean>;
  /** 实时字幕最多显示多少条 */
  subtitleDisplayNumber: Ref<number>;

  // ==== 回放字幕 ====

  /** 回放字幕主字幕（原声字幕）是否显示 */
  mainReplaySubtitleShow: Ref<boolean>;
  /** 回放字幕副字幕（翻译字幕）是否显示 */
  subReplaySubtitleShow: Ref<boolean>;
  /** 当前选中的回放字幕Id */
  curSelectedReplaySubtitleItemId: Ref<string>;
  /** 回放字幕数据 */
  replaySubtitleList: ComputedRef<ReplaySubtitleItem[]>;
  /** 是否展示回放字幕 */
  replaySubtitleVisible: ComputedRef<boolean>;
  /** 回放字幕翻译可选项 */
  replaySubtitleSourceTranslateLanguageOptions: ComputedRef<SubtitleTranslateOption[]>;
  /** 回放字幕原声语言可选项 */
  replaySubtitleSourceLanguageOptions: ComputedRef<SubtitleTranslateOption[]>;
}

export interface SubtitleStoreAction {
  /** 同步实时字幕和回放字幕配置 */
  syncSubtitleConfig: () => void;
  /** 初始化实时字幕翻译 Map */
  initSubtitleSourceTranslateLanguageOptionMap: () => Promise<void>;
  /** 更改实时字幕翻译语言 */
  changeLiveSubtitleSourceTranslateLanguage: (lang: SubtitleSourceTranslateLanguage) => void;
  /** 改变讲师实时字幕状态 */
  changeSubtitlesTeacherEnable: (enable: boolean) => void;
  /** 改变本地实时字幕开启状态 */
  changeLocalUerSubtitlesEnable: (enable: boolean) => void;
  /** 改变字幕显示模式 */
  changeSubtitleDisplayMode: (mode: 'all' | 'source' | 'translate') => void;
  /** 初始化存储的字幕设置 */
  initSubtitleSettingsFromStorage: () => void;
  /** 改变回放主字幕是否显示 */
  changeMainReplaySubtitleShow: (show: boolean) => void;
  /** 改变回放副字幕是否显示 */
  changeSubReplaySubtitleShow: (show: boolean) => void;
}

export interface SubtitleStore extends SubtitleStoreState, SubtitleStoreAction {}

export const useSubtitleStore = defineStore<'subtitle', SubtitleStore>('subtitle', () => {
  const watchAppStore = useWatchAppStore();
  const channelStore = useChannelStore();
  const langStore = useLangStore();
  const playbackStore = usePlaybackStore();

  const __subtitleConfig = PlvSubtitleModule.generateDefaultSubtitleConfig();

  const subtitleSourceTranslateLanguageOptionMap = ref<{
    [key: string]: SubtitleTranslateOption | undefined;
  }>({});

  /** 实时字幕开关 */
  const subtitleRealTimeEnabled = ref(__subtitleConfig.subtitleRealTimeEnabled);

  /** 实时字幕翻译开关 */
  const subtitleTranslateEnabled = ref(__subtitleConfig.subtitleTranslateEnabled);

  /** 讲师是否打开实时字幕 */
  const subtitlesTeacherEnable = ref(true);

  /** 本地实时字幕是否开启 */
  const localUerSubtitlesEnable = ref(true);

  /** 字幕显示模式 */
  const subtitleDisplayMode = ref<'all' | 'source' | 'translate'>('all');

  /**
   * 改变讲师实时字幕状态
   */
  function changeSubtitlesTeacherEnable(enable: boolean): void {
    subtitlesTeacherEnable.value = enable;
  }

  /**
   * 改变本地实时字幕开启状态
   */
  function changeLocalUerSubtitlesEnable(enable: boolean): void {
    localUerSubtitlesEnable.value = enable;
    // 保存到本地存储
    setSubtitleSettings({ subtitleEnabled: enable });
  }

  /** 直播实时字幕是否可用 */
  const liveSubtitlesEnable = computed(() => {
    return (
      subtitleRealTimeEnabled.value &&
      subtitlesTeacherEnable.value &&
      channelStore.liveStatus === LiveStatus.Live
    );
  });

  /**
   * 仅控制字幕界面的展示
   */
  const liveSubtitlesShow = computed(() => {
    return liveSubtitlesEnable.value && localUerSubtitlesEnable.value;
  });

  /** 原声语言 */
  const liveSubtitleSourceLanguage = ref<SubtitleSourceLanguage>(
    __subtitleConfig.subtitleSourceLanguage,
  );

  /** 翻译语言 */
  const liveSubtitleSourceTranslateLanguage = ref<SubtitleSourceTranslateLanguage>(
    __subtitleConfig.subtitleTranslateLanguage,
  );

  /** 翻译语言（可选列表） */
  const liveSubtitleSourceTranslateLanguages = ref<SubtitleSourceTranslateLanguage[]>(
    __subtitleConfig.subtitleTranslateLanguages,
  );

  /** 实时字幕翻译可选项 */
  const liveSubtitleSourceTranslateLanguageOptions = computed<SubtitleTranslateOption[]>(() => {
    return liveSubtitleSourceTranslateLanguages.value.map(val => {
      const item = subtitleSourceTranslateLanguageOptionMap.value[val];
      const result: SubtitleTranslateOption = {
        label: val,
        value: val,
      };
      if (!langStore.isChineseLang) return result;
      return item || result;
    });
  });

  /** 实时字幕原声语言可选项 */
  const liveSubtitleSourceLanguageOptions = computed<SubtitleTranslateOption[]>(() => {
    const val = liveSubtitleSourceLanguage.value as string;
    const item = subtitleSourceTranslateLanguageOptionMap.value[val];
    const result: SubtitleTranslateOption = {
      label: val,
      value: val,
    };
    if (!langStore.isChineseLang) return [result];
    return [item || result];
  });

  /** 实时字幕显示数量限制开关 */
  const subtitleDisplayNumberLimitEnabled = ref(__subtitleConfig.subtitleDisplayNumberLimitEnabled);

  /** 实时字幕最多显示多少条 */
  const subtitleDisplayNumber = ref(__subtitleConfig.subtitleDisplayNumber);

  /** 回放主字幕是否显示 */
  const mainReplaySubtitleShow = ref(true);

  /** 回放副字幕是否显示 */
  const subReplaySubtitleShow = ref(true);

  /** 当前选中的回放字幕Id */
  const curSelectedReplaySubtitleItemId = ref('');

  /** 回放字幕数据 */
  const replaySubtitleList = computed(() => {
    if (!playbackStore.currentPlaybackTarget) return [];
    return playbackStore.currentPlaybackTarget.subtitleList;
  });

  /** 回放字幕是否展示 */
  const replaySubtitleVisible = computed<boolean>(() => {
    // 当前没有回放对象不展示
    if (!playbackStore.currentPlaybackTarget) return false;
    // 点播回放列表不展示
    if (playbackStore.currentPlaybackTarget.playbackOptions.type === PlaybackType.Vod) return false;
    // 直播中不展示
    if (channelStore.liveStatus === LiveStatus.Live) return false;

    return replaySubtitleList.value.length > 0;
  });

  /** 回放字幕翻译可选项 */
  const replaySubtitleSourceTranslateLanguageOptions = computed<SubtitleTranslateOption[]>(() => {
    return replaySubtitleList.value
      .filter(subtitleInfo => subtitleInfo.isOriginal !== YN.Y)
      .map(subtitleInfo => {
        const val = subtitleInfo.language;
        const item = subtitleSourceTranslateLanguageOptionMap.value[val];
        const defaultLabel = item && langStore.isChineseLang ? item.label : val;
        const result: SubtitleTranslateOption = {
          label: subtitleInfo.name || defaultLabel,
          value: String(subtitleInfo.id),
        };
        return result;
      });
  });

  /** 回放字幕原声语言可选项 */
  const replaySubtitleSourceLanguageOptions = computed<SubtitleTranslateOption[]>(() => {
    const subtitleInfo = replaySubtitleList.value.find(
      subtitleInfo => subtitleInfo.isOriginal === YN.Y,
    );
    if (!subtitleInfo) return [];

    const val = subtitleInfo.language as string;
    const item = subtitleSourceTranslateLanguageOptionMap.value[val];
    const defaultLabel = item && langStore.isChineseLang ? item.label : val;
    const result: SubtitleTranslateOption = {
      label: subtitleInfo.name || defaultLabel,
      value: String(subtitleInfo.id),
    };
    return [result];
  });

  /**
   * 改变回放主字幕（原声字幕）是否显示
   */
  function changeMainReplaySubtitleShow(show: boolean): void {
    mainReplaySubtitleShow.value = show;
  }

  /**
   * 改变回放副字幕(翻译字幕)是否显示
   */
  function changeSubReplaySubtitleShow(show: boolean): void {
    subReplaySubtitleShow.value = show;
  }

  /**
   * 初始化所有翻译选项数据
   */
  async function initSubtitleSourceTranslateLanguageOptionMap() {
    const watchCore = watchAppStore.getWatchCore();
    const options = await watchCore.subtitle.getSubtitleTranslateOptions();
    subtitleSourceTranslateLanguageOptionMap.value = options.reduce((accu, cur) => {
      if (!accu[cur.value]) {
        accu[cur.value] = cur;
      }
      return accu;
    }, {} as { [key: string]: SubtitleTranslateOption | undefined });
  }

  /**
   * 同步实时字幕配置
   * */
  function syncSubtitleConfig() {
    const watchCore = watchAppStore.getWatchCore();
    const subTitleConfig = watchCore.subtitle.getSubtitleConfig();

    subtitleRealTimeEnabled.value = subTitleConfig.subtitleRealTimeEnabled;
    subtitleTranslateEnabled.value = subTitleConfig.subtitleTranslateEnabled;

    liveSubtitleSourceLanguage.value = subTitleConfig.subtitleSourceLanguage;
    liveSubtitleSourceTranslateLanguage.value = subTitleConfig.subtitleTranslateLanguage;
    liveSubtitleSourceTranslateLanguages.value = subTitleConfig.subtitleTranslateLanguages;
    subtitleDisplayNumberLimitEnabled.value = subTitleConfig.subtitleDisplayNumberLimitEnabled;
    subtitleDisplayNumber.value = subTitleConfig.subtitleDisplayNumber;
  }

  /** 更改实时字幕翻译语言 */
  function changeLiveSubtitleSourceTranslateLanguage(lang: SubtitleSourceTranslateLanguage) {
    const watchCore = watchAppStore.getWatchCore();
    watchCore.subtitle.updateLiveSubtitleTranslateLanguage(lang);
    syncSubtitleConfig();
    // 保存到本地存储
    setSubtitleSettings({ translateLanguage: lang });
  }

  /**
   * 改变字幕显示模式
   */
  function changeSubtitleDisplayMode(mode: 'all' | 'source' | 'translate'): void {
    subtitleDisplayMode.value = mode;
    // 保存到本地存储
    setSubtitleSettings({ displayMode: mode });
  }

  /**
   * 初始化存储的字幕设置
   */
  function initSubtitleSettingsFromStorage(): void {
    const settings = getSubtitleSettings();
    localUerSubtitlesEnable.value = settings.subtitleEnabled;
    subtitleDisplayMode.value = settings.displayMode;

    // 验证存储的翻译语言是否在当前可用选项中, 原声字幕不验证
    if (settings.translateLanguage && subtitleDisplayMode.value !== 'source') {
      const isLanguageAvailable = liveSubtitleSourceTranslateLanguages.value.includes(
        settings.translateLanguage,
      );

      if (isLanguageAvailable) {
        // 监听聊天室连接状态，连接成功后再设置翻译语言
        const { watchPageChatConnected } = storeDefinitionToRefs(useWatchAppStore);

        if (watchPageChatConnected.value) {
          // 聊天室已连接，直接设置翻译语言
          applyStoredTranslateLanguage(settings.translateLanguage);
        } else {
          // 监听聊天室连接状态变化
          const stopWatching = watch(watchPageChatConnected, connected => {
            if (connected) {
              // 调试时发现watchPageChatConnected true时， 聊天室才发login事件，避免意外影响，故延迟一点时间后再发切换语言的事件
              setTimeout(() => {
                applyStoredTranslateLanguage(settings.translateLanguage);
              }, 100); // 停止监听
              stopWatching();
            }
          });
        }
      }
    }

    if (settings.translateLanguage && subtitleDisplayMode.value === 'source') {
      liveSubtitleSourceTranslateLanguage.value = settings.translateLanguage;
    }
  }

  /**
   * 应用存储的翻译语言设置
   */
  function applyStoredTranslateLanguage(translateLanguage: SubtitleSourceTranslateLanguage): void {
    liveSubtitleSourceTranslateLanguage.value = translateLanguage;
    changeLiveSubtitleSourceTranslateLanguage(translateLanguage);
  }

  return {
    subtitleRealTimeEnabled,
    subtitleTranslateEnabled,
    subtitlesTeacherEnable,
    localUerSubtitlesEnable,
    subtitleDisplayMode,
    changeSubtitlesTeacherEnable,
    changeLocalUerSubtitlesEnable,
    changeSubtitleDisplayMode,
    initSubtitleSettingsFromStorage,

    liveSubtitlesEnable,
    liveSubtitlesShow,
    liveSubtitleSourceLanguage,
    liveSubtitleSourceTranslateLanguage,
    liveSubtitleSourceTranslateLanguages,
    liveSubtitleSourceTranslateLanguageOptions,
    liveSubtitleSourceLanguageOptions,
    subtitleDisplayNumberLimitEnabled,
    subtitleDisplayNumber,

    mainReplaySubtitleShow,
    subReplaySubtitleShow,
    curSelectedReplaySubtitleItemId,
    replaySubtitleList,
    replaySubtitleVisible,
    replaySubtitleSourceTranslateLanguageOptions,
    replaySubtitleSourceLanguageOptions,
    changeMainReplaySubtitleShow,
    changeSubReplaySubtitleShow,

    syncSubtitleConfig,
    initSubtitleSourceTranslateLanguageOptionMap,
    changeLiveSubtitleSourceTranslateLanguage,
  };
});
