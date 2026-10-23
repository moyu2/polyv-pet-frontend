/**
 * @file 主题配置更新逻辑 Composable
 * 用于消除 onModeChange、onThemeColorChange、onPrimaryColorChange、onThemeMaskOpacityChange 的重复代码
 */
import { computed, ref } from 'vue';
import { ChannelWatchPageSkin, ChannelWatchThemeStyleType } from '@polyv/live-watch-sdk';
import { useThemeStore } from '@/store/use-theme-store';
import { usePageTheme } from '@/themes/use-page-theme';
import { ThemeColorMode } from '@/themes/type/theme-color-mode';

export interface UseThemeConfigOptions {
  /** 初始主题色 */
  initialThemeColor?: string;
  /** 初始主要色 */
  initialPrimaryColor?: string;
  /** 初始蒙层透明度 */
  initialThemeMaskOpacity?: number;
}

/**
 * 主题配置 Composable
 * 统一处理 Theme 模式和 Skin 模式的配置更新
 */
export function useThemeConfig(options: UseThemeConfigOptions = {}) {
  const themeStore = useThemeStore();
  const { importPageTheme, setupPageTheme } = usePageTheme();

  // 备份初始配置
  const backupWatchTheme = ref(themeStore.watchTheme);
  const backupWatchThemeStyleConfig = ref(themeStore.watchThemeStyleConfig);

  // 本地状态
  const customThemeColor = ref(
    options.initialThemeColor ?? themeStore.currentSkinConfig.themeColor,
  );
  const customPrimaryColor = ref(
    options.initialPrimaryColor ?? themeStore.currentSkinConfig.primaryColor,
  );
  const customThemeMaskOpacity = ref<number>(
    options.initialThemeMaskOpacity ?? Number(themeStore.currentSkinConfig.themeMaskOpacity),
  );

  // Computed states
  const currentStyleType = computed(() => themeStore.styleType);
  const currentMode = computed(() => themeStore.currentSkinConfig.mode);
  const currentPageSkin = computed(() => themeStore.pageSkin as string);

  const isThemeMode = computed(() => currentStyleType.value === ChannelWatchThemeStyleType.Theme);
  const isSkinMode = computed(() => currentStyleType.value === ChannelWatchThemeStyleType.Skin);

  // StyleType 列表
  const styleTypeList = [ChannelWatchThemeStyleType.Skin, ChannelWatchThemeStyleType.Theme];

  /**
   * 切换到 Skin 模式
   */
  function setupCustomSkin() {
    themeStore.$patch({
      pageSkin: 'custom',
      styleType: ChannelWatchThemeStyleType.Skin,
      watchTheme: null,
      watchThemeStyleConfig: null,
    });
    setupPageTheme('custom');

    // 同步本地状态
    customPrimaryColor.value = themeStore.currentSkinPrimaryColor;
    customThemeColor.value = themeStore.currentSkinThemeColor;
    customThemeMaskOpacity.value = Number(themeStore.currentSkinThemeMaskOpacity);
  }

  /**
   * 切换到 Theme 模式
   */
  function setupCustomTheme() {
    const baseConfig =
      backupWatchThemeStyleConfig.value || themeStore.watchThemeStyleConfig || null;
    themeStore.$patch({
      pageSkin: null,
      styleType: ChannelWatchThemeStyleType.Theme,
      watchTheme: backupWatchTheme.value,
      watchThemeStyleConfig: baseConfig ? { ...baseConfig } : null,
    });
    importPageTheme();

    // 同步本地状态
    customPrimaryColor.value = themeStore.currentSkinPrimaryColor;
    customThemeColor.value = themeStore.currentSkinThemeColor;
    customThemeMaskOpacity.value = Number(themeStore.currentSkinThemeMaskOpacity);
  }

  /**
   * 样式类型切换
   */
  function onStyleTypeChange(styleType: ChannelWatchThemeStyleType) {
    if (currentStyleType.value === styleType) {
      return;
    }
    if (styleType === ChannelWatchThemeStyleType.Theme) {
      setupCustomTheme();
    } else {
      setupCustomSkin();
    }
  }

  /**
   * 统一的配置更新方法
   * 消除 Theme/Skin 双分支的重复代码
   */
  function updateConfig<T>(key: string, value: T) {
    if (isThemeMode.value && themeStore.watchThemeStyleConfig) {
      // Theme 模式更新
      themeStore.$patch({
        watchThemeStyleConfig: {
          ...themeStore.watchThemeStyleConfig,
          [key]: value,
        },
      });
      importPageTheme();
    } else {
      // Skin 模式更新
      themeStore.$patch({
        customSkinConfig: {
          ...themeStore.currentSkinConfig,
          [key]: value,
        },
      });
      setupCustomSkin();
    }
  }

  /**
   * Mode 切换
   */
  function onModeChange(mode: ThemeColorMode) {
    updateConfig('mode', mode);
  }

  /**
   * ThemeColor 切换
   */
  function onThemeColorChange(themeColor: string) {
    customThemeColor.value = themeColor;
    updateConfig('themeColor', themeColor);
  }

  /**
   * PrimaryColor 切换
   */
  function onPrimaryColorChange(primaryColor: string) {
    customPrimaryColor.value = primaryColor;
    updateConfig('primaryColor', primaryColor);
  }

  /**
   * ThemeMaskOpacity 切换
   */
  function onThemeMaskOpacityChange(themeMaskOpacity: number) {
    customThemeMaskOpacity.value = themeMaskOpacity;
    updateConfig('themeMaskOpacity', themeMaskOpacity);
  }

  /**
   * ThemeMaskOpacity 步进器 - 减少
   */
  function onThemeMaskOpacityDecrease() {
    const currentValue = customThemeMaskOpacity.value;
    const newValue = Math.max(0, Math.round((currentValue - 0.1) * 10) / 10);
    onThemeMaskOpacityChange(newValue);
  }

  /**
   * ThemeMaskOpacity 步进器 - 增加
   */
  function onThemeMaskOpacityIncrease() {
    const currentValue = customThemeMaskOpacity.value;
    const newValue = Math.min(1, Math.round((currentValue + 0.1) * 10) / 10);
    onThemeMaskOpacityChange(newValue);
  }

  /**
   * 皮肤切换 (仅 Skin 模式)
   */
  function onSkinChange(skin: string) {
    if (currentPageSkin.value === skin) {
      return;
    }
    setupPageTheme(skin as ChannelWatchPageSkin);

    // 同步本地状态
    customPrimaryColor.value = themeStore.currentSkinPrimaryColor;
    customThemeColor.value = themeStore.currentSkinThemeColor;
    customThemeMaskOpacity.value = Number(themeStore.currentSkinThemeMaskOpacity);
  }

  return {
    // State
    currentStyleType,
    currentMode,
    currentPageSkin,
    isThemeMode,
    isSkinMode,
    styleTypeList,

    // Local state
    customThemeColor,
    customPrimaryColor,
    customThemeMaskOpacity,

    // Actions
    onStyleTypeChange,
    onModeChange,
    onThemeColorChange,
    onPrimaryColorChange,
    onThemeMaskOpacityChange,
    onThemeMaskOpacityDecrease,
    onThemeMaskOpacityIncrease,
    onSkinChange,
    updateConfig,
    setupCustomSkin,
    setupCustomTheme,
  };
}
