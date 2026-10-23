import { defineComponent } from 'vue';
import { useChatUIGlobalProvide } from '../hooks/use-chat-ui-global-provide';

/**
 * 聊天室 UI 注入组件
 */
export const ChatUIInject = defineComponent({
  setup(_, { slots }) {
    useChatUIGlobalProvide();

    return () => {
      return slots.default?.();
    };
  },
});
