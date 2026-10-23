<template>
  <div class="c-portrait-chat-control">
    <chat-message-input-control
      v-if="chatMenuData.visible"
      show-ask-entry
    />

    <div
      v-else
      class="c-portrait-chat-control__disabled pws-portrait-chat-input-placeholder pws-portrait-chat-input-text--placeholder"
      :style="disabledStyle"
      @click="onClickDisabled"
    >
      <div class="c-portrait-chat-control__disabled__text">
        {{ $lang('chat.roomClosed') }}
      </div>

      <ask-entry-icon v-if="askMenuData.visible" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useThemeStore } from '@/store/use-theme-store';
import { generateBgStyle } from '@/themes/utils';
import { computed, CSSProperties } from 'vue';

const PolyvChatUI = getChatUIV2Pkg();

const { ChatMessageInputControl, AskEntryIcon } = PolyvChatUI;

const themeStore = useThemeStore();
const { chatMenuData, askMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const { toast } = useToastManager();

const disabledStyle = computed<CSSProperties>(() => {
  if (!themeStore.watchThemeStyleConfig) return {};

  const msgInput = themeStore.watchThemeStyleConfig.common.chat.msgInput;
  return {
    ...generateBgStyle(msgInput.bgConfig),
    borderColor: msgInput.borderColor,
  };
});

function onClickDisabled() {
  toast.error(translate('chat.roomClosed'));
}
</script>

<style lang="scss">
.c-portrait-chat-control {
  flex: 1;
  max-width: 150px;
  overflow: hidden;
}

.c-portrait-chat-control__disabled {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 360px;
  height: 40px;
  padding: 0 12px;
  line-height: 40px;
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0);
  border-radius: 20px;
}

.c-portrait-chat-control__disabled__text {
  flex: 1;
  @include singleline-text;
}
</style>
