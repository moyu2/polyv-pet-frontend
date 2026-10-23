import { useScreenOrientHook } from '@/hooks/core/use-screen-orient';
import { useLayoutStore } from '@/store/use-layout-store';
import { usePageStore } from '@/store/use-page-store';
import { onMounted } from 'vue';
import { isMobile, tabletLoadDesktopTemplate } from '@/assets/utils/browser';

/**
 * @hook 监听全局事件的副作用处理
 */
export function useGlobalEventsEffect() {
  const layoutStore = useLayoutStore();
  const pageStore = usePageStore();

  if (isMobile || tabletLoadDesktopTemplate) {
    // 处理屏幕旋转
    useScreenOrientHook({
      autoListenCb: screenOrientationMode => {
        layoutStore.$patch({
          screenOrientationMode,
        });
      },
    });
  }

  onMounted(() => {
    // 处理页面显隐
    document.addEventListener('visibilitychange', () => {
      pageStore.$patch({
        visibilityState: document.visibilityState === 'visible',
      });
    });

    // 禁止 safari 浏览器双击放大缩小效果
    document.addEventListener('gesturestart', (event: Event) => {
      event.preventDefault();
    });
  });
}
