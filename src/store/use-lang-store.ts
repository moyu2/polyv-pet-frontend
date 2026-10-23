import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { defineStore } from 'pinia';

import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';

import { LangType } from '@/assets/lang/lang-enum';
import { switchI18nLocale, isTargetLocaleLoaded } from '@/assets/lang';
import {
  convert2CurrentLang,
  convert2WatchSdkLang,
  getBrowserLang,
  getQueryLang,
  getCacheLang,
  getDefaultLang,
  setCacheLang,
} from '@/assets/lang/util';

import { useWatchAppStore } from './use-watch-app-store';
import { useChannelStore } from './use-channel-store';
import { usePlayerStore } from './use-player-store';

/** 多语言选择节点类型 */
export interface LangSwitchItem {
  lang: LangType;
  /** 文本 */
  text: string;
}

export interface LangStoreState {
  /** 英语设置开关 */
  englishSettingEnabled: Ref<boolean>;
  /** 多语言开关 */
  langSwitchEnabled: Ref<boolean>;
  /** 所有多语言选择列表 */
  allLangSwitchList: ComputedRef<LangSwitchItem[]>;
  /** 多语言选择列表 */
  langSwitchList: ComputedRef<LangSwitchItem[]>;
  /** 是否显示日文语言切换（仅将英文的 text 换成日文文案） */
  japLangEnabled: Ref<boolean>;
  /** 当前多语言 */
  currentLang: Ref<LangType>;
  /** 当前多语言文本 */
  currentLangText: ComputedRef<string>;
  /** 当前是否为中文语言 */
  isChineseLang: ComputedRef<boolean>;
  /** 语言切换是否正在加载中 */
  langLoading: Ref<boolean>;
  /** 正在切换的目标语种 */
  pendingLang: Ref<LangType | undefined>;
}

export interface LangStoreAction {
  /** 同步多语言 store */
  syncLangStore: () => void;
  /** 检查缓存的语种是否与当前语种一致，不一致则切换 */
  checkLangCache: () => Promise<void>;
  /** 切换当前多语言 */
  switchLang: (lang: LangType) => Promise<boolean>;
  /** 根据当前语言转换游客名称 */
  translateNick: (nick: string) => string;
}

/** 多语言 store */
export interface LangStore extends LangStoreState, LangStoreAction {}

export const useLangStore = defineStore<'lang', LangStore>('lang', () => {
  const { getEmitter } = useGlobalInject();

  const watchAppStore = useWatchAppStore();

  const channelStore = useChannelStore();
  const playerStore = usePlayerStore();

  /** 英语设置开关 */
  const englishSettingEnabled = ref(false);

  /** 是否开启 AI 多语言翻译 */
  const aiTranslationEnabled = ref(false);

  /** 多语言开关 */
  const langSwitchEnabled = ref(false);

  /** 是否显示日文语言切换（仅将英文的 text 换成日文文案） */
  const japLangEnabled = ref(false);

  /** 语言切换是否正在加载中 */
  const langLoading = ref(false);

  /** 正在切换的目标语种 */
  const pendingLang = ref<LangType | undefined>(undefined);

  /** syncLangStore 发起的语种应用任务，供挂载后的缓存检查等待语种应用完成 */
  let syncLangTask: Promise<boolean> | undefined;

  /** 所有多语言选择列表 */
  const allLangSwitchList = computed<LangSwitchItem[]>(() => {
    return [
      { text: '简体中文', lang: LangType.ZH_CN },
      { text: '繁體中文', lang: LangType.ZH_TW },
      { text: 'English', lang: LangType.English },
      { text: '日本語', lang: LangType.Japanese },
      { text: '한국어', lang: LangType.Korean },
      { text: 'Русский', lang: LangType.Russian },
    ];
  });

  /** 多语言选择列表 */
  const langSwitchList = computed<LangSwitchItem[]>(() => {
    return unref(allLangSwitchList).slice();
  });

  /** 当前多语言（表示已生效到 i18n 的语种） */
  const currentLang = ref<LangType>(getDefaultLang());

  /** 当前多语言的文本 */
  const currentLangText = computed<string>(() => {
    const list = unref(allLangSwitchList);
    const index = list.findIndex(item => item.lang === unref(currentLang));
    return index === -1 ? '' : list[index].text;
  });

  /** 当前是否为中文语言 */
  const isChineseLang = computed<boolean>(() => {
    const lang = unref(currentLang);
    return lang === LangType.ZH_CN || lang === LangType.ZH_TW;
  });

  /** 同步多语言 store */
  function syncLangStore() {
    const watchCore = watchAppStore.getWatchCore();
    const langSetting = watchCore.channel.getLangSetting();

    englishSettingEnabled.value = langSetting.englishSettingEnabled;
    aiTranslationEnabled.value = langSetting.aiTranslationEnabled;
    langSwitchEnabled.value = langSetting.langSwitchEnabled;
    japLangEnabled.value = langSetting.japLangEnabled;

    // 允许切换时 URL/缓存优先；不允许切换时 getDefaultLang 会优先取后台限制配置的默认语种。
    // 两种情况都需 syncCurrentLang 加载并应用语言包（默认 zh_CN 之外的语言包不会自动加载）
    const defaultLangType = langSetting.isFollowBrowserLang
      ? getBrowserLang()
      : convert2CurrentLang(langSetting.defaultLangType);
    const limitLang = langSetting.langSwitchEnabled ? undefined : defaultLangType;

    const lang = getQueryLang() || limitLang || getCacheLang() || defaultLangType;

    syncLangTask = syncCurrentLang(lang);
    syncLangTask.catch(err => {
      console.error('[i18n] syncLangStore failed:', err);
    });
  }

  /**
   * 同步当前语种（异步：先确保语种包已加载，再更新 sdk 与 store 状态）
   */
  async function syncCurrentLang(lang: LangType, withLoading = false): Promise<boolean> {
    const watchCore = watchAppStore.getWatchCore();
    const targetSdkLang = convert2WatchSdkLang(lang);
    const currentSdkLang = watchCore.getAppConfig().language;

    if (
      isTargetLocaleLoaded(lang) &&
      unref(currentLang) === lang &&
      currentSdkLang === targetSdkLang
    ) {
      return true;
    }

    if (withLoading) {
      langLoading.value = true;
      pendingLang.value = lang;
    }

    try {
      const applied = await switchI18nLocale(lang);
      if (!applied) {
        return false;
      }

      currentLang.value = lang;

      // 更新 sdk 语种
      watchCore.updateAppConfig({
        language: targetSdkLang,
      });

      // 兼容旧逻辑，更改语言时支持同时更改音轨
      const steamTrackItem = channelStore.streamTrackConfig?.trackList.find(i => {
        return i.lang === targetSdkLang;
      });
      if (steamTrackItem) {
        playerStore.$patch({
          streamTrackKey: steamTrackItem.key,
        });
      }

      return true;
    } catch (err) {
      console.error('[i18n] Failed to switch locale:', err);
      return false;
    } finally {
      if (withLoading) {
        langLoading.value = false;
        pendingLang.value = undefined;
      }
    }
  }

  /**
   * 检查缓存的语种是否与当前语种一致，不一致则切换
   *
   * 初始 setup（请求频道详情/观众信息）不一定使用最终语种（如无缓存时按浏览器语言请求，
   * 而最终语种是后台默认配置），此处通过 switchLang 补齐切换后处理：
   * 按最终语种重新请求 AI 翻译的频道数据并对齐缓存，
   * 后续进入时初始语种即为最终语种，无需再触发本逻辑。
   */
  async function checkLangCache() {
    // 等待 syncLangStore 的异步语种应用完成再比较，避免挂载早于语种应用完成时拿到旧值
    if (syncLangTask) {
      await syncLangTask.catch(() => {});
    }

    const lang = getCacheLang();
    if (currentLang.value !== lang) {
      try {
        await switchLang(currentLang.value);
      } catch (error) {
        console.error('[i18n] checkLangCache failed:', error);
      }
    }
  }

  /**
   * 设置当前多语言
   * @param lang 多语言
   */
  async function switchLang(lang: LangType): Promise<boolean> {
    if (unref(langLoading)) return false;

    // 同步当前语种（等待成功后再持久化）
    const success = await syncCurrentLang(lang, true);

    // 只有切换成功后才写缓存
    if (success && unref(currentLang) === lang) {
      setCacheLang(lang);

      /**
       * URL 带有 lang 参数，且参数值与保存的语言不一致时，
       * 要删除参数值，否则下次进来还是参数值指定的语言。
       * 注意：IE <= 9 无效，因为不支持 history.replaceState
       */
      if (history.replaceState) {
        const search = location.search.replace(/([?&]lang=)(\w*)/, (match, $1, $2) => {
          return $2 === lang ? match : $1;
        });
        if (search !== location.search) {
          history.replaceState(null, document.title, location.pathname + search + location.hash);
        }
      }

      // AI 实时翻译开启时，重新走 setup 流程以获取新语言的频道详情配置
      if (aiTranslationEnabled.value) {
        const watchCore = watchAppStore.getWatchCore();
        watchCore.channel.resetChannelDetail();
        await watchCore.setup();
      }

      // 重新初始化播放器来获取新语种
      getEmitter().emit(appEvents.player.ResetUpPlayer);
    }

    return success;
  }

  /** 根据当前语言转换游客名称 */
  function translateNick(nick: string): string {
    let transNick = nick;
    const nickPrefix = '观众';
    const nickPattern = new RegExp(nickPrefix + '/[0-9]+$');
    if (unref(currentLang) !== LangType.ZH_CN && nickPattern.test(nick)) {
      transNick = `Guest/${nick.split('/')[1]}`;
    }
    return transNick;
  }

  return {
    englishSettingEnabled,
    langSwitchEnabled,
    japLangEnabled,
    allLangSwitchList,
    langSwitchList,
    currentLang,
    currentLangText,
    isChineseLang,
    langLoading,
    pendingLang,

    syncLangStore,
    switchLang,
    checkLangCache,
    translateNick,
  };
});
