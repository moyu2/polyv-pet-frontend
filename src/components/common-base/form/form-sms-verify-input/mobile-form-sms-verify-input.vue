<!-- @file 移动端表单组件：短信验证码输入框 -->
<template>
  <div class="c-mobile-form-sms-verify-input">
    <form-input
      v-bind="attrs"
      :placeholder="inputPlaceholder"
      :maxlength="4"
      :clearabled="false"
      :value="value"
      @input="onInputChange"
    >
      <div
        slot="suffix"
        class="c-mobile-form-sms-verify-input__send"
        :class="{
          'c-mobile-form-sms-verify-input__send--disabled': sendDisabled,
        }"
        @click="onClickSend"
      >
        {{ sendText }}
      </div>
    </form-input>
  </div>
</template>

<script setup lang="ts">
import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import { useAttrs } from 'vue';
import {
  formSmsVerifyInputEmits,
  formSmsVerifyInputProps,
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
.c-mobile-form-sms-verify-input {
  position: relative;
}
.c-mobile-form-sms-verify-input__send {
  display: flex;
  align-items: center;
  height: 100%;
  padding-right: 12px;
  font-size: 14px;
  color: #3082fe;
  white-space: nowrap;
  cursor: pointer;
}

.c-mobile-form-sms-verify-input__send--disabled {
  color: $--font-color-disabled;
  cursor: not-allowed;
}

.c-mobile-form-sms-verify-input__slide {
  width: 100%;
  margin-top: 20px;
}
</style>
