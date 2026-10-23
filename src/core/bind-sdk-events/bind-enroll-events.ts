import { useEnrollStore } from '@/store/use-enroll-store';
import { EnrollEvents, PolyvWatchCore } from '@polyv/live-watch-sdk';

export function bindEnrollModuleEvents(watchCore: PolyvWatchCore): void {
  const enrollStore = useEnrollStore();

  watchCore.enroll.eventEmitter.on(EnrollEvents.EnrollStoreInfoChanged, () => {
    enrollStore.syncEnrollInfo();
  });
}
