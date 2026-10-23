<template>
  <pc-dialog
    :visible="value"
    :width="720"
    @close="close"
  >
    <iframe-render
      :src="src"
      :height="height"
      :auto-height="autoHeight"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import IframeRender from '@/components/common-base/iframe-render/pc-iframe-render.vue';
import { useIframePopup, iframePopupProps, iframePopupEmits } from './use-iframe-popup';

const props = defineProps(iframePopupProps());
const emit = defineEmits(iframePopupEmits());

const { close } = useIframePopup({
  props,
  emit,
});
</script>
