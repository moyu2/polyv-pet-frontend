import { computed } from 'vue';
import { ChatMsgMotivationLikeType } from '@polyv/live-watch-sdk';

import { useMotivationLike } from '@/components/page-watch-common/motivation/motivation-like/use-motivation-like';

import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';
import { translate } from '@/assets/lang';
import { useLangStore } from '@/store/use-lang-store';

export const useMotivationLikeMsg = () => {
  const langStore = useLangStore();

  const { chatMsg } = useChatMsgDataInject<ChatMsgMotivationLikeType>();

  const { isMotivatedForCurrent, getMotivationNick } = useMotivationLike();

  const content = computed(() => {
    const { motivatedNick, motivatorNick } = getMotivationNick(chatMsg.value);

    const realMotivatedNick = isMotivatedForCurrent(chatMsg.value)
      ? translate('base.you')
      : motivatedNick;

    let praiseStyle = 'color:#FF5353;';
    if (!langStore.isChineseLang) {
      praiseStyle += 'margin-left:4px;';
    }

    // xxx收获了xxx的夸奖
    return (
      realMotivatedNick +
      translate('motivation.like.received') +
      motivatorNick +
      translate('motivation.like.msg.of') +
      `<span style="${praiseStyle}">${translate('motivation.like.msg.praise')}</span>`
    );
  });

  return {
    chatMsg,
    content,
  };
};
