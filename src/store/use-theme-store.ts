/**
 * @file 皮肤主题 store
 */
import {
  BackgroundType,
  ChannelThemeSetting,
  ChannelTopGuideSetting,
  ChannelWatchPageSkin,
  ChannelWatchThemeStyleType,
  LiveSquare,
  PlvChannelModule,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { useWatchAppStore } from './use-watch-app-store';
import { useLayoutStore } from './use-layout-store';
import { appendToOssProcess } from '@/hooks/business/use-resize-oss-image';
import { WatchThemeStyleConfig } from '@/themes/utils';
import { ThemeColorMode } from '@/themes/type/theme-color-mode';

export interface SkinConfig {
  /** 颜色深浅 */
  mode: ThemeColorMode;
  /** 主题色 */
  themeColor: string;
  /** 主要色 */
  primaryColor: string;
  /** 主题蒙层透明度 */
  themeMaskOpacity: number;
}

export interface ThemeStore {
  /** 皮肤主题设置 */
  themeSetting: Ref<ChannelThemeSetting>;
  /** 样式类型 */
  styleType: Ref<ChannelWatchThemeStyleType>;
  /** 观看页主题 */
  watchTheme: Ref<string | null>;
  /** 观看页主题配置 */
  watchThemeStyleConfig: Ref<WatchThemeStyleConfig | null>;
  /** 观看页皮肤 */
  pageSkin: Ref<ChannelWatchPageSkin | 'custom' | null>;
  /** 自定义皮肤配置 */
  customSkinConfig: Ref<SkinConfig>;
  /** 当前皮肤的配置 */
  currentSkinConfig: ComputedRef<SkinConfig>;
  /** 当前皮肤的深浅 */
  currentThemeColorMode: ComputedRef<ThemeColorMode>;
  /** 当前皮肤的深浅 (alias for backward compatibility) */
  currentSkinColorMode: ComputedRef<ThemeColorMode>;
  /** 当前皮肤是否为深色 */
  isDarkSkinMode: ComputedRef<boolean>;
  /** 当前皮肤的主题色 */
  currentSkinThemeColor: ComputedRef<string>;
  /** 当前皮肤的主要色 */
  currentSkinPrimaryColor: ComputedRef<string>;
  /** 当前皮肤的主题蒙层透明度 */
  currentSkinThemeMaskOpacity: ComputedRef<string>;
  /** 浏览器标签页图标 */
  browserFavIcon: Ref<string>;
  /** 频道图标 */
  channelCoverImg: Ref<string>;
  /** 频道引导页封面图 */
  splashImg: Ref<string>;
  /** 引导页封面图背景 id */
  splashImgBackgroundId: Ref<number | undefined>;
  /** 是否存在引导页封面 */
  hasSplash: ComputedRef<boolean>;
  /** 移动端引导页大图 */
  mobileSplashLargeImg: Ref<string>;
  /** PC 端观看页背景图 */
  displayPcWatchBackgroundImage: ComputedRef<string>;
  /** (默认)移动端聊天室背景图地址 */
  defaultMobileChatRoomBgUrl: ComputedRef<string | undefined>;
  /** 移动端聊天室背景图地址 */
  mobileChatRoomBgUrl: ComputedRef<string | undefined>;
  /** (默认)竖屏背景图地址 */
  defaultPortraitPageBgUrl: ComputedRef<string | undefined>;
  /** 竖屏背景图地址 */
  portraitPageBgUrl: ComputedRef<string | undefined>;
  /** 播放器背景图地址 */
  playerBgUrl: ComputedRef<string | undefined>;
  /* 直播介绍信息卡片开关 */
  descInfoCardEnabled: Ref<boolean>;
  /** 顶部引导设置 */
  topGuideSetting: Ref<ChannelTopGuideSetting>;
  /** 直播广场设置 */
  liveSquareConfig: Ref<LiveSquare | undefined>;
  /**
   * 兼容竖屏布局
   */
  isCompactPortraitWatchPage: ComputedRef<boolean>;
  /** 同步皮肤主题 store */
  syncThemeStore(): void;
}

/** 皮肤主题 store */
export const useThemeStore = defineStore<'theme', ThemeStore>('theme', () => {
  const watchAppStore = useWatchAppStore();
  const layoutStore = useLayoutStore();
  const __themeSetting = PlvChannelModule.generateDefaultThemeSetting();

  const themeSetting = ref(__themeSetting);

  /**
   * 样式类型
   */
  const styleType = ref(__themeSetting.styleType);

  /**
   * 观看页主题
   */
  const watchTheme = ref<string | null>(__themeSetting.watchTheme);

  /**
   * 观看页主题配置
   */
  const watchThemeStyleConfig = ref<WatchThemeStyleConfig | null>(null);

  /** 观看页皮肤 */
  const pageSkin = ref<ChannelWatchPageSkin | 'custom' | null>(null);

  /** 自定义皮肤配置 */
  const customSkinConfig = ref<SkinConfig>({
    mode: ThemeColorMode.Dark,
    themeColor: '#202127',
    primaryColor: '#3F76FC',
    themeMaskOpacity: 0.4,
  });

  const pageSkinConfigs: Record<ChannelWatchPageSkin, SkinConfig> = {
    [ChannelWatchPageSkin.Black]: {
      mode: ThemeColorMode.Dark,
      themeColor: '#2b2c35',
      primaryColor: '#3F76FC',
      themeMaskOpacity: 0.4,
    },
    [ChannelWatchPageSkin.Blue]: {
      mode: ThemeColorMode.Light,
      themeColor: '#D1E3F9',
      primaryColor: '#3F76FC',
      themeMaskOpacity: 0.5,
    },
    [ChannelWatchPageSkin.Freshblue]: {
      mode: ThemeColorMode.Dark,
      themeColor: '#2275dd',
      primaryColor: '#69C5FF',
      themeMaskOpacity: 0.1,
    },
    [ChannelWatchPageSkin.Golden]: {
      mode: ThemeColorMode.Light,
      themeColor: '#dddddd',
      primaryColor: '#ceae67',
      themeMaskOpacity: 0.6,
    },
    [ChannelWatchPageSkin.Green]: {
      mode: ThemeColorMode.Dark,
      themeColor: '#398775',
      primaryColor: '#3cb599',
      themeMaskOpacity: 0.1,
    },
    [ChannelWatchPageSkin.Red]: {
      mode: ThemeColorMode.Dark,
      themeColor: '#a20a1f',
      primaryColor: '#FF5252',
      themeMaskOpacity: 0.1,
    },
    [ChannelWatchPageSkin.White]: {
      mode: ThemeColorMode.Light,
      themeColor: '#dddddd',
      primaryColor: '#3F76FC',
      themeMaskOpacity: 0.6,
    },
  };

  const portraitWatchPageSkinConfig: SkinConfig = {
    mode: ThemeColorMode.Dark,
    themeColor: '#2b2c35',
    primaryColor: '#3F76FC',
    themeMaskOpacity: 0.4,
  };

  /**
   * 使用旧版皮肤、当进入观看页时，如果是竖屏布局，且观看页已经初始化，且非引导页
   * @desc 产品要求，即使是 UI3.0 也要兼容这种场景
   */
  const isCompactPortraitWatchPage = computed(() => {
    return (
      pageSkin.value !== 'custom' &&
      styleType.value === ChannelWatchThemeStyleType.Skin &&
      watchAppStore.watchAppInited &&
      watchAppStore.watchPageInited &&
      layoutStore.isPortraitWatchLayout
    );
  });

  /**
   * 当前皮肤的配置
   * @desc 根据 styleType 来处理使用 skin 还是 watchTheme
   */
  const currentSkinConfig = computed<SkinConfig>(() => {
    const defaultSkin = themeSetting.value.pageSkin;

    // 当 pageSkin 为 'custom' 时，使用自定义配置
    if (pageSkin.value === 'custom') {
      return customSkinConfig.value;
    }

    let skinConfig = pageSkinConfigs[pageSkin.value || defaultSkin];
    if (isCompactPortraitWatchPage.value) {
      skinConfig = {
        ...portraitWatchPageSkinConfig,
        primaryColor: skinConfig.primaryColor, // 使用对应的高亮色
      };
    }

    // 处理旧版皮肤
    if (styleType.value === ChannelWatchThemeStyleType.Skin || !watchThemeStyleConfig.value) {
      return skinConfig;
    }

    return {
      mode: watchThemeStyleConfig.value.mode,
      themeColor: watchThemeStyleConfig.value.themeColor,
      primaryColor: watchThemeStyleConfig.value.primaryColor,
      themeMaskOpacity: watchThemeStyleConfig.value.themeMaskOpacity || 0,
    };
  });

  /** 当前皮肤的深浅 */
  const currentThemeColorMode = computed<ThemeColorMode>(() => {
    let mode = currentSkinConfig.value.mode;

    if (isCompactPortraitWatchPage.value) {
      mode = ThemeColorMode.Dark;
    }

    return mode;
  });

  const isDarkSkinMode = computed(() => {
    return currentThemeColorMode.value === ThemeColorMode.Dark;
  });

  const currentSkinColorMode = computed(() => currentThemeColorMode.value);

  /** 当前皮肤的主题色 */
  const currentSkinThemeColor = computed<string>(() => {
    return currentSkinConfig.value.themeColor;
  });

  /** 当前皮肤的主要色 */
  const currentSkinPrimaryColor = computed<string>(() => {
    return currentSkinConfig.value.primaryColor;
  });

  const currentSkinThemeMaskOpacity = computed(() => {
    return String(currentSkinConfig.value.themeMaskOpacity);
  });

  /** 浏览器标签页图标 */
  const browserFavIcon = ref(__themeSetting.browserFavIcon);

  /** 频道图标 */
  const channelCoverImg = ref(__themeSetting.channelCoverImg);

  /** 频道引导页封面图 */
  const splashImg = ref(__themeSetting.splashImg);

  /** 引导页封面图背景 id */
  const splashImgBackgroundId = ref(__themeSetting.splashImgBackgroundId);

  const hasSplash = computed(() => {
    return !!(splashImg.value || splashImgBackgroundId.value);
  });

  /** 移动端引导页大图 */
  const mobileSplashLargeImg = ref(__themeSetting.mobileSplashLargeImg);

  /** PC 端观看页背景图 */
  const pcWatchBackgroundImage = ref<string>();

  /** 最终显示的 PC 端观看页背景图 */
  const displayPcWatchBackgroundImage = computed<string>(() => {
    if (pcWatchBackgroundImage.value) {
      return pcWatchBackgroundImage.value;
    }

    if (watchThemeStyleConfig.value && watchThemeStyleConfig.value.pc) {
      return watchThemeStyleConfig.value.pc.bgConfig?.url || '';
    }

    return '';
  });

  const defaultMobileChatRoomBgUrl = computed<string>(() => {
    if (
      themeSetting.value.mobileChatBackgroundType === BackgroundType.SystemDefault &&
      watchThemeStyleConfig.value
    ) {
      return watchThemeStyleConfig.value.mobile.chat.bgConfig?.url || '';
    }

    return '';
  });

  /** 移动端聊天室背景地址 */
  const mobileChatRoomBgUrl = computed<string | undefined>(() => {
    const imageVal = unref(themeSetting).mobileChatBackgroundImage;
    const ambiguityVal = unref(themeSetting).mobileChatBackgroundImageAmbiguity;

    if (!imageVal) {
      return;
    }

    if (!ambiguityVal) {
      return imageVal;
    }

    const blurParams = `image/blur,r_${ambiguityVal},s_${ambiguityVal}`;
    return appendToOssProcess(imageVal, blurParams);
  });

  const defaultPortraitPageBgUrl = computed<string>(() => {
    if (
      themeSetting.value.portraitBackgroundType === BackgroundType.SystemDefault &&
      watchThemeStyleConfig.value
    ) {
      return watchThemeStyleConfig.value.portrait.chat.bgConfig?.url || '';
    }

    return '';
  });

  /** 竖屏背景地址 */
  const portraitPageBgUrl = computed<string | undefined>(() => {
    const imageVal = unref(themeSetting).portraitBackgroundImage;
    const ambiguityVal = unref(themeSetting).portraitBackgroundImageAmbiguity;

    if (!imageVal) {
      return;
    }

    if (!ambiguityVal) {
      return imageVal;
    }

    const blurParams = `image/blur,r_${ambiguityVal},s_${ambiguityVal}`;
    return appendToOssProcess(imageVal, blurParams);
  });

  /** 播放器背景图地址 */
  const playerBgUrl = computed<string | undefined>(() => {
    const imageVal = unref(themeSetting).playerBackgroundImage;
    const ambiguityVal = unref(themeSetting).playerBackgroundImageAmbiguity;

    if (!imageVal) {
      return;
    }

    if (!ambiguityVal) {
      return imageVal;
    }

    const blurParams = `image/blur,r_${ambiguityVal},s_${ambiguityVal}`;
    return appendToOssProcess(imageVal, blurParams);
  });

  /* 直播介绍信息卡片开关 */
  const descInfoCardEnabled = ref(__themeSetting.descInfoCardEnabled);

  /** 顶部引导设置 */
  const topGuideSetting = ref(PlvChannelModule.generateDefaultTopGuideSetting());

  /** 直播广场设置 */
  const liveSquareConfig = ref<LiveSquare>();

  function syncThemeStore() {
    const watchCore = watchAppStore.getWatchCore();
    const setting = watchCore.channel.getThemeSetting();
    themeSetting.value = setting;

    pageSkin.value = setting.pageSkin;
    watchTheme.value = setting.watchTheme;
    styleType.value = setting.styleType;

    browserFavIcon.value = setting.browserFavIcon;
    channelCoverImg.value = setting.channelCoverImg;
    splashImg.value = setting.splashImg;
    splashImgBackgroundId.value = setting.splashImgBackgroundId;

    mobileSplashLargeImg.value = setting.mobileSplashLargeImg;

    pcWatchBackgroundImage.value = setting.pcWatchBackgroundImage;
    descInfoCardEnabled.value = setting.descInfoCardEnabled;

    topGuideSetting.value = watchCore.channel.getTopGuideSetting();
    liveSquareConfig.value = watchCore.channel.getLiveSquareConfig();
  }

  return {
    themeSetting,

    styleType,
    watchTheme,
    watchThemeStyleConfig,

    pageSkin,
    customSkinConfig,
    currentSkinConfig,
    currentThemeColorMode,
    isDarkSkinMode,
    currentSkinColorMode,
    currentSkinThemeColor,
    currentSkinPrimaryColor,
    currentSkinThemeMaskOpacity,
    browserFavIcon,
    channelCoverImg,
    splashImg,
    splashImgBackgroundId,
    hasSplash,
    mobileSplashLargeImg,
    displayPcWatchBackgroundImage,
    defaultMobileChatRoomBgUrl,
    mobileChatRoomBgUrl,
    defaultPortraitPageBgUrl,
    portraitPageBgUrl,
    playerBgUrl,

    descInfoCardEnabled,

    topGuideSetting,
    liveSquareConfig,

    isCompactPortraitWatchPage,
    syncThemeStore,
  };
});
