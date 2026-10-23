<!-- @file 移动端横屏-菜单-推广链接 -->

<template>
  <mobile-iframe-render
    v-if="isOpenInMenu && iframeUrl"
    :src="iframeUrl"
    :auto-height="true"
  />
  <div
    v-else
    class="c-mobile-promote-external-link__tips-wrapper"
  >
    <p class="c-mobile-promote-external-link__tips">{{ tips }}</p>
  </div>
</template>

<script lang="ts" setup>
import MobileIframeRender from '@/components/common-base/iframe-render/mobile-iframe-render.vue';

import { promoteExternalLinkProps, usePromoteExternalLinkHook } from './use-promote-external-link';

const props = defineProps(promoteExternalLinkProps());

const {
  isOpenInMenu,

  iframeUrl,
  tips,
} = usePromoteExternalLinkHook({ props });
</script>

<style lang="scss">
.c-mobile-promote-external-link__tips-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.c-mobile-promote-external-link__tips {
  padding: 0 40px;
  line-height: 20px;
  color: #adadc0;
  text-align: center;
}
</style>
