import { ChatUserType } from '@polyv/live-watch-sdk';
import { CSSProperties, computed, unref } from 'vue';
import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';
import { useChatMsgUserInject } from '../_hooks/chat-msg-user-hook';
import { ChatMsgItemCategory } from '../use-chat-msg-item';

export const useMsgUserInfo = () => {
  const {
    msgUser,
    msgUserNick,
    msgUserAvatar,
    msgUserType,
    msgUserActor,
    msgUserQuestionLabels,
    isSelfMsg,
    isSpecialUser,
    hideUserActor,
    hideUserAvatar,
  } = useChatMsgUserInject();

  const chatMsgDataContext = useChatMsgDataInject();

  /**
   * 是否显示提问区标签
   */
  const showUserQuestionLabel = computed(() => {
    if (chatMsgDataContext.category.value !== ChatMsgItemCategory.Ask) {
      return false;
    }

    return msgUserQuestionLabels.value.length > 0;
  });

  /** 昵称的颜色关系 */
  const nickColors: Partial<Record<ChatUserType, string>> = {
    [ChatUserType.Manager]: 'linear-gradient(270deg, #9395FF 0%, #6F68FD 100%)',
    [ChatUserType.Assistant]: 'linear-gradient(270deg, #1CCBAF 0%, #0CBF8F 100%)',
    [ChatUserType.Teacher]: 'linear-gradient(270deg, #57B7FF 0%, #358DFF 100%)',
    [ChatUserType.Guest]: 'linear-gradient(90deg, #FF8D73 -7%, #FFB438 100%)',
  };

  /** 昵称颜色 */
  const nicknameStyle = computed(() => {
    const style: Record<string, unknown> = {};

    const userType = unref(msgUserType);
    if (userType && nickColors[userType]) {
      const color = nickColors[userType];
      style.backgroundImage = color;
      // 注意这里要用内联方式写 backgroundClip，不然字体渐变不生效
      style.backgroundClip = 'text';
      style['-webkit-background-clip'] = 'text';
      style.color = 'transparent';
      style.fontWeight = 'bold';
    }

    return style as CSSProperties;
  });

  return {
    msgUser,
    msgUserNick,
    msgUserAvatar,
    msgUserType,
    msgUserActor,
    msgUserQuestionLabels,
    isSelfMsg,
    isSpecialUser,
    hideUserActor,
    hideUserAvatar,
    showUserQuestionLabel,
    nicknameStyle,
  };
};
