<!-- @file PC 端聊天室底部输入框区域 -->
<template>
  <div class="c-pc-chat-input-controller">
    <pc-msg-input-wrap
      ref="msgInputWrapRef"
      :placeholder="chatInputPlaceholder"
      :disabled-input="chatInputDisabled"
      :disabled-emotion-picker="chatInputDisabled"
      :send-image-enabled="chatSetting.viewerSendImgEnabled"
      :disabled-send-image="chatInputDisabled"
      :image-paste-input-enabled="imagePasteInputEnabled"
      :face-emotion-enabled="chatSetting.faceEmotionEnabled"
      :image-emotion-enabled="chatSetting.imageEmotionEnabled"
      @system-msg="onSendSystemMsg"
      @submit="onSubmitMessage"
      @click-send-image="onClickSendImage"
      @click-input-wrap="onInputWarpClickHandler"
      @click-image-emotion-enter="onInputWarpClickHandler"
    >
      <!-- 面板区插槽 -->
      <template #panel-suffix>
        <!-- 更多面板 -->
        <div
          v-show="moreVisible"
          ref="morePanelRef"
          class="c-pc-chat-input-controller__more-panel-wrap"
        >
          <pc-more-panel @close="hideMorePanel" />
        </div>
      </template>

      <!-- 图标区插槽 -->
      <template #icon-suffix>
        <!-- 公告 -->
        <pc-bulletin-entrance
          class="c-pc-msg-input-wrap__icons__item pws-pc-msg-bottom-input-wrap-item"
        />

        <div style="margin-left: auto"></div>

        <!-- 我的奖励 -->
        <pc-personal-reward-entrance />

        <!-- 打赏 -->
        <pc-donate-entrance />

        <!-- 更多 -->
        <div
          class="c-pc-msg-input-wrap__icons__item c-pc-chat-input-controller__more pws-pc-msg-bottom-input-wrap-item"
          data-more
          @click="onClickMorePanel"
        >
          {{ $lang('base.more') }}
          <span>...</span>
        </div>
      </template>
    </pc-msg-input-wrap>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { appEvents, useEventBusListener } from '@/app/app-events';
import { isIE } from '@/assets/utils/browser';

import PcDonateEntrance from '@/components/page-watch-common/donate/donate-entrance/pc-donate-entrance.vue';
import PcBulletinEntrance from '@/components/page-watch-common/interactive-receive-v2/bulletin-v2/bulletin-entrance/pc-bulletin-entrance.vue';
import PcMsgInputWrap from '@/components/page-watch-common/msg-input-wrap/pc-msg-input-wrap/pc-msg-input-wrap.vue';
import PcPersonalRewardEntrance from '@/components/page-watch-common/personal-reward/pc-personal-reward-entrance.vue';
import { usePanelVisible } from '@/hooks/behaviors/use-panel-visible';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useChatInputController } from '../hooks/use-chat-input-controller';
import PcMorePanel from './input-more-panel.vue';

const { toInterruptUserClick } = useInterruptUserClick();

const {
  msgInputWrapRef,
  focusMsgInput,

  onSendSystemMsg,
  onSubmitMessage,
  onClickSendImage,
} = useChatInputController();

function onInputWarpClickHandler() {
  toInterruptUserClick({ triggerSource: 'chat-input', ignoreSetNick: false });
}

useEventBusListener(appEvents.chat.FocusToChatInput, () => {
  focusMsgInput();
});

const { chatInputPlaceholder, chatInputDisabled, chatSetting } =
  storeDefinitionToRefs(useChatStore);

/** 是否使用图片粘贴输入框 */
const imagePasteInputEnabled = computed(() => {
  if (isIE) return false;
  return chatSetting.value.viewerSendImgEnabled;
});

// 更多面板显示交互
const morePanelRef = ref<HTMLDivElement>();
const {
  visible: moreVisible,
  togglePanel: toggleMorePanel,
  hidePanel: hideMorePanel,
} = usePanelVisible([morePanelRef, '[data-more]']);

function onClickMorePanel() {
  const result = toInterruptUserClick({
    triggerSource: 'chat-input-more',
    ignoreSetNick: true,
  });
  if (result) {
    return;
  }

  toggleMorePanel();
}
</script>

<style lang="scss">
.c-pc-chat-input-controller {
  position: relative;
  z-index: 20;
  padding: 6px;
}

.c-pc-chat-input-controller__more {
  margin-right: -10px;
  user-select: none;

  span {
    display: inline-block;
    transform: rotate(90deg);
  }
}

.c-pc-chat-input-controller__more-panel-wrap {
  position: absolute;
  right: 0;
  bottom: 0;
  background: inherit;
}
</style>
