<!-- @file PC 端提问 -->
<template>
  <div class="c-pc-ask">
    <!-- 消息列表 -->
    <div class="c-pc-ask__msg-list">
      <pc-ask-msg-list
        ref="askMsgListRef"
        :ask-msg-list="askMsgRenderList"
        @near-top="onScrollNearTop"
        @near-bottom="hideMoreMsg"
        @scroll-to-new="scrollToNew"
      />
    </div>

    <!-- 输入框 -->
    <div class="c-pc-ask__input">
      <pc-msg-input-wrap
        ref="msgInputWrapRef"
        :face-emotion-enabled="chatSetting.faceEmotionEnabled"
        :image-emotion-enabled="false"
        :send-image-enabled="questionImageEnabled"
        :image-paste-input-enabled="imagePasteInputEnabled"
        :placeholder="askInputPlaceholder"
        :disabled-input="inputDisabled"
        :disabled-emotion-picker="inputDisabled"
        :disabled-send-image="inputDisabled"
        @submit="onSubmitMessage"
        @system-msg="onSendSystemMsg"
        @click-send-image="onClickSendImage"
        @click-image-emotion-enter="onClickInputWrap"
        @click-input-wrap="onClickInputWrap"
      />
    </div>
    <!-- 报名观看（参与互动时机） -->
    <pc-enroll />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { isIE } from '@/assets/utils/browser';

import PcAskMsgList from '../ask-msg-list/pc-ask-msg-list.vue';
import PcMsgInputWrap from '@/components/page-watch-common/msg-input-wrap/pc-msg-input-wrap/pc-msg-input-wrap.vue';
import PcEnroll from '@/components/common-business/enroll/pc-enroll.vue';
import { useAsk } from '../hooks/use-ask';
import { useAskSend } from '../hooks/use-ask-send';
import { AskMsgListInstance } from '../ask-msg-list/use-ask-msg-list';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';

const askMsgListRef = ref<AskMsgListInstance>();

const { chatSetting } = storeDefinitionToRefs(useChatStore);

const { toInterruptUserClick } = useInterruptUserClick();

const {
  askMsgRenderList,
  questionImageEnabled,
  onScrollNearTop,

  inputDisabled,
  askInputPlaceholder,

  scrollToNew,
  hideMoreMsg,
} = useAsk({
  askMsgListRef,
});
function onClickInputWrap() {
  toInterruptUserClick({ triggerSource: 'ask-input', ignoreSetNick: false });
}

/** 是否使用图片粘贴输入框 */
const imagePasteInputEnabled = computed(() => {
  if (isIE) return false;
  return questionImageEnabled.value;
});

const { msgInputWrapRef, onSubmitMessage, onClickSendImage, onSendSystemMsg } = useAskSend({
  scrollToNew,
  hideMoreMsg,
});
</script>

<style lang="scss">
.c-pc-ask {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.c-pc-ask__input {
  padding: 6px;
}

.c-pc-ask__msg-list {
  flex: 1;
  overflow: hidden;
}
</style>
