/**
 * @file 播放器全屏复位 hook（页面维度）
 * @desc 监听 appEvents.player.ExitPlayerFullscreen，在销毁播放器前统一复位各端全屏状态：
 *       PC 系统全屏 / PC 网页全屏 / 移动横屏页面全屏 / 移动竖屏播放器页面全屏 / 文档页面全屏。
 *       该事件由 DestroyPlayer 处理器同步触发，保证全屏复位先于播放器销毁执行。
 *       无延迟/正常延迟切换走 ResetUpPlayer（重建播放器），不触发本 hook，全屏状态不受影响。
 */
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { useLayoutStore } from '@/store/use-layout-store';
import { exitBrowserFullscreen } from '@/hooks/tools/use-fullscreen';
import { usePcPlayerFullscreen } from '@/components/page-watch-common/player/hooks/use-player-fullscreen';

export const usePlayerFullscreenCleanup = () => {
  const layoutStore = useLayoutStore();
  const { getWatchCore } = useMultiPolyvWatchApp();

  const { togglePlayerFullscreen } = usePcPlayerFullscreen();

  /**
   * 复位播放器所有全屏状态。
   * 覆盖 PC / 移动横屏 / 移动竖屏三端，确保销毁播放器后页面布局正常。
   */
  function resetAllPlayerFullscreen(): void {
    // 1. PC 网页全屏：复位状态并恢复 html 滚动锁定
    if (layoutStore.isPcPageFullscreen) {
      togglePlayerFullscreen();
    }

    // 2. 移动端布局全屏（移动横屏页面全屏 / 竖屏播放器页面全屏 / 文档页面全屏）
    layoutStore.exitMobileLayoutFullScreen();

    // 3. SDK 播放器实例全屏
    const watchCore = getWatchCore();
    if (watchCore.player.getFullscreenStatus()) {
      watchCore.player.exitFullscreen();
    }

    // 4. 浏览器系统全屏（PC / 移动端浏览器全屏，复用厂商前缀检测）
    exitBrowserFullscreen();
  }

  useEventBusListener(appEvents.player.ExitPlayerFullscreen, () => {
    resetAllPlayerFullscreen();
  });
};
