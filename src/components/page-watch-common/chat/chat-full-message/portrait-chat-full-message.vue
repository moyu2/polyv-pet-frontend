<!-- @file 竖屏端聊天室全文弹层 -->
<template>
  <mobile-popup
    class="c-portrait-chat-full-message"
    :visible.sync="visible"
    :title="$lang('base.fullText')"
    fill-body-section
  >
    <div class="c-portrait-chat-full-message__main">
      <div class="c-portrait-chat-full-message__main__content">
        <portrait-user-actor
          v-if="msgUserActor"
          class="c-portrait-chat-full-message__main__actor"
          :actor="msgUserActor"
          :user-type="msgUserType"
        />
        <span class="c-portrait-chat-full-message__main__nick">{{ msgUserNick }}：</span>
        <span
          v-html="fullContent"
          class="c-portrait-chat-full-message__main__text"
        ></span>
      </div>
      <div class="c-portrait-chat-full-message__main__btn">
        <normal-button
          :text="$lang('base.copy')"
          :type="ButtonType.Info"
          :size="ButtonSize.Small"
          block
          @click="copyContent"
        />
      </div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import PortraitUserActor from '@/components/page-watch-common/chat/chat-msg-list/msg-items/_msg-user-actor/msg-user-actor.vue';
import { ButtonType, ButtonSize } from '@/components/common-base/normal-button/types';
import { useChatFullMessage } from './use-chat-full-message';

const { visible, msgUserActor, msgUserType, msgUserNick, fullContent, copyContent } =
  useChatFullMessage();
</script>

<style lang="scss">
.c-portrait-chat-full-message__main {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 40px;
  overflow: hidden;
}

.c-portrait-chat-full-message__main__content {
  position: relative;
  flex: 1;
  padding: 20px 24px 0;
  overflow-y: auto;
  line-height: 24px;

  &::after {
    position: sticky;
    bottom: 0;
    display: block;
    width: 100%;
    height: 40px;
    content: '';
    background: linear-gradient(0deg, #ffffff 0%, rgba(255, 255, 255, 0) 98%);
  }
}

.c-portrait-chat-full-message__main__nick {
  color: #f09343;
}

.c-portrait-chat-full-message__main__btn {
  width: 120px;
  margin: 12px auto 0;
}
</style>
