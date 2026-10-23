<!-- @file 移动端表单组件：地区选择 -->
<template>
  <div
    class="c-mobile-form-area-picker"
    :class="{
      'c-mobile-form-area-picker--error': formItemIsError,
    }"
  >
    <div
      class="c-mobile-form-area-picker__body"
      @click="openPicker"
    >
      <form-input
        readonly
        :placeholder="inputPlaceholder"
        :value="inputValue"
        :clearabled="false"
      >
        <template #suffix>
          <mobile-icon-arrow-down class="c-mobile-form-area-picker__body__icon" />
        </template>
      </form-input>
    </div>

    <mobile-popup
      :visible.sync="pickerVisible"
      fill-body-section
      @close="onHiddenPicker"
    >
      <template #header>
        <div class="c-mobile-form-area-picker__header">
          <div
            class="c-mobile-form-area-picker__header__cancel"
            @click="closePicker"
          >
            {{ $lang('base.cancel') }}
          </div>
          <div class="c-mobile-form-area-picker__header__placeholder">{{ inputPlaceholder }}</div>
          <div
            class="c-mobile-form-area-picker__header__confirm"
            :class="{
              'c-mobile-form-area-picker__header__confirm--disabled': !innerIsFinish,
            }"
            @click="onClickConfirm"
          >
            {{ $lang('base.confirm') }}
          </div>
        </div>
      </template>

      <plv-area-picker
        v-model="innerValue"
        :key="refreshKey"
      />
    </mobile-popup>
  </div>
</template>

<script setup lang="ts">
import { MobileIconArrowDown } from '@/components/component-icons/mobile/map';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import { PlvAreaPicker } from '@/plugins/polyv-ui/mobile-import';
import type { AreaPickerComponent } from '@/plugins/polyv-ui/types';
import { formAreaPickerEmit, formAreaPickerProps, useFormAreaPicker } from './use-form-area-picker';

const props = defineProps(formAreaPickerProps());

const emit = defineEmits(formAreaPickerEmit());

const {
  innerValue,
  pickerVisible,
  openPicker,
  closePicker,
  inputValue,
  inputPlaceholder,
  instance,
  formItemIsError,
  onClickConfirm,
  innerIsFinish,
  refreshKey,
  onHiddenPicker,
} = useFormAreaPicker({
  props,
  emit,
  AreaPicker: PlvAreaPicker as AreaPickerComponent,
});

defineExpose(instance);
</script>

<style lang="scss">
.c-mobile-form-area-picker__body__icon {
  display: flex;
  margin-right: 16px;
  font-size: 20px !important;
  color: inherit;
  opacity: 0.6;
}

.c-mobile-form-area-picker__header {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  width: 100%;
  height: 50px;
  padding: 0 16px;
  font-size: 16px;
  line-height: 50px;
  border-bottom: 1px solid $--border-color-primary;
}

.c-mobile-form-area-picker__header__cancel {
  color: #9195a1;
}
.c-mobile-form-area-picker__header__confirm {
  color: #3082fe;

  &.c-mobile-form-area-picker__header__confirm--disabled {
    color: #9e9e9e;
  }
}

.c-mobile-form-area-picker__header__placeholder {
  flex: 1;
  overflow: hidden;
  font-size: 16px;
  color: $--font-color-primary;
  text-align: center;
}
</style>
