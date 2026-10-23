import { $ } from '@polyv/utils/dom';
import { ref, watch } from 'vue';
import {
  ChannelWatchPageSkin,
  ChannelWatchThemeStyleType,
  MobileWatchLayout,
} from '@polyv/live-watch-sdk';

import { isMobile } from '@/assets/utils/browser';
import { useThemeStore } from '@/store/use-theme-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { hexToRGB } from '@/assets/utils/color';
import { WatchThemeStyleConfig, getDefaultWatchThemeConfig, generateBgStyle } from '@/themes/utils';
import { ThemeColorMode } from '@/themes/type/theme-color-mode';
import { merge } from 'lodash-es';

async function importThemePolyfill(pageSkin: ChannelWatchPageSkin): Promise<void> {
  switch (pageSkin) {
    case ChannelWatchPageSkin.Red:
      await import(
        /* webpackChunkName: "skin-red-next-polyfill" */ '@/themes/polyfill/red/style.scss'
      );
      break;
    case ChannelWatchPageSkin.Blue:
      await import(
        /* webpackChunkName: "skin-blue-next-polyfill" */ '@/themes/polyfill/blue/style.scss'
      );
      break;
    case ChannelWatchPageSkin.Green:
      await import(
        /* webpackChunkName: "skin-green-next-polyfill" */ '@/themes/polyfill/green/style.scss'
      );
      break;
    case ChannelWatchPageSkin.White:
      await import(
        /* webpackChunkName: "skin-white-next-polyfill" */ '@/themes/polyfill/white/style.scss'
      );
      break;
    case ChannelWatchPageSkin.Golden:
      await import(
        /* webpackChunkName: "skin-golden-next-polyfill" */ '@/themes/polyfill/golden/style.scss'
      );
      break;
    case ChannelWatchPageSkin.Freshblue:
      await import(
        /* webpackChunkName: "skin-freshblue-next-polyfill" */ '@/themes/polyfill/freshblue/style.scss'
      );
      break;
    default: {
      await import(
        /* webpackChunkName: "skin-black-next-polyfill" */ '@/themes/polyfill/black/style.scss'
      );
      break;
    }
  }
}

async function importPageTheme() {
  const themeStore = useThemeStore();
  const layoutStore = useLayoutStore();
  const isDark = themeStore.currentSkinColorMode === ThemeColorMode.Dark;

  if (!isMobile) {
    if (isDark) {
      await import(
        /* webpackChunkName: "theme-next-pc-dark" */ '@/themes/next/entry/dark/_entry-pc.scss'
      );
    } else {
      await import(
        /* webpackChunkName: "theme-next-pc-light" */ '@/themes/next/entry/light/_entry-pc.scss'
      );
    }
  } else {
    if (layoutStore.mobileWatchLayout === MobileWatchLayout.Portrait) {
      if (isDark) {
        await import(
          /* webpackChunkName: "theme-next-portrait-dark" */ '@/themes/next/entry/dark/_entry-portrait.scss'
        );
      } else {
        await import(
          /* webpackChunkName: "theme-next-portrait-light" */ '@/themes/next/entry/light/_entry-portrait.scss'
        );
      }
    } else {
      if (isDark) {
        await import(
          /* webpackChunkName: "theme-next-mobile-dark" */ '@/themes/next/entry/dark/_entry-mobile.scss'
        );
      } else {
        await import(
          /* webpackChunkName: "theme-next-mobile-light" */ '@/themes/next/entry/light/_entry-mobile.scss'
        );
      }
    }
  }

  const pageSkin = themeStore.pageSkin;
  if (pageSkin && pageSkin !== 'custom') {
    await importThemePolyfill(pageSkin);
  }
}

export const usePageTheme = (opts?: { enabledWatcher?: boolean }) => {
  const { enabledWatcher = false } = opts || {};

  const themeStore = useThemeStore();

  const { getAppRootElement, getPolyvWatchApp, getWatchCore } = useMultiPolyvWatchApp();
  const { paramGetter } = useQueryParams({
    getPolyvWatchAppLoader: () => () => getPolyvWatchApp(),
  });

  const skinInited = ref(false);

  async function initPageTheme(): Promise<void> {
    try {
      const querySkin = paramGetter().skin();
      const isPageSkinMode = themeStore.styleType === ChannelWatchThemeStyleType.Skin;

      if (querySkin || isPageSkinMode) {
        setupPageTheme(querySkin);
      } else {
        await setupWatchThemeConfig();
      }

      skinInited.value = true;
    } catch (error) {
      console.error('initPageTheme error', error);
      setupPageTheme(ChannelWatchPageSkin.Black);
    }
  }

  async function setupWatchThemeConfig(): Promise<void> {
    if (themeStore.watchThemeStyleConfig || !themeStore.watchTheme) {
      return;
    }

    const watchCore = getWatchCore();
    let watchThemeStyleConfig =
      await watchCore.channel.getWatchThemeStyleConfig<WatchThemeStyleConfig>(
        themeStore.watchTheme,
      );

    watchThemeStyleConfig = merge(getDefaultWatchThemeConfig(), watchThemeStyleConfig);

    themeStore.$patch({
      watchThemeStyleConfig,
      styleType: ChannelWatchThemeStyleType.Theme,
      pageSkin: null,
    });

    setupThemeVar();
    importPageTheme();
  }

  async function setupPageTheme(skin?: ChannelWatchPageSkin | 'custom'): Promise<void> {
    const pageSkin = skin || themeStore.pageSkin;

    themeStore.$patch({
      pageSkin,
      styleType: ChannelWatchThemeStyleType.Skin,
      watchTheme: null,
      watchThemeStyleConfig: null,
    });

    setupThemeVar();
    setupThemeClass(pageSkin);
    importPageTheme();
  }

  function getThemeClassName(pageSkin?: ChannelWatchPageSkin | string) {
    const __pageSkin = pageSkin || themeStore.pageSkin;
    if (__pageSkin && themeStore.styleType === ChannelWatchThemeStyleType.Skin) {
      return `pws-theme-next-polyfill-${__pageSkin}`;
    }
    return '';
  }

  function setupThemeClass(pageSkin?: string | null) {
    if (!pageSkin) return;

    const $document = $(getAppRootElement());
    const pageThemeClass = getThemeClassName(pageSkin);
    if (pageThemeClass) $document.addClass(pageThemeClass);
  }

  function setupThemeVar() {
    const rootElement = getAppRootElement();
    const config = themeStore.watchThemeStyleConfig;

    const primaryRgbColor = hexToRGB(themeStore.currentSkinPrimaryColor);
    rootElement.style.setProperty('--pws-next-primary-rgb', primaryRgbColor.join(','));

    const themeRgbColor = hexToRGB(themeStore.currentSkinThemeColor);
    rootElement.style.setProperty('--pws-next-theme-rgb', themeRgbColor.join(','));

    const mode = themeStore.currentSkinColorMode;
    const neutralRgb = mode === ThemeColorMode.Dark ? '255,255,255' : '0,0,0';
    rootElement.style.setProperty('--pws-next-neutral-rgb', neutralRgb);

    const maskRgb = mode === ThemeColorMode.Dark ? '0,0,0' : '255,255,255';
    rootElement.style.setProperty('--pws-next-reverse-neutral-rgb', maskRgb);
    rootElement.style.setProperty(
      '--pws-next-theme-mask-bgColor',
      `rgba(${maskRgb},${themeStore.currentSkinThemeMaskOpacity})`,
    );

    if (!config) return;
    const normalBtnBgStyle = generateBgStyle(config.common.normalBtn.bgConfig);
    const normalBtnBg = String(
      normalBtnBgStyle.backgroundColor ||
        normalBtnBgStyle.backgroundImage ||
        normalBtnBgStyle.background ||
        '',
    );
    rootElement.style.setProperty('--pws-next-normal-btn-bg', normalBtnBg);

    const normalBtnBorderColor = config.common.normalBtn.borderColor;
    rootElement.style.setProperty('--pws-next-normal-btn-border-color', normalBtnBorderColor);

    const normalBtnTextColor = config?.common.normalBtn.color;
    rootElement.style.setProperty('--pws-next-normal-btn-text-color', normalBtnTextColor);
  }

  if (enabledWatcher) {
    watch(
      () => themeStore.pageSkin,
      (newPageSkin, oldPageSkin) => {
        if (oldPageSkin) {
          const $document = $(getAppRootElement());
          const oldPageThemeClass = getThemeClassName(oldPageSkin);
          if (oldPageThemeClass && $document.hasClass(oldPageThemeClass)) {
            $document.removeClass(oldPageThemeClass);
          }
        }

        if (oldPageSkin && newPageSkin) {
          setupThemeClass(newPageSkin);
        }
      },
    );

    watch(
      () => themeStore.currentSkinColorMode,
      (currentSkinColorMode, oldPageSkinColorMode) => {
        const changeClassName = (classPrefix: string) => {
          const $document = $(getAppRootElement());

          if (oldPageSkinColorMode) {
            const oldClass = classPrefix + oldPageSkinColorMode;
            if ($document.hasClass(oldClass)) {
              $document.removeClass(oldClass);
            }
          }

          if (currentSkinColorMode) {
            const newClass = classPrefix + currentSkinColorMode;
            $document.addClass(newClass);
          }
        };

        changeClassName('pws-theme-color-mode-');
        changeClassName('pws-theme-next-');
      },
      { immediate: true },
    );

    watch(
      () => themeStore.currentSkinConfig,
      () => {
        if (!skinInited.value) return;
        setupThemeVar();
      },
    );

    // 处理竖屏样式兼容，重新去加载一遍主题样式
    watch(
      () => themeStore.isCompactPortraitWatchPage,
      () => {
        if (themeStore.isCompactPortraitWatchPage) {
          importPageTheme();
        }
      },
      { immediate: true },
    );
  }

  return {
    getThemeClassName,
    initPageTheme,

    // 仅限 debug 使用
    setupPageTheme,
    importPageTheme,
  };
};
