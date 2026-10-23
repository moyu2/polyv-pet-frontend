import { ChannelMenuType } from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { useChannelMenuStore } from './use-channel-menu-store';

export interface AskStore {
  /** 移动端提问弹层是否显示 */
  mobileAskPopupVisible: Ref<boolean>;
  /** 提问欢迎语 */
  askWelcomeText: ComputedRef<string>;
  /** 提问红点是否显示 */
  askReminderVisible: Ref<boolean>;

  /** 是否显示更多消息 */
  moreMsgVisible: Ref<boolean>;
  /** 显示更多消息 */
  showMoreMsg(): void;
  /** 隐藏更多消息 */
  hideMoreMsg(): void;
}

export const useAskStore = defineStore<'ask', AskStore>('ask', () => {
  const channelMenuStore = useChannelMenuStore();

  const mobileAskPopupVisible = ref(false);

  /** 获取欢迎语 */
  const askWelcomeText = computed(() => {
    return channelMenuStore.getMenuData(ChannelMenuType.Quiz)?.content || '';
  });

  /** 提问消息红点提示是否可见 */
  const askReminderVisible = ref(false);

  /** 是否显示更多消息 */
  const moreMsgVisible = ref(false);

  /** 显示更多消息 */
  function showMoreMsg() {
    moreMsgVisible.value = true;
  }

  /** 隐藏更多消息 */
  function hideMoreMsg() {
    moreMsgVisible.value = false;
  }

  return {
    mobileAskPopupVisible,
    askWelcomeText,
    askReminderVisible,
    moreMsgVisible,
    showMoreMsg,
    hideMoreMsg,
  };
});
