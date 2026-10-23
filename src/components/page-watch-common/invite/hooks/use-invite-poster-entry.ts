/** @file 邀请海报入口 hook 钩子 */

import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { getIosVersion } from '@/assets/utils/browser';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';
import { useToastManager } from '@/hooks/components/use-toast';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useInviteStore } from '@/store/use-invite-store';

export const useInvitePosterEntry = () => {
  const channelMenuStore = useChannelMenuStore();
  const { generatePosterUrl } = useInviteStore();
  const interactReceiveStore = useInteractReceiveStore();

  const { toInterruptUserClick } = useInterruptUserClick();

  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();
  const { trackUserClickInvitePoster } = useWatchEventTrack();
  const watchCore = getWatchCore();

  /** 获取云席邀请海报选择页地址 */
  function getGenerateSeatPosterUrl() {
    return watchCore.invite.getInviteGeneratePosterUrl({
      setSeatTable: true,
      seatTableRow: interactReceiveStore.seatPosition?.row,
      seatTableColumn: interactReceiveStore.seatPosition?.column,
    });
  }

  function redirectToPosterPage() {
    trackUserClickInvitePoster();

    const iosVersion = getIosVersion();
    if (iosVersion && iosVersion <= 9) {
      toast.error(translate('base.system.version.deprecated'));
    } else {
      const url = channelMenuStore.seatTableMenuData
        ? getGenerateSeatPosterUrl()
        : generatePosterUrl;
      window.location.href = url;
    }
  }

  function onClickInvitePosterEntry() {
    const result = toInterruptUserClick({ triggerSource: 'invite-poster', ignoreSetNick: true });
    if (result) return;

    redirectToPosterPage();
  }

  return {
    onClickInvitePosterEntry,
  };
};
