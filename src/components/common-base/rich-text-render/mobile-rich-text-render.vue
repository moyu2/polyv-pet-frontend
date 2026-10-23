<!-- @file 移动端富文本渲染 -->
<template>
  <div class="c-mobile-rich-text-render">
    <div
      v-html="renderHtmlContent"
      class="c-mobile-rich-text-render__content"
      :class="{
        'c-mobile-rich-text-render__content--color': followPageSkin,
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { richTextRenderProps, useRichTextRender } from './use-rich-text-render';

const props = defineProps(richTextRenderProps());

const { renderHtmlContent } = useRichTextRender({ props });
</script>

<style lang="scss">
.c-mobile-rich-text-render__content {
  padding: 0 16px;
  margin: 20px 0;
  font-size: 16px;
  line-height: 28px;
  color: #adadc0;
  word-break: break-word;
  white-space: pre-wrap;

  &::after {
    display: block;
    clear: both;
    content: '';
  }

  table,
  th,
  td {
    border-style: solid;
    border-width: 1px;
  }

  table {
    border-collapse: collapse;
  }

  th,
  td {
    min-width: 50px;
    padding: 3px 5px;
  }

  p {
    margin: 10px 0;

    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }

  a {
    color: $--color-primary;
  }

  img {
    max-width: 100%;
  }

  ol,
  ul {
    padding-left: 40px;
  }

  ol {
    list-style-type: decimal;
  }

  ul {
    list-style-type: disc;
  }

  h1,
  h2,
  h3,
  h4,
  h5 {
    font-weight: bold;
  }

  h1 {
    font-size: 28px;
    line-height: 42px;
  }

  h2 {
    font-size: 24px;
    line-height: 36px;
  }

  h3 {
    font-size: 20px;
    line-height: 28px;
  }

  h4 {
    font-size: 18px;
    line-height: 26px;
  }

  h5 {
    font-size: 16px;
    line-height: 22px;
  }

  hr {
    border-color: #000000;
  }
}

.c-mobile-rich-text-render__content--color {
  color: $text-color;
}
</style>
