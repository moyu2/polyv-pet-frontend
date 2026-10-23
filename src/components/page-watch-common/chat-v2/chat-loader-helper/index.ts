import { useLoadChatUIV2 } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { computed, defineComponent, h } from 'vue';
import { ChatUIInject } from './chat-ui-inject';
import { useChatStore } from '@/store/use-chat-store';

/**
 * 聊天室 UI 加载
 */
export const ChatLoaderHelper = defineComponent({
  setup(_, { slots }) {
    const { isLoaded } = useLoadChatUIV2();

    const { watchPageChatConnected } = storeDefinitionToRefs(useWatchAppStore);

    const { chatSdkV2Setuped } = storeDefinitionToRefs(useChatStore);

    const canRender = computed(() => {
      return chatSdkV2Setuped.value && isLoaded.value && watchPageChatConnected.value;
    });

    return () => {
      if (canRender.value) {
        return h(ChatUIInject, slots.default?.());
      }

      return null;
    };
  },
});
