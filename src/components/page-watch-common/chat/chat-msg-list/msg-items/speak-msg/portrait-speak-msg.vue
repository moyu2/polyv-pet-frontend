<!-- @file 竖屏端常规发言 -->
<template>
  <portrait-msg-container
    class="c-portrait-speak-msg"
    :class="{
      'c-portrait-speak-msg--over-style': chatMsg.isOverLength,
    }"
    response-relax
    @click-msg-to-tips="onBubbleChatMsgTips"
    @bubble-contextmenu="onBubbleContextmenu"
  >
    <template #msg-header>
      <!-- 消息引用 -->
      <portrait-msg-quote-content
        v-if="msgQuote"
        :msg-quote="msgQuote"
      />
    </template>

    <!-- 消息内容 -->
    <span
      class="c-portrait-speak-msg__content"
      v-html="speakHtmlContent"
    ></span>

    <template #msg-footer>
      <!-- 翻译后的内容 -->
      <div
        v-if="translatedContent"
        class="c-portrait-speak-msg__bottom c-portrait-speak-msg__bottom--translate pws-secondary-text-color"
      >
        <mobile-icon-translate-two class="c-portrait-speak-msg__bottom__icon" />
        <span>{{ translatedContent }}</span>
      </div>

      <!-- 字数过长下底部按钮 -->
      <div
        v-if="chatMsg.isOverLength"
        class="c-portrait-speak-msg__bottom c-portrait-speak-msg__bottom--overlength pws-secondary-text-color"
      >
        <span
          class="c-portrait-speak-msg__bottom__item"
          @click="copyMsg"
        >
          {{ $lang('base.copy') }}
        </span>
        <span
          class="c-portrait-speak-msg__bottom__item"
          @click="showCompleteMsg"
        >
          {{ $lang('base.more') }}
        </span>
      </div>
    </template>

    <template #suffix>
      <msg-status-suffix></msg-status-suffix>
    </template>
  </portrait-msg-container>
</template>

<script setup lang="ts">
import PortraitMsgContainer from '../_msg-container/portrait-msg-container.vue';
import PortraitMsgQuoteContent from '../_msg-quote-content/portrait-msg-quote-content.vue';
import { useSpeakMsg, useSpeakMsgTranslate } from './use-speak-msg';
import { useChatMsgQuote } from '../_hooks/chat-msg-quote-hook';
import MsgStatusSuffix from '../msg-status-suffix/msg-status-suffix.vue';
import { translate } from '@/assets/lang';
import { useSingleChatMsgTips } from '@/hooks/components/use-single-chat-msg-tips/_hooks/use-single-chat-msg-tips';
import { SingleChatMsgTipsOriginOptions } from '@/hooks/components/use-single-chat-msg-tips/_types';
import { useContextMenu } from '@/hooks/components/use-context-menu';
import { PcIconCopy, PcIconReply, PcIconTranslate } from '@/components/component-icons/pc/map';
import { MobileIconTranslateTwo } from '@/components/component-icons/mobile/map';

const { speakHtmlContent, chatMsg, msgQuote, copyMsg, showCompleteMsg } = useSpeakMsg();

const { canQuoteReply, onClickQuote } = useChatMsgQuote(chatMsg);

const { translatedContent, canTranslate, translateCurrentMsg } = useSpeakMsgTranslate(chatMsg);

const { createChatMsgTips } = useSingleChatMsgTips();

function onBubbleChatMsgTips(options: SingleChatMsgTipsOriginOptions) {
  if (!canQuoteReply.value && !canTranslate.value) {
    return;
  }

  const { target, mountEl, originPosition } = options;

  if (!target || !mountEl) return;

  createChatMsgTips({
    target,
    originPosition,
    mountEl,
    itemData: [
      {
        hidden: !canQuoteReply.value,
        content: translate('chat.reply'),
        onClick: onClickQuote,
      },
      {
        content: translate('base.copy'),
        onClick: copyMsg,
      },
      {
        hidden: !canTranslate.value,
        content: translate('base.translate'),
        onClick: translateCurrentMsg,
      },
    ],
  });
}

const { createContextMenu } = useContextMenu();

function onBubbleContextmenu(evt: MouseEvent) {
  evt.preventDefault();
  createContextMenu(
    {
      x: evt.pageX,
      y: evt.pageY,
      offsetX: 10,
      offsetY: -10,
    },
    [
      {
        hidden: !canQuoteReply.value,
        getIcon: () => PcIconReply,
        content: translate('chat.reply'),
        onClick: onClickQuote,
      },
      {
        getIcon: () => PcIconCopy,
        content: translate('base.copy'),
        onClick: copyMsg,
      },
      {
        hidden: !canTranslate.value,
        getIcon: () => PcIconTranslate,
        content: translate('base.translate'),
        onClick: translateCurrentMsg,
      },
    ],
  );
}
</script>

<style lang="scss">
.c-portrait-speak-msg--over-style {
  .c-portrait-msg-container__content__inner {
    @include multiline-text(4);
  }
}
.c-portrait-speak-msg__content {
  white-space: pre-wrap;

  a {
    color: #78a7ed !important;
  }

  .plv-emotion-img {
    width: 22px !important;
    height: 22px !important;
    margin-top: -1px;
  }
}

.c-portrait-speak-msg__bottom {
  position: relative;
  width: 100%;
  padding-top: 5px;
  margin-top: 6px;
  font-size: 12px;
  line-height: 20px;
  @include pseudo-border-top;
}

.c-portrait-speak-msg__bottom__icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
  margin-right: 4px;
  font-size: 16px;
  vertical-align: middle;
  border-radius: 2px;
  transform: translateY(-2px);
}

.c-portrait-speak-msg__bottom--overlength {
  display: flex;
  align-items: center;
}

.c-portrait-speak-msg__bottom__item {
  position: relative;
  flex: 1;
  text-align: center;
  cursor: pointer;

  &::before {
    position: absolute;
    top: 50%;
    left: 0;
    width: 1px;
    height: 15px;
    content: '';
    background: currentColor;
    opacity: 0.2;
    transform: translateY(-50%);
  }

  &:first-of-type::before {
    display: none;
  }
}
</style>
