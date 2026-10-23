import { useInviteStore } from '@/store/use-invite-store';
import { InviteEvents, PolyvWatchCore } from '@polyv/live-watch-sdk';

export function bindInviteModuleEvents(watchCore: PolyvWatchCore): void {
  const inviteStore = useInviteStore();

  watchCore.invite.eventEmitter.on(InviteEvents.InviteActivityInfoChange, () => {
    inviteStore.syncInviteActivityInfo();
  });
}
