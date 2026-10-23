<!-- @file 移动端-横屏提问 -->
<template>
  <div class="c-mobile-ask">
    <!-- 消息列表 -->
    <div class="c-mobile-ask__msg-list">
      <mobile-ask-msg-list
        ref="askMsgListRef"
        :ask-msg-list="askMsgRenderList"
        @near-top="onScrollNearTop"
        @near-bottom="hideMoreMsg"
        @scroll-to-new="scrollToNew"
      />
    </div>

    <!-- 输入框 -->
    <div class="c-mobile-ask__input">
      <mobile-msg-input-wrap
        ref="msgInputWrapRef"
        :face-emotion-enabled="chatSetting.faceEmotionEnabled"
        :image-emotion-enabled="false"
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
    <!-- 报名观看（参与互动时机）  -->
    <mobile-enroll />
  </div>
</template>

<script setup lang="ts">
import MobileAskMsgList from '../ask-msg-list/mobile-ask-msg-list.vue';
import MobileMsgInputWrap from '@/components/page-watch-common/msg-input-wrap/mobile-msg-input-wrap/mobile-msg-input-wrap.vue';
import MobileEnroll from '@/components/common-business/enroll/mobile-enroll.vue';
import { useAsk } from '../hooks/use-ask';
import { useAskSend } from '../hooks/use-ask-send';
import { ref } from 'vue';
import { AskMsgListInstance } from '../ask-msg-list/use-ask-msg-list';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';

const askMsgListRef = ref<AskMsgListInstance>();

const { chatSetting } = storeDefinitionToRefs(useChatStore);

const { toInterruptUserClick } = useInterruptUserClick();

const {
  askMsgRenderList,
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

const { msgInputWrapRef, onSubmitMessage, onClickSendImage, onSendSystemMsg } = useAskSend({
  scrollToNew,
  hideMoreMsg,
});
</script>

<style lang="scss">
.c-mobile-ask {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.c-mobile-ask__msg-list {
  flex: 1;
  overflow: hidden;
}
</style>
