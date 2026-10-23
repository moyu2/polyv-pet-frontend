<!-- @file PC 端聊天室全文弹层 -->
<template>
  <pc-dialog
    class="c-pc-chat-full-message"
    :visible.sync="visible"
    :title="$lang('base.fullText')"
    draggable
    :mask="false"
  >
    <div class="c-pc-chat-full-message__main">
      <div class="c-pc-chat-full-message__main__info">
        <div
          class="c-pc-chat-full-message__main__avatar g-img-cover"
          :style="{
            backgroundImage: `url(${msgUserAvatar})`,
          }"
        ></div>

        <div class="c-pc-chat-full-message__main__nick">{{ msgUserNick }}</div>
        <div
          v-if="msgUserActor"
          class="c-pc-chat-full-message__main__actor"
        >
          <span>{{ msgUserActor }}</span>
        </div>
      </div>
      <div
        class="c-pc-chat-full-message__main__content"
        v-html="fullContent"
      ></div>
      <div class="c-pc-chat-full-message__main__btn">
        <normal-button
          :text="$lang('base.copy')"
          :type="ButtonType.Info"
          :size="ButtonSize.Small"
          block
          @click="copyContent"
        />
      </div>
    </div>
  </pc-dialog>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonType, ButtonSize } from '@/components/common-base/normal-button/types';
import { useChatFullMessage } from './use-chat-full-message';

const { visible, msgUserActor, msgUserAvatar, msgUserNick, fullContent, copyContent } =
  useChatFullMessage();
</script>

<style lang="scss">
.c-pc-chat-full-message__main {
  padding: 24px;
}

.c-pc-chat-full-message__main__info {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.c-pc-chat-full-message__main__avatar {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  margin-right: 8px;
}
.c-pc-chat-full-message__main__nick {
  margin-right: 5px;
  font-size: 14px;
  color: #5394f6;
}
.c-pc-chat-full-message__main__actor {
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
.c-pc-chat-full-message__main__content {
  max-height: 242px;
  overflow-y: auto;
  line-height: 24px;
  @include scrollbar(#c8c8c8);
}

.c-pc-chat-full-message__main__btn {
  width: 96px;
  margin: 28px auto 0;
}
</style>
