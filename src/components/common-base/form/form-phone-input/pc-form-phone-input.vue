<!-- @file PC 端表单组件：手机输入框 -->
<template>
  <div class="c-pc-form-phone-input">
    <form-input
      ref="inputRef"
      v-bind="attrs"
      type="number"
      :value="value"
      :placeholder="inputPlaceholder"
      :maxlength="11"
      @input="onFormInputChange"
      @blur="onFormInputBlur"
    >
      <div
        v-if="props.needAreaCode"
        slot="prefix"
        ref="referenceRef"
        class="c-pc-form-phone-input__area-code"
      >
        {{ areaCode }}
        <pc-icon-arrow-down class="c-pc-form-phone-input__area-code__icon" />
      </div>
    </form-input>

    <transition name="fade">
      <div
        v-show="popperVisible"
        ref="popperRef"
        class="c-pc-form-phone-input__popper"
      >
        <pc-phone-code
          :value="areaCode"
          @input="onPhoneCodeInput"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue';
import { PcIconArrowDown } from '@/components/component-icons/pc/map';
import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import PcPhoneCode from '@/components/common-base/phone-code/pc-phone-code.vue';
import { usePopper } from '@/hooks/components/use-popper';
import {
  formPhoneInputProps,
  formPhoneInputEmits,
  useFormPhoneInput,
} from './use-form-phone-input';

const props = defineProps(formPhoneInputProps());

const emit = defineEmits(formPhoneInputEmits());

const attrs = useAttrs();

const { referenceRef, popperRef, popperVisible, hidePopper } = usePopper({
  arrow: true,
  placement: 'bottom-start',
});

const {
  inputRef,
  inputPlaceholder,

  onFormInputChange,
  onFormInputBlur,
  onPhoneCodeInput,
} = useFormPhoneInput({
  props,
  emit,
  closePhoneCode: () => hidePopper(),
});
</script>

<style lang="scss">
.c-pc-form-phone-input__area-code {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 100%;
  font-size: 16px;
  color: $--font-color-primary;
  cursor: pointer;
}

.c-pc-form-phone-input__area-code__icon {
  display: flex;
  font-size: 16px !important;
}

.c-pc-form-phone-input__popper {
  width: 264px;
  height: 300px;
  border-radius: 4px;
  box-shadow: $--shadow-dialog;
}

.c-pc-form-phone-input .c-pc-form-input__main__inner:nth-child(2) .c-pc-form-input__main__input {
  padding-left: 0;
}
</style>
