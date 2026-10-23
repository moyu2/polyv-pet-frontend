import { appEvents, useEventBusListener } from '@/app/app-events';
import { TAB_NAME_ASK, TAB_NAME_CHAT } from '@/assets/constants/tab-name';
import { translate } from '@/assets/lang';
import { isMobile } from '@/assets/utils/browser';
import { useAskReminder } from '@/components/page-watch-common/ask/hooks/use-ask';
import { useChatReminder } from '@/components/page-watch-common/chat/chat-msg-list/hooks/chat-reminder-hook';
import { useChatStore } from '@/store/use-chat-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { computed, watch } from 'vue';

/**
 * @hook Tab/Menu 菜单附加数据 Hook
 */
export const useWatchTabHook = (options: {
  /** 当前活动的 Tab Name */
  curActiveTabName: ResponsiveRef<string>;
}) => {
  const { curActiveTabName } = options;

  const layoutStore = useLayoutStore();
  const chatStore = useChatStore();

  const { chatReminderVisible, updateChatReminderVisible } = useChatReminder({
    onChatMsg: () => {
      if (curActiveTabName.value !== TAB_NAME_CHAT) {
        updateChatReminderVisible(true);
      }
    },
  });

  /** 聊天 Tab 附加文本 */
  const chatSubLabel = computed(() => {
    return chatStore.chatSetting.chatOnlineNumberEnable
      ? `${chatStore.onlineUserCount}${translate('chat.online')}`
      : '';
  });

  /** 提问新消息提醒 */
  const { askReminderVisible, updateAskReminderVisible } = useAskReminder({
    onAskMsg: () => {
      if (curActiveTabName.value !== TAB_NAME_ASK) {
        updateAskReminderVisible(true);
      }
    },
  });

  watch(
    () => curActiveTabName.value,
    () => {
      if (curActiveTabName.value === TAB_NAME_CHAT) {
        updateChatReminderVisible(false);
      }
      if (curActiveTabName.value === TAB_NAME_ASK) {
        updateAskReminderVisible(false);
      }
    },
  );

  useEventBusListener(appEvents.ask.OpenAskFeature, () => {
    if (isMobile) {
      layoutStore.$patch({
        mobileMenuCurrentName: TAB_NAME_ASK,
      });
    } else {
      layoutStore.$patch({
        pcAsideTabCurrentName: TAB_NAME_ASK,
      });
    }
  });

  return {
    chatReminderVisible,
    chatSubLabel,
    askReminderVisible,
  };
};
