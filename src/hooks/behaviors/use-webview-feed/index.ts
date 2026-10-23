import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useWebviewStore } from '@/store/use-webview-store';

export const useFeedBehavior = () => {
  const webviewStore = useWebviewStore();
  const watchAppStore = useWatchAppStore();

  function toLockFeedDrag(trackKey: string) {
    webviewStore.toLockDrag(trackKey);
    watchAppStore.toLockDrag(trackKey);
  }

  function toUnlockFeedDrag() {
    webviewStore.toUnlockDrag();
    watchAppStore.toUnlockDrag();
  }

  return {
    toLockFeedDrag,
    toUnlockFeedDrag,
  };
};
