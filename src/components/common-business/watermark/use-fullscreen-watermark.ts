import { useGlobalInject } from '@/app/use-global-inject';
import { ref, computed } from 'vue';
import { useLayoutStore } from '@/store/use-layout-store';

/**
 * 全屏水印相关逻辑
 */

export function useFullscreenWatermark() {
  const { getWatchCore } = useGlobalInject();
  const layoutStore = useLayoutStore();

  /**
   * 获取全屏水印显示状态
   */
  const getFullscreenWatermarkEnabled = () => {
    const watchCore = getWatchCore();
    return watchCore.watermark.enabledFullscreenWatermark();
  };

  const isFullscreenWatermarkVisible = computed(() => {
    if (!getFullscreenWatermarkEnabled()) {
      return false;
    }

    // cdn播放器场景下，移动端全屏时不显示该水印
    if (layoutStore.mobilePlayerIsPageFullscreen) {
      return false;
    }

    if (layoutStore.mobileDocIsPageFullscreen) {
      return false;
    }

    return true;
  });

  /** 移动端全屏状态 全屏时要修改z-index */
  const isMobileFullscreen = computed(() => {
    return layoutStore.mobilePlayerIsPageFullscreen;
  });

  const fullscreenWatermark = ref<HTMLDivElement | null>(null);

  return {
    fullscreenWatermark,

    getFullscreenWatermarkEnabled,
    isFullscreenWatermarkVisible,

    isMobileFullscreen,
  };
}
