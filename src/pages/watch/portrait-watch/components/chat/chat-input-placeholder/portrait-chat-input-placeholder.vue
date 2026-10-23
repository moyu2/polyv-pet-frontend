<!-- @file 竖屏端聊天室输入框占位 -->
<template>
  <div
    class="c-portrait-chat-input-placeholder pws-portrait-chat-input-placeholder"
    :class="{
      'c-portrait-chat-input-placeholder--disabled': chatInputDisabled,
      'c-portrait-chat-input-placeholder--round': playbackChapterEntranceVisible,
    }"
    :style="inputStyle"
    @click="onClickPlaceholder"
  >
    <template v-if="!playbackChapterEntranceVisible">
      <mobile-icon-message
        v-if="askMenuData.visible || chatMenuData.visible"
        class="c-portrait-chat-input-placeholder__icon pws-portrait-msg-input-icon"
      />
      <span
        class="c-portrait-chat-input-placeholder__text pws-portrait-chat-input-text--placeholder g-singleline"
      >
        {{ portraitMessageInputPlaceholder }}
      </span>
      <portrait-ask-icon :font-size="18" />
    </template>
    <template v-else>
      <mobile-icon-message
        class="c-portrait-chat-input-placeholder__icon pws-portrait-msg-input-icon"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { MobileIconMessage } from '@/components/component-icons/mobile/map';
import PortraitAskIcon from '@/components/page-watch-common/ask/portrait-ask/portrait-ask-icon.vue';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { useToastManager } from '@/hooks/components/use-toast';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useChatStore } from '@/store/use-chat-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { PortraitChatTabName, usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { useThemeStore } from '@/store/use-theme-store';
import { generateBgStyle } from '@/themes/utils/theme-config';
import { CSSProperties, computed, unref } from 'vue';

const themeStore = useThemeStore();

const { chatInputDisabled, chatRoomLongTimeNotUsed, chatExited } =
  storeDefinitionToRefs(useChatStore);

const { chatMenuData, askMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const { portraitMessageInputPlaceholder, portraitMessageTabCurrentName } =
  storeDefinitionToRefs(usePortraitLayoutStore);

const { playbackListVisible, chapterVisible } = storeDefinitionToRefs(usePlaybackStore);

const playbackChapterEntranceVisible = computed<boolean>(() => {
  return unref(playbackListVisible) || unref(chapterVisible);
});

const { getEmitter } = useGlobalInject();

const { toast } = useToastManager();

const { toInterruptUserClick } = useInterruptUserClick();

function onClickPlaceholder() {
  const result = toInterruptUserClick({
    triggerSource: 'chat-input-placeholder',
    ignoreSetNick: false,
  });
  if (result) {
    return;
  }

  if (unref(chatRoomLongTimeNotUsed) || unref(chatExited)) {
    return;
  }

  // 输入框禁用
  if (
    unref(portraitMessageTabCurrentName) !== PortraitChatTabName.Ask &&
    (unref(chatInputDisabled) || !unref(chatMenuData).visible)
  ) {
    if (unref(chatInputDisabled)) {
      toast.error(translate('chat.roomClosed2'));
    } else {
      toast.error(translate('chat.roomClosed'));
    }
    return;
  }

  getEmitter().emit(appEvents.chat.FocusToChatInput);
}

const inputStyle = computed<CSSProperties>(() => {
  if (!themeStore.watchThemeStyleConfig) return {};

  const msgInput = themeStore.watchThemeStyleConfig.common.chat.msgInput;
  return {
    ...generateBgStyle(msgInput.bgConfig),
    borderColor: msgInput.borderColor,
  };
});
</script>

<style lang="scss">
.c-portrait-chat-input-placeholder {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 360px;
  height: 40px;
  padding: 0 12px;
  line-height: 40px;
  background-color: rgba(#000000, 0.4);
  border: 1px solid transparent;
  border-radius: 20px;

  .c-portrait-ask-icon {
    margin-left: 4px;
  }
}
.c-portrait-chat-input-placeholder__icon {
  display: flex;
  flex-shrink: 0;
  margin-right: 6px;
  font-size: 16px !important;
}

.c-portrait-chat-input-placeholder__text {
  flex: 1;
  width: 0;
  font-size: 14px;
  color: rgba($--color-white, 0.6);
}

.c-portrait-chat-input-placeholder--round {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;

  .c-portrait-chat-input-placeholder__icon {
    margin-right: 0;
    font-size: 22px !important;
  }
}
.c-portrait-chat-input-question__icon {
  display: flex;
  font-size: 18px;
}
</style>
