import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
// import { useEffectSetting } from '@/components/page-watch-common/message-effect/hooks/use-effect-setting';
import {
  MessageEffectData,
  MessageEffectType,
} from '@/components/page-watch-common/message-effect/type';
import { useDonateStore } from '@/store/use-donate-store';
import { ChatMsgRewardType } from '@polyv/live-watch-sdk';
import { computed, unref } from 'vue';
import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';
import { useChatMsgUserBasic } from '../_hooks/chat-msg-user-hook';
import { translate } from '@/assets/lang';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';

export const useRewardMsg = () => {
  const { getEmitter } = useGlobalInject();

  const donateStore = useDonateStore();
  const { translateGoodName } = donateStore;

  // const { effectSetting } = useEffectSetting();

  const { toInterruptUserClick } = useInterruptUserClick();

  const { chatMsg } = useChatMsgDataInject<ChatMsgRewardType>();

  const { msgUserAvatar } = useChatMsgUserBasic(chatMsg);

  const effectData = computed<MessageEffectData>(() => {
    const msg = unref(chatMsg);
    return {
      id: msg.id,
      effectType: MessageEffectType.Donate,
      nicknames: [msg.user.nick],
      nicknameCount: 1,
      targetId: msg.rewardContent,
      targetName: translateGoodName(msg.rewardContent),
      targetImage: msg.gimg,
      // strTemplate: effectSetting.donateInteractionEffectTip,
      strTemplate: `{{nickname}}${translate('donate.goodAction')}{{donateName}}`,
    };
  });

  function onClickMsg() {
    if (!donateStore.showDonateFunction) {
      return;
    }

    const intercepted = toInterruptUserClick({ triggerSource: 'reward-msg', ignoreSetNick: true });
    if (intercepted) {
      return;
    }

    getEmitter().emit(appEvents.donate.OpenDonatePopup);
  }

  return {
    chatMsg,
    msgUserAvatar,
    effectData,
    onClickMsg,
  };
};
