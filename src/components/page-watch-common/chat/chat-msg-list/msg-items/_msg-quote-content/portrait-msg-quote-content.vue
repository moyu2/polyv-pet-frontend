<!-- @file 竖屏端消息引用内容 -->
<template>
  <div class="c-portrait-msg-quote-content g-singleline pws-secondary-text-color">
    <!-- 昵称 -->
    <span class="c-portrait-msg-quote-content__nick">{{ quoteNick }}：</span>
    <!-- 内容 -->
    <span class="c-portrait-msg-quote-content__main">
      <!-- 发言 -->
      <template v-if="msgQuote.msgSource === ChatMsgSource.Speak">
        <span v-html="parseQuoteSpeakContent(msgQuote.content)"></span>
      </template>

      <!-- 红包 -->
      <template v-if="msgQuote.msgSource === ChatMsgSource.Redpaper">
        <span>{{ msgQuote.content }}</span>
      </template>

      <!-- 图片 -->
      <template v-if="msgQuote.msgSource === ChatMsgSource.Image">
        <img
          class="c-portrait-msg-quote-content__main__img"
          :src="fitProtocol(msgQuote.imageUrl)"
          @click="clickImgToPreview"
        />
      </template>

      <!-- 自定义消息 -->
      <template v-if="msgQuote.msgSource === ChatMsgSource.CustomerMessage">
        <span>{{ msgQuote.content }}</span>
      </template>
    </span>
  </div>
</template>

<script setup lang="ts">
import { fitProtocol } from '@/assets/utils/url';
import { clickImgToPreview } from '@/hooks/components/use-image-preview';
import { ChatMsgSource } from '@polyv/live-watch-sdk';
import { useQuoteSpeakContentParse } from '../speak-msg/use-speak-msg';
import { msgQuoteContentProps, useMsgQuoteContent } from './use-msg-quote-content';

const { parseQuoteSpeakContent } = useQuoteSpeakContentParse();

const props = defineProps(msgQuoteContentProps());

const { quoteNick } = useMsgQuoteContent({ props });
</script>

<style lang="scss">
.c-portrait-msg-quote-content {
  // border-bottom: 1px solid rgba(#fff, 0.08);
  position: relative;
  padding-bottom: 4px;
  padding-left: 6px;
  margin-bottom: 4px;
  font-size: 12px;
  line-height: 22px;
  @include pseudo-border-bottom;

  &::after {
    position: absolute;
    top: 4px;
    bottom: 8px;
    left: 0;
    width: 2px;
    content: '';
    background-color: rgba(var(--pws-next-primary-rgb), 1);
    border-radius: 2px;
  }
}

.c-portrait-msg-quote-content__nick {
  color: rgba(var(--pws-next-primary-rgb), 1);
}

.c-portrait-msg-quote-content__main {
  .plv-emotion-img {
    width: 24px !important;
    height: 24px !important;
    margin-top: -2px;
  }
}

.c-portrait-msg-quote-content__main__img {
  max-width: 60px;
  max-height: 45px;
  vertical-align: text-top;
}
</style>
