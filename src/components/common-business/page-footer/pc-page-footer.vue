<!-- @file PC 端页脚 -->
<template>
  <div
    v-if="showFooter"
    class="c-pc-page-footer"
  >
    <a
      v-if="pageFootSetting.footerEnabled"
      class="c-pc-page-footer__link"
      :href="pageFootSetting.footerLink"
      target="_blank"
      rel="noopener"
    >
      - {{ pageFootSetting.footerText }} -
    </a>

    <div
      v-if="showCopyrightInfo"
      class="c-pc-page-footer__copyright-info"
    >
      <div
        v-for="(item, index) in copyrightInfoRenderList"
        :key="`${item.html}-${index}`"
        class="c-pc-page-footer__copyright-item"
        v-html="item.html"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalInject } from '@/app/use-global-inject';
import type { ChannelPageFooterSetting } from '@polyv/live-watch-sdk';
import { computed, reactive } from 'vue';

const { getWatchCore } = useGlobalInject();

const watchCore = getWatchCore();
const pageFootSetting = reactive<ChannelPageFooterSetting>(
  watchCore.channel.getPageFooterSetting(),
);

const copyrightInfoRenderList = computed(() => {
  return pageFootSetting.copyrightInfoList
    .map(item => ({
      html: sanitizeCopyrightInfoHtml(item),
    }))
    .filter(item => item.html);
});
const showCopyrightInfo = computed(
  () => pageFootSetting.footerEnabled && copyrightInfoRenderList.value.length > 0,
);
const showFooter = computed(() => pageFootSetting.footerEnabled);

function sanitizeCopyrightInfoHtml(html = '') {
  if (!html || typeof document === 'undefined') {
    return '';
  }
  const template = document.createElement('template');
  template.innerHTML = html;
  const fragment = document.createDocumentFragment();
  sanitizeNodes(template.content, fragment);

  const container = document.createElement('div');
  container.appendChild(fragment);
  return container.innerHTML;
}

function sanitizeNodes(source: Node, target: Node) {
  Array.from(source.childNodes).forEach(node => {
    const sanitizedNode = sanitizeNode(node);
    if (sanitizedNode) {
      target.appendChild(sanitizedNode);
      return;
    }
    sanitizeNodes(node, target);
  });
}

function sanitizeNode(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent || '');
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = node as HTMLElement;
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'br') {
    return document.createElement('br');
  }
  if (tagName === 'strong' || tagName === 'b') {
    const strong = document.createElement('strong');
    sanitizeNodes(element, strong);
    return strong;
  }
  if (tagName === 'span') {
    const span = document.createElement('span');
    sanitizeNodes(element, span);
    return span;
  }
  if (tagName === 'a') {
    const href = element.getAttribute('href') || '';
    if (!isSafeHttpUrl(href)) {
      return null;
    }
    const link = document.createElement('a');
    link.setAttribute('href', href);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    sanitizeNodes(element, link);
    return link;
  }
  if (tagName === 'img') {
    const src = element.getAttribute('src') || '';
    if (!isSafeHttpUrl(src)) {
      return null;
    }
    const image = document.createElement('img');
    image.setAttribute('src', src);
    image.setAttribute('alt', element.getAttribute('alt') || '');
    return image;
  }

  return null;
}

function isSafeHttpUrl(url = '') {
  return /^https?:\/\//i.test(url);
}
</script>

<style lang="scss">
.c-pc-page-footer {
  padding: 24px 0;
  font-size: 14px;
  line-height: 1;
  text-align: center;
}

.c-pc-page-footer__link {
  color: $--color-white;
  text-decoration: none;
  text-shadow: 0 0 2px rgb(0 0 0 / 50%);
}

.c-pc-page-footer__copyright-info {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: rgb(255 255 255 / 40%);
}

.c-pc-page-footer__copyright-item {
  max-width: 100%;
  overflow-wrap: anywhere;
}

.c-pc-page-footer__copyright-item a {
  color: inherit;
  text-decoration: none;
}

.c-pc-page-footer__copyright-item a:hover {
  color: rgb(255 255 255 / 70%);
}

.c-pc-page-footer__copyright-item img {
  max-width: 16px;
  max-height: 16px;
  margin-right: 4px;
  vertical-align: -3px;
}
</style>
