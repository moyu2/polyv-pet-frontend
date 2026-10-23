import { translate } from '@/assets/lang';
import { useInviteStore } from '@/store/use-invite-store';
import { InvitePrizeWinnerInfo, InvitePrizeReceiveType } from '@polyv/live-watch-sdk';
import { computed } from 'vue';

/** 默认奖品图片 */
export const defaultPrizeImage = require('../imgs/default-prize-image.png');

export const useInvitePrizeReceive = <
  T extends InvitePrizeWinnerInfo | null = InvitePrizeWinnerInfo,
>() => {
  const inviteStore = useInviteStore();

  /** 邀请有礼中奖着信息 */
  const invitePrizeWinnerInfo = computed(() => {
    return inviteStore.invitePrizeWinnerInfo as T;
  });

  /** 是否自己中奖 */
  const isSelfWin = computed(() => {
    if (!invitePrizeWinnerInfo.value) return false;

    return invitePrizeWinnerInfo.value.isSelf;
  });

  /** 是否已领奖 */
  const hasReceived = computed(() => {
    if (!invitePrizeWinnerInfo.value) return false;

    return invitePrizeWinnerInfo.value.hasReceived;
  });

  const inviteActivityResultTitle = computed(() => {
    return isSelfWin.value
      ? translate('invite.activity.result.title1')
      : translate('invite.activity.result.title2');
  });

  const inviteActivityResultBtnText = computed(() => {
    if (!invitePrizeWinnerInfo.value) return '';

    if (invitePrizeWinnerInfo.value.receiveType === InvitePrizeReceiveType.Form) {
      return hasReceived.value
        ? translate('invite.activity.result.win.btn.text1')
        : translate('invite.activity.result.win.btn.text2');
    }

    return translate('invite.activity.result.win.btn.text3');
  });

  const receivePopupTitle = computed(() => {
    if (!invitePrizeWinnerInfo.value) return '';

    if (invitePrizeWinnerInfo.value.receiveType === InvitePrizeReceiveType.Form) {
      return hasReceived.value
        ? translate('invite.prize.receive.popup.title1')
        : translate('invite.prize.receive.popup.title2');
    }

    if (invitePrizeWinnerInfo.value.receiveType === InvitePrizeReceiveType.QrCode) {
      return translate('invite.prize.receive.popup.title3');
    }

    return '';
  });

  return {
    invitePrizeWinnerInfo,
    isSelfWin,
    hasReceived,

    inviteActivityResultTitle,
    inviteActivityResultBtnText,

    receivePopupTitle,
  };
};
