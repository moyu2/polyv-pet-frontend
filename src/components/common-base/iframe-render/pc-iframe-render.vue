<!-- @file PC 端 iframe 渲染 -->
<template>
  <div
    class="c-pc-iframe-render"
    :style="wrapStyle"
  >
    <iframe
      class="c-pc-iframe-render__iframe"
      :src="iframeSrc"
      frameborder="0"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { iframeRenderProps, useIframeRender } from './use-iframe-render';

const props = defineProps(iframeRenderProps());

const { iframeSrc, wrapStyle } = useIframeRender({
  props,
});
</script>

<style lang="scss">
.c-pc-iframe-render {
  height: 100%;
}
.c-pc-iframe-render__iframe {
  width: 100%;
  height: 100%;
}
</style>
