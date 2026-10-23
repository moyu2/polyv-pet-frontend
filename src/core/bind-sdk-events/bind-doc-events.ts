import { translate } from '@/assets/lang';
import { isMobile } from '@/assets/utils/browser';
import { useToastManager } from '@/hooks/components/use-toast';
import { useDocStore } from '@/store/use-doc-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { DocEvents, MobileWatchLayout, PolyvWatchCore } from '@polyv/live-watch-sdk';

export function bindDocEvents(watchCore: PolyvWatchCore): void {
  const docStore = useDocStore();
  const layoutStore = useLayoutStore();

  const { toast } = useToastManager();

  watchCore.doc.eventEmitter.on(DocEvents.DocInfoChange, () => {
    docStore.syncDocStore();
  });

  watchCore.doc.eventEmitter.on(DocEvents.PaintAuthStatusChange, data => {
    // 竖屏不做双向白板
    if (layoutStore.mobileWatchLayout === MobileWatchLayout.Portrait && isMobile) {
      return;
    }

    const msg = data.hasPaintAuth ? translate('doc.givePaint') : translate('doc.removePaint');
    toast.info(msg);

    if (isMobile) {
      if (data.hasPaintAuth) {
        watchCore.doc.enterPaintMode();
      } else {
        watchCore.doc.exitPaintMode();
      }
    }
  });
}
