<!-- @file 竖屏端聊天室输入框 -->
<template>
  <div
    v-show="inputVisible"
    ref="inputWrapRef"
    :key="portraitMessageTabCurrentName + '__input'"
    class="c-portrait-chat-input-controller"
  >
    <!-- 消息引用 -->
    <portrait-chat-msg-quote />

    <portrait-msg-input-wrap
      ref="msgInputWrapRef"
      :input-style="inputStyle"
      :placeholder="portraitMessageInputPlaceholder"
      :disabled-input="portraitChatInputDisabled"
      :disabled-emotion-picker="portraitChatInputDisabled"
      :face-emotion-enabled="chatSetting.faceEmotionEnabled"
      :image-emotion-enabled="imageEmotionEnabled"
      @system-msg="onSendSystemMsg"
      @submit="onSubmit"
      @click-image-emotion="closeInput"
    >
      <!-- 提问图标 -->
      <portrait-ask-icon
        v-if="!chatInputDisabled && !isChatUIV2"
        slot="input-prefix"
        class="c-portrait-chat-input-controller__question-icon"
      />
    </portrait-msg-input-wrap>
  </div>
</template>

<script setup lang="ts">
import PortraitChatMsgQuote from '@/components/page-watch-common/chat/chat-msg-quote/mobile-chat-msg-quote.vue';
import PortraitAskIcon from '@/components/page-watch-common/ask/portrait-ask/portrait-ask-icon.vue';
import PortraitMsgInputWrap from '@/components/page-watch-common/msg-input-wrap/portrait-msg-input-wrap/portrait-msg-input-wrap.vue';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useAppendTo } from '@/hooks/behaviors/use-append-to';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { CSSProperties, computed, nextTick, ref } from 'vue';
import { useChatInputController } from '../hooks/use-chat-input-controller';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useClickOutside } from '@/hooks/behaviors/use-click-outside';
import { PlvInputContent, PlvInputContentText } from '@/plugins/polyv-ui/types';
import { PortraitChatTabName, usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { useFeedBehavior } from '@/hooks/behaviors/use-webview-feed';
import { useThemeStore } from '@/store/use-theme-store';
import { generateBgStyle } from '@/themes/utils/theme-config';
import { storeToRefs } from 'pinia';

const inputWrapRef = ref<HTMLDivElement>();

const portraitLayoutStore = usePortraitLayoutStore();

const { portraitMessageInputPlaceholder, portraitMessageTabCurrentName } =
  storeToRefs(portraitLayoutStore);

const { toLockFeedDrag, toUnlockFeedDrag } = useFeedBehavior();

const { isChatUIV2 } = storeDefinitionToRefs(useChatStore);

const { getWatchCore } = useGlobalInject();

const { onSubmitMessage, onSendSystemMsg, msgInputWrapRef, focusMsgInput } = useChatInputController(
  {
    submitIntercept: (contentList: PlvInputContent[]) => {
      // 竖屏提问
      if (portraitLayoutStore.portraitMessageTabCurrentName === PortraitChatTabName.Ask) {
        const data = contentList[0] as PlvInputContentText;
        const watchCore = getWatchCore();
        watchCore.ask.sendAskSpeak({
          content: data.content,
        });
        return true;
      }

      return false;
    },
  },
);

useAppendTo(inputWrapRef);

const {
  visible: inputVisible,
  close: closeInput,
  setVisible: setInputVisible,
} = useSimpleVisible(false, {
  changeCallback: _visible => {
    portraitLayoutStore.$patch({
      portraitMessageInputVisible: _visible,
    });

    if (_visible) {
      toLockFeedDrag('portrait-message-input');
    } else {
      toUnlockFeedDrag();
    }
  },
});

useEventBusListener(appEvents.chat.FocusToChatInput, async () => {
  setInputVisible(true);
  await nextTick();

  focusMsgInput();
});

useEventBusListener(appEvents.chat.FocusToPortraitAskInput, async () => {
  setInputVisible(true);
  await nextTick();

  focusMsgInput();
});

useClickOutside(inputWrapRef, () => {
  setInputVisible(false);
});

const { chatInputDisabled, chatSetting } = storeDefinitionToRefs(useChatStore);

const portraitChatInputDisabled = computed(() => {
  if (portraitMessageTabCurrentName.value === PortraitChatTabName.Ask) {
    return false;
  }

  return chatInputDisabled.value;
});

function onSubmit(params: { contentList: PlvInputContent[] }) {
  onSubmitMessage(params);
  setInputVisible(false);
}

const themeStore = useThemeStore();

const inputStyle = computed<CSSProperties>(() => {
  if (!themeStore.watchThemeStyleConfig) return {};

  const msgInput = themeStore.watchThemeStyleConfig.common.chat.msgInput;
  return {
    ...generateBgStyle(msgInput.bgConfig),
    borderColor: msgInput.borderColor,
  };
});

const imageEmotionEnabled = computed(() => {
  if (portraitMessageTabCurrentName.value === PortraitChatTabName.Ask) {
    return false;
  }

  return chatSetting.value.imageEmotionEnabled;
});
</script>

<style lang="scss">
.c-portrait-chat-input-controller {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: $--zIndex-top - 2;
  width: 100%;
}

.c-portrait-chat-input-controller__question-icon {
  margin-right: 8.5px;
}
</style>
