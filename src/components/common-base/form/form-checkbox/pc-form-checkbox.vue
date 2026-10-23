<!-- @file PC 端表单组件：复选框 -->
<template>
  <div
    class="c-pc-form-checkbox pws-pc-checkbox"
    :class="{
      'is-checked': isChecked,
    }"
  >
    <div
      class="c-pc-form-checkbox__inner pws-pc-checkbox-inner"
      :class="{
        'c-pc-form-checkbox__inner__circle': props.circle,
      }"
      @click="onClickCheckbox"
    >
      <pc-icon-check
        v-if="isChecked"
        class="c-pc-form-checkbox__inner__icon pws-pc-checkbox-inner-icon"
      />
    </div>

    <div class="c-pc-form-checkbox__content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PcIconCheck } from '@/components/component-icons/pc/map';
import { formCheckboxProps, formCheckboxEmits, useFormCheckbox } from './use-form-checkbox';

const props = defineProps(formCheckboxProps());

const emit = defineEmits(formCheckboxEmits());

const { isChecked, onClickCheckbox } = useFormCheckbox({
  props,
  emit,
});
</script>

<style lang="scss">
.c-pc-form-checkbox {
  display: flex;
  align-items: flex-start;
}
.c-pc-form-checkbox__inner {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-top: 3px;
  margin-right: 6px;
  overflow: hidden;
  line-height: 16px;
  cursor: pointer;
  border: 1px solid #cfd8dc;
  border-radius: 2px;
}
.c-pc-form-checkbox__inner__circle {
  border-radius: 50%;
}
.c-pc-form-checkbox__inner__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px !important;
  color: $--color-white;
}
.c-pc-form-checkbox__content {
  font-size: 14px;
  line-height: 22px;
}

.c-pc-form-checkbox.is-checked {
  .c-pc-form-checkbox__inner {
    background: $--color-primary;
    border: none;
  }
}
</style>
