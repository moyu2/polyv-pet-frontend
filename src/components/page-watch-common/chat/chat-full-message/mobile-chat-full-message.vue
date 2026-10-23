<!-- @file 移动端聊天室全文弹层 -->
<template>
  <mobile-popup
    class="c-mobile-chat-full-message"
    :visible.sync="visible"
    :title="$lang('base.fullText')"
    fill-body-section
  >
    <div class="c-mobile-chat-full-message__main">
      <div class="c-mobile-chat-full-message__main__content">
        <div class="c-mobile-chat-full-message__main__info">
          <div
            class="c-mobile-chat-full-message__main__avatar g-img-cover"
            :style="{
              backgroundImage: `url(${msgUserAvatar})`,
            }"
          ></div>

          <div class="c-mobile-chat-full-message__main__nick">{{ msgUserNick }}</div>
          <div
            v-if="msgUserActor"
            class="c-mobile-chat-full-message__main__actor"
          >
            <span>{{ msgUserActor }}</span>
          </div>
        </div>
        <div
          v-html="fullContent"
          class="c-mobile-chat-full-message__main__text"
        ></div>
      </div>
      <div class="c-mobile-chat-full-message__main__btn">
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
import { ButtonType, ButtonSize } from '@/components/common-base/normal-button/types';
import { useChatFullMessage } from './use-chat-full-message';

const { visible, msgUserActor, msgUserAvatar, msgUserNick, fullContent, copyContent } =
  useChatFullMessage();
</script>

<style lang="scss">
.c-mobile-chat-full-message__main {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 40px;
  overflow: hidden;
}

.c-mobile-chat-full-message__main__content {
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
.c-mobile-chat-full-message__main__info {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.c-mobile-chat-full-message__main__avatar {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  margin-right: 8px;
}
.c-mobile-chat-full-message__main__nick {
  margin-right: 5px;
  font-size: 14px;
  color: #5394f6;
}
.c-mobile-chat-full-message__main__actor {
  height: 16px;
  padding: 0 4px;
  font-size: 12px;
  line-height: 16px;
  color: $--color-white;
  background: #5394f6;
  border-radius: 2px;

  span {
    zoom: 0.83;
  }
}

.c-mobile-chat-full-message__main__btn {
  width: 120px;
  margin: 12px auto 0;
}
</style>
