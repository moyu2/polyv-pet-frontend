import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { ConnectMicEvents, PolyvWatchCore } from '@polyv/live-watch-sdk';

export function bindConnectMicModuleEvents(watchCore: PolyvWatchCore): void {
  const connectMicStore = useConnectMicStore();

  watchCore.connectMic.eventEmitter.on(ConnectMicEvents.ConnectMicInfoChange, () => {
    connectMicStore.syncConnectMicInfo();
  });

  watchCore.connectMic.eventEmitter.on(ConnectMicEvents.ScreenShareInfoChange, () => {
    connectMicStore.syncScreenShareInfo();
  });

  watchCore.connectMic.eventEmitter.on(ConnectMicEvents.NetworkInfoChange, () => {
    connectMicStore.syncNetworkInfo();
  });

  watchCore.connectMic.eventEmitter.on(ConnectMicEvents.ConnectMicListChange, () => {
    connectMicStore.syncConnectMicList();
  });
}
