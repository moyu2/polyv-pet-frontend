<!-- @file 表单组件：数值输入框 -->
<template>
  <div class="c-form-number-input">
    <form-input
      ref="inputRef"
      v-bind="attrs"
      type="number"
      :value="stringVal"
      @input="onInputChange"
    >
      <template
        v-for="(index, name) in $slots"
        v-slot:[name]
      >
        <slot :name="name" />
      </template>
    </form-input>
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue';
import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import {
  formNumberInputProps,
  formNumberInputEmits,
  useFormNumberInput,
} from './use-form-number-input';

const props = defineProps(formNumberInputProps());

const emit = defineEmits(formNumberInputEmits());

const attrs = useAttrs();

const { inputRef, stringVal, onInputChange } = useFormNumberInput({
  props,
  emit,
});
</script>
