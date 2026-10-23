<!-- @file 表单外层组件 -->
<template>
  <div class="c-form-wrap">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { useFormWrap, formWrapProps, formWrapEmits } from './hooks/use-form';

const props = defineProps(formWrapProps());

const emit = defineEmits(formWrapEmits());

const { validateCurrentForm } = useFormWrap({
  props,
  emit,
});

defineExpose({
  validateCurrentForm,
});
</script>
