<!-- @file PC 端协议勾选 -->
<template>
  <div class="c-pc-form-protocol">
    <slot name="checkbox-label"></slot>

    <pc-form-checkbox
      v-bind="attrs"
      :checked="checkboxChecked"
      @change="onCheckboxChange"
    >
      <div
        class="c-pc-form-protocol__content"
        ref="protocolContentRef"
        v-html="contentHtml"
      ></div>
    </pc-form-checkbox>
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue';
import PcFormCheckbox from '../form-checkbox/pc-form-checkbox.vue';
import {
  formProtocolProps,
  formProtocolEmits,
  useFormProtocol,
  FormProtocolInstance,
} from './use-form-protocol';

const props = defineProps(formProtocolProps());

const emit = defineEmits(formProtocolEmits());

const attrs = useAttrs();

function openProtocol(el: HTMLAnchorElement) {
  window.open(el.href, '_blank');
}

const {
  checkboxChecked,
  onCheckboxChange,

  protocolContentRef,
  contentHtml,
} = useFormProtocol({
  props,
  emit,
  onProtocolClick: el => {
    openProtocol(el);
  },
});

defineExpose<FormProtocolInstance>({
  openProtocol,
});
</script>

<style lang="scss">
.c-pc-form-protocol {
  position: relative;
  .c-pc-form-checkbox__inner {
    margin-top: 3px;
  }
}
.c-pc-form-protocol__content {
  a {
    font-style: normal;
    color: $--color-primary;
    text-decoration: none;
    cursor: pointer;
  }
}
</style>
