<!-- @file 移动端表单组件：复选框 -->
<template>
  <div
    class="c-mobile-form-checkbox"
    :class="{
      'is-checked': isChecked,
    }"
  >
    <div
      class="c-mobile-form-checkbox__inner"
      :class="{
        'c-mobile-form-checkbox__inner__circle': props.circle,
      }"
      @click="onClickCheckbox"
    >
      <mobile-icon-check class="c-mobile-form-checkbox__inner__icon" />
    </div>

    <div class="c-mobile-form-checkbox__content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MobileIconCheck } from '@/components/component-icons/mobile/map';
import { formCheckboxProps, formCheckboxEmits, useFormCheckbox } from './use-form-checkbox';

const props = defineProps(formCheckboxProps());

const emit = defineEmits(formCheckboxEmits());

const { isChecked, onClickCheckbox } = useFormCheckbox({
  props,
  emit,
});
</script>

<style lang="scss">
.c-mobile-form-checkbox {
  display: flex;
  align-items: flex-start;
}
.c-mobile-form-checkbox__inner {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-top: 2px;
  margin-right: 6px;
  overflow: hidden;
  cursor: pointer;
  background: $--color-white;
  border: 1px solid #cfd8dc;
  border-radius: 2px;
}
.c-mobile-form-checkbox__inner__circle {
  border-radius: 50%;
}
.c-mobile-form-checkbox__inner__icon {
  display: flex;
  font-size: 14px !important;
  color: $--color-white;
}
.c-mobile-form-checkbox__content {
  font-size: 14px;
  line-height: 22px;
}

.c-mobile-form-checkbox.is-checked {
  .c-mobile-form-checkbox__inner {
    background: $--color-primary;
    border: none;
  }
}
</style>
