import { PolyvWatchCore, UserEvents } from '@polyv/live-watch-sdk';
import { useViewerStore } from '@/store/use-viewer-store';

export function bindUserEvents(watchCore: PolyvWatchCore) {
  const viewerStore = useViewerStore();

  watchCore.user.eventEmitter.on(UserEvents.UserInfoChange, viewerStore.syncViewerInfo);
}
