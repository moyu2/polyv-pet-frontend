<!-- @file 移动端表单组件：手机输入框 -->
<template>
  <div class="c-mobile-form-phone-input">
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
        class="c-mobile-form-phone-input__area-code"
        @click="openAreaCodePopup"
      >
        {{ areaCode }}
        <mobile-icon-arrow-down class="c-mobile-form-phone-input__area-code__icon" />
      </div>
    </form-input>

    <mobile-popup
      :visible.sync="areaCodeVisible"
      backable
      :mask="false"
      :closable="false"
      hide-header-border
      full-screen
      back-auto-close
      :title="$lang('base.region')"
    >
      <div class="c-mobile-form-phone-input__popup">
        <mobile-phone-code
          :value="areaCode"
          @input="onPhoneCodeInput"
        />
      </div>
    </mobile-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, useAttrs } from 'vue';
import { MobileIconArrowDown } from '@/components/component-icons/mobile/map';
import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import MobilePhoneCode from '@/components/common-base/phone-code/mobile-phone-code.vue';
import {
  formPhoneInputProps,
  formPhoneInputEmits,
  useFormPhoneInput,
} from './use-form-phone-input';

const props = defineProps(formPhoneInputProps());

const emit = defineEmits(formPhoneInputEmits());

const attrs = useAttrs();

/** 手机区号选择是否显示 */
const areaCodeVisible = ref(false);

function openAreaCodePopup() {
  areaCodeVisible.value = true;
}

const {
  inputRef,
  inputPlaceholder,

  onFormInputChange,
  onFormInputBlur,
  onPhoneCodeInput,
} = useFormPhoneInput({
  props,
  emit,
  closePhoneCode: () => (areaCodeVisible.value = false),
});
</script>

<style lang="scss">
.c-mobile-form-phone-input__area-code {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 100%;
  font-size: 16px;
  color: $--font-color-primary;
  cursor: pointer;
}

.c-mobile-form-phone-input__area-code__icon {
  display: flex;
  margin-left: 2px;
  font-size: 16px !important;
}

.c-mobile-form-phone-input__popup {
  width: 100%;
  height: 100%;
}
</style>
