import { translate } from '@/assets/lang';
import { useViewerStore } from '@/store/use-viewer-store';
import { ChatMsgMotivationLikeType } from '@polyv/live-watch-sdk';
import { strLen } from '@polyv/utils/string';

function formatLen(text: string, len: number) {
  return text.slice(0, len) + '...';
}

export const useMotivationLike = () => {
  const viewerStore = useViewerStore();

  function isMotivatedForCurrent(chatMsg: ChatMsgMotivationLikeType) {
    return chatMsg.motivatedId === viewerStore.viewerId;
  }

  function getMotivationNick(chatMsg: ChatMsgMotivationLikeType) {
    /** 被激励者昵称长度最大限制 */
    const motivatedNickLenLimitMax = 7;
    /** 激励者昵称长度最小限制 */
    const motivatorNickLenLimitMin = 2;
    /** 激励者昵称长度最大限制 */
    const motivatorNickLenLimitMax = 3;

    const __motivatedNick = chatMsg.motivatedNick;
    const __motivatorNick = chatMsg.motivatorNick;

    let motivatedNick = __motivatedNick;
    let motivatorNick = __motivatorNick;
    const motivatedNickLen = strLen(__motivatedNick, { enLen: 0.5, nonEnLen: 1 });
    const motivatorNickLen = strLen(__motivatorNick, { enLen: 0.5, nonEnLen: 1 });

    // 需要优先保证被激励者的昵称
    if (motivatedNickLen > motivatedNickLenLimitMax) {
      motivatedNick = formatLen(__motivatedNick, motivatedNickLenLimitMax);
      if (motivatorNickLen > motivatorNickLenLimitMin) {
        motivatorNick = formatLen(__motivatorNick, motivatorNickLenLimitMin);
      }
    } else if (motivatorNickLen >= motivatorNickLenLimitMax) {
      motivatorNick = formatLen(__motivatorNick, motivatorNickLenLimitMax);
    }

    return {
      motivatorNick,
      motivatedNick,
    };
  }

  function getMotivationContent(chatMsg: ChatMsgMotivationLikeType) {
    const { motivatedNick, motivatorNick } = getMotivationNick(chatMsg);

    const realMotivatedNick = isMotivatedForCurrent(chatMsg)
      ? translate('base.you')
      : motivatedNick;

    // xxx收获了xxx的夸奖
    return (
      realMotivatedNick +
      translate('motivation.like.received') +
      motivatorNick +
      translate('motivation.like.praise')
    );
  }

  return {
    getMotivationNick,
    isMotivatedForCurrent,
    getMotivationContent,
  };
};
