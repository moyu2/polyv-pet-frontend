<!-- @file 表单提交按钮组件 -->
<template>
  <normal-button
    :text="text"
    :native-type="nativeType"
    :type="type"
    :size="size"
    :block="block"
    :disabled="buttonIsDisabled"
    :allow-disabled-click="allowDisabledClick"
    @click="onButtonClick"
  />
</template>

<script setup lang="ts">
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { formSubmitButtonProps, useFormSubmitButton } from './hooks/use-form-submit-button';

const props = defineProps(formSubmitButtonProps());

const { buttonIsDisabled, onButtonClick, formSubmitButtonInstance } = useFormSubmitButton({
  props,
});

defineExpose(formSubmitButtonInstance);
</script>
