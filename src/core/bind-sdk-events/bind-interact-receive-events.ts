import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { InteractReceiveEvents, PolyvWatchCore } from '@polyv/live-watch-sdk';

export function bindInteractReceiveEvents(watchCore: PolyvWatchCore) {
  const interactReceiveStore = useInteractReceiveStore();

  // 互动设置信息更新事件
  watchCore.interactReceive.eventEmitter.on(InteractReceiveEvents.InteractSettingUpdate, () => {
    interactReceiveStore.syncInteractStore();
  });
}
