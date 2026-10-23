<!-- @file PC 端表单组件：地区选择 -->
<template>
  <div class="c-pc-form-area-picker">
    <plv-area-picker
      v-model="innerValue"
      :placeholder="placeholder"
      @hidden-popper="onHiddenPicker"
      @show-popper="onShowPicker"
    >
      <template #input="{ inputPlaceholder, labelText, showPopper }">
        <form-input
          :value="labelText"
          :placeholder="inputPlaceholder"
          :clearabled="false"
          readonly
        >
          <template #suffix>
            <pc-icon-arrow-down
              class="c-pc-form-area-picker__body__icon"
              :class="{
                'is-open': showPopper,
              }"
            />
          </template>
        </form-input>
      </template>
    </plv-area-picker>
  </div>
</template>

<script setup lang="ts">
import { PlvAreaPicker } from '@/plugins/polyv-ui/pc-import';
import type { AreaPickerComponent } from '@/plugins/polyv-ui/types';
import { formAreaPickerEmit, formAreaPickerProps, useFormAreaPicker } from './use-form-area-picker';
import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import { PcIconArrowDown } from '@/components/component-icons/pc/map';

const props = defineProps(formAreaPickerProps());

const emit = defineEmits(formAreaPickerEmit());

const { innerValue, instance, onHiddenPicker, onShowPicker } = useFormAreaPicker({
  props,
  emit,
  AreaPicker: PlvAreaPicker as AreaPickerComponent,
});

defineExpose(instance);
</script>

<style lang="scss">
.c-pc-form-area-picker__body__icon {
  display: flex;
  margin-right: 8px;
  font-size: 16px !important;
  color: inherit;
  opacity: 0.6;
  transition: 0.3s;

  &.is-open {
    transform: rotateZ(180deg);
  }
}
</style>
