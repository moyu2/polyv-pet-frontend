<template>
  <mobile-popup
    :visible="visible"
    fill-body-section
    @close="closePicker"
  >
    <template #header>
      <div class="c-mobile-form-area-picker__header">
        <div
          class="c-mobile-form-area-picker__header__cancel"
          @click="closePicker"
        >
          {{ $lang('base.cancel') }}
        </div>
        <div class="c-mobile-form-area-picker__header__placeholder">
          {{ $lang('order.pickArea') }}
        </div>
        <div
          class="c-mobile-form-area-picker__header__confirm"
          :class="{
            'c-mobile-form-area-picker__header__confirm--disabled': !isFinish,
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
</template>

<script lang="ts" setup>
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { areaPickerEmit, areaPickerProps, useAreaPicker } from './use-area-picker';
import { PlvAreaPicker } from '@/plugins/polyv-ui/mobile-import';
import type { AreaPickerComponent } from '@/plugins/polyv-ui/types';

const props = defineProps(areaPickerProps());
const emit = defineEmits(areaPickerEmit());

const { closePicker, isFinish, innerValue, instance, refreshKey, onClickConfirm } = useAreaPicker({
  props,
  emit,
  AreaPicker: PlvAreaPicker as AreaPickerComponent,
});
defineExpose(instance);
</script>
