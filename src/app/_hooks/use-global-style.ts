/**
 * @file 全局样式及页面元素处理
 */
import { forceMobile, isIOS, isPcMiniProgram } from '@/assets/utils/browser';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useThemeStore } from '@/store/use-theme-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { $ } from '@polyv/utils/dom';
import { watchEffect } from 'vue';
import { useWebsiteInfo } from '@/hooks/platform/use-browser/use-website-info';
import { useOgMeta } from '@/hooks/platform/use-browser/use-og-meta';

/**
 * @hook 全局样式 hook
 */
export const useGlobalStyle = () => {
  /**
   * 设置全局的 css 样式逻辑
   */
  function setupGlobalStyle(): void {
    // 针对 ios 设备添加文档的 css 标识
    const iosPageClass = 'g-page--ios';
    if (isIOS) {
      $(document.documentElement).addClass(iosPageClass);
      $(document.body).addClass(iosPageClass);
    }

    // 针对在 pc 环境强制使用移动端样式添加 css 标识
    const fakeMobileClass = 'g-page--fake-mobile-in-pc';
    if (isPcMiniProgram || forceMobile) {
      $(document.documentElement).addClass(fakeMobileClass);
    }
  }

  /**
   * 移除骨架屏节点
   */
  function removeSkeleton(): void {
    const skeleton = document.querySelector('#skeleton');
    if (skeleton) {
      skeleton.remove();
    }
  }

  return {
    setupGlobalStyle,
    removeSkeleton,
  };
};

/**
 * 浏览器标签页标题 hook
 */
export const useBrowserTitle = () => {
  const watchAppStore = useWatchAppStore();
  const channelInfoStore = useChannelInfoStore();
  // const { updateOgMeta } = useOgMeta();
  const { setTitle } = useWebsiteInfo();

  /**
   * 设置浏览器标签页标题
   */
  function setBrowserTitle(): void {
    if (isBuildForFeedMainMode()) return;

    const channelTitle = channelInfoStore.channelTitle;
    if (channelTitle && watchAppStore.isPageActive) {
      setTitle(channelTitle);
      // updateOgMeta({ title: channelTitle });
    }
  }

  const setBrowserTitleEffectStop = watchEffect(setBrowserTitle);

  return {
    setBrowserTitle,
    setBrowserTitleEffectStop,
  };
};

/**
 * 浏览器标签页图标 hook
 */
export const useBrowserIcon = () => {
  const watchAppStore = useWatchAppStore();
  const themeStore = useThemeStore();
  const { updateOgMeta } = useOgMeta();
  const { setFavIconElem } = useWebsiteInfo();

  function setBrowserIcon(): void {
    if (isBuildForFeedMainMode()) return;

    if (watchAppStore.isPageActive) {
      setFavIconElem(themeStore.browserFavIcon);
      updateOgMeta({ imgUrl: themeStore.browserFavIcon });
    }
  }

  const setBrowserIconEffectStop = watchEffect(setBrowserIcon);

  return {
    setBrowserIcon,
    setBrowserIconEffectStop,
  };
};
