<!-- @file 移动端聊天室底部输入框区域 -->
<template>
  <div class="c-mobile-chat-input-controller">
    <mobile-msg-input-wrap
      ref="msgInputWrapRef"
      :input-style="inputStyle"
      :placeholder="chatInputPlaceholder"
      :disabled-input="chatInputDisabled"
      :disabled-emotion-picker="chatInputDisabled"
      :disabled-send-image="chatInputDisabled"
      :face-emotion-enabled="chatSetting.faceEmotionEnabled"
      :image-emotion-enabled="chatSetting.imageEmotionEnabled"
      :is-alway-active="isAlwayActive"
      render-suffix-slot
      @system-msg="onSendSystemMsg"
      @submit="onSubmitMessage"
      @click-input-wrap="onClickInputWrap"
    >
      <template
        v-if="!isPureness"
        #main-prefix
      >
        <mobile-chat-msg-quote />
      </template>

      <template
        v-if="!isPureness"
        #suffix
      >
        <!-- 更多 -->
        <mobile-more-entrance />

        <!-- 打赏 -->
        <mobile-donate-entrance />

        <!-- 商品库入口 -->
        <mobile-product-pendant
          v-if="
            interactSetting.productEnabled &&
            iarSdkLoaded &&
            !isPlaybackWatchUrl &&
            productEntryLandscapePosition === 'chat'
          "
        />

        <!-- 点赞 -->
        <chat-loader-helper v-if="likeFeatureEnabled">
          <mobile-chat-like />
        </chat-loader-helper>
      </template>
    </mobile-msg-input-wrap>
  </div>
</template>

<script setup lang="ts">
import MobileChatLike from '@/components/page-watch-common/chat-v2/chat-like/index.vue';
import MobileChatMsgQuote from '@/components/page-watch-common/chat/chat-msg-quote/mobile-chat-msg-quote.vue';
import MobileDonateEntrance from '@/components/page-watch-common/donate/donate-entrance/mobile-donate-entrance.vue';
import MobileMoreEntrance from '@/components/page-watch-common/more-popup/mobile-more-entrance/mobile-more-entrance.vue';
import MobileMsgInputWrap from '@/components/page-watch-common/msg-input-wrap/mobile-msg-input-wrap/mobile-msg-input-wrap.vue';
import MobileProductPendant from '@/components/page-watch-common/product/product-pendant/mobile-product-pendant.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { ChatLoaderHelper } from '@/components/page-watch-common/chat-v2/chat-loader-helper';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { useChatStore } from '@/store/use-chat-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { PropUtils } from '@polyv/vue-components';
import { useChatInputController } from '../hooks/use-chat-input-controller';
import { CSSProperties, computed } from 'vue';
import { useThemeStore } from '@/store/use-theme-store';
import { generateBgStyle } from '@/themes/utils/theme-config';
import { useWatchAppStore } from '@/store/use-watch-app-store';

const props = defineProps({
  /** 是否为纯净模式 */
  isPureness: PropUtils.bool.def(false),
  /** 是否处于激活状态 */
  isAlwayActive: PropUtils.bool.def(false),
});

const { isPlaybackWatchUrl } = storeDefinitionToRefs(useWatchAppStore);

const { toInterruptUserClick } = useInterruptUserClick();

const {
  onSubmitMessage,
  onSendSystemMsg,

  msgInputWrapRef,
  focusMsgInput,
  chatInputInstance,
} = useChatInputController({
  autoListen: !props.isPureness,
});

function onClickInputWrap() {
  toInterruptUserClick({ triggerSource: 'chat-input', ignoreSetNick: false });
}

if (!props.isPureness) {
  useEventBusListener(appEvents.chat.FocusToChatInput, () => {
    focusMsgInput();
  });
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

const { chatInputPlaceholder, chatInputDisabled, chatSetting, likeFeatureEnabled } =
  storeDefinitionToRefs(useChatStore);

const { productEntryLandscapePosition } = storeDefinitionToRefs(useChannelStore);

const { interactSetting, iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);

defineExpose(chatInputInstance);
</script>
