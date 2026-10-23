<!-- @file PC 端表单组件：短信验证码输入框 -->
<template>
  <div class="c-pc-form-sms-verify-input">
    <form-input
      v-bind="attrs"
      :placeholder="inputPlaceholder"
      :maxlength="4"
      :value="value"
      @input="onInputChange"
    >
      <div
        slot="suffix"
        class="c-pc-form-sms-verify-input__send"
        :class="{
          'c-pc-form-sms-verify-input__send--disabled': sendDisabled,
        }"
        @click="onClickSend"
      >
        {{ sendText }}
      </div>
    </form-input>
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue';
import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import {
  formSmsVerifyInputProps,
  formSmsVerifyInputEmits,
  useSmsVerifyInput,
} from './use-sms-verify-input';

const props = defineProps(formSmsVerifyInputProps());

const emit = defineEmits(formSmsVerifyInputEmits());

const attrs = useAttrs();

const { inputPlaceholder, sendDisabled, sendText, onInputChange, onClickSend } = useSmsVerifyInput({
  props,
  emit,
});
</script>

<style lang="scss">
.c-pc-form-sms-verify-input {
  position: relative;
}
.c-pc-form-sms-verify-input__send {
  display: flex;
  align-items: center;
  height: 100%;
  padding-right: 12px;
  font-size: 14px;
  color: #3082fe;
  white-space: nowrap;
  cursor: pointer;
}

.c-pc-form-sms-verify-input__send--disabled {
  color: $--font-color-disabled;
  cursor: not-allowed;
}
</style>
