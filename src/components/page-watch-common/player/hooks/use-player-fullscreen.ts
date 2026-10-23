import { storeToRefs } from 'pinia';
import { $ } from '@polyv/utils/dom';

import { useGlobalInject } from '@/app/use-global-inject';
import { useLayoutStore } from '@/store/use-layout-store';

import { PC_PLAYER_FULL_SCREEN_SELECTOR } from '@/assets/constants/selector';
import { FullscreenElement, useFullscreen } from '@/hooks/tools/use-fullscreen';
// import { useQueryParams } from '@/hooks/core/use-query-params';

export const usePcPlayerFullscreen = () => {
  const { getAppRootElement } = useGlobalInject();

  const layoutStore = useLayoutStore();

  // const { paramGetter } = useQueryParams();

  const { isFullscreen } = storeToRefs(layoutStore);

  const { supportFullscreen, toggleFullscreen } = useFullscreen(
    () => {
      return getAppRootElement().querySelector(PC_PLAYER_FULL_SCREEN_SELECTOR) as FullscreenElement;
    },
    {
      // forceDisabled: paramGetter().console() === '1',
      onFullscreenChange: isFullscreen => {
        layoutStore.$patch({ isFullscreen });
      },
    },
  );

  function setHtmlOverflowHidden() {
    const className = 'g-overflow-hidden';

    $(document.documentElement).addClass(className);
  }

  function recoverHtmlOverflow() {
    const className = 'g-overflow-hidden';

    $(document.documentElement).removeClass(className);
  }

  function togglePageFullscreen() {
    const fullDivEl = getAppRootElement().querySelector(PC_PLAYER_FULL_SCREEN_SELECTOR);
    if (!fullDivEl) {
      console.error('找不到对应的全屏元素');
      return;
    }

    const __isFullscreen = !layoutStore.isPcPageFullscreen;

    // 处理网页滚动
    if (__isFullscreen) {
      setHtmlOverflowHidden();
    } else {
      recoverHtmlOverflow();
    }

    // 同步状态
    layoutStore.$patch({
      isPcPageFullscreen: __isFullscreen,
      isFullscreen: __isFullscreen,
    });
  }

  function togglePlayerFullscreen() {
    if (supportFullscreen.value) {
      toggleFullscreen();
    } else {
      console.warn('不支持通用全屏 API，向下兼容用网页全屏');
      togglePageFullscreen();
    }
  }

  return {
    isFullscreen,
    togglePlayerFullscreen,
  };
};
