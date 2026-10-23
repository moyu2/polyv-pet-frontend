import { PolyvWatchCore, PolyvWatchCoreEvents } from '@polyv/live-watch-sdk';

import { useSyncStoreForWatchCore } from '@/hooks/core/use-sync-store';

export function bindWatchCoreEvents(watchCore: PolyvWatchCore): void {
  const { syncStoreAfterWatchCoreSetuped } = useSyncStoreForWatchCore();

  // 观看核心已安装
  watchCore.eventEmitter.on(PolyvWatchCoreEvents.WatchCoreSetuped, () => {
    syncStoreAfterWatchCoreSetuped();
  });

  // 观看核心已连接聊天室
  watchCore.eventEmitter.on(PolyvWatchCoreEvents.WatchCoreConnected, () => {
    console.log('观看核心已连接聊天室');
  });

  // 观看核心已销毁
  watchCore.eventEmitter.on(PolyvWatchCoreEvents.WatchCoreDestroyed, () => {
    console.log('观看核心已销毁');
  });
}
