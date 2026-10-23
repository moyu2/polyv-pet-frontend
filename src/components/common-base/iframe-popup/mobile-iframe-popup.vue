<template>
  <mobile-popup
    :visible="value"
    @close="close"
  >
    <iframe-render
      :src="src"
      :height="height"
      :auto-height="autoHeight"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import IframeRender from '@/components/common-base/iframe-render/mobile-iframe-render.vue';
import { iframePopupProps, iframePopupEmits, useIframePopup } from './use-iframe-popup';

const props = defineProps(iframePopupProps());
const emit = defineEmits(iframePopupEmits());

const { close } = useIframePopup({
  props,
  emit,
});
</script>
