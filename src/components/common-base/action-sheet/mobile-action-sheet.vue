<!-- @file 移动端动作面板 -->
<template>
  <mobile-popup
    ref="popupRef"
    class="c-mobile-action-sheet"
    v-bind="attrs"
    v-on="listeners"
    :show-header="false"
    :visible.sync="actionVisible"
  >
    <div class="c-mobile-action-sheet__content">
      <div
        v-for="(option, index) in actions"
        :key="index"
        class="c-mobile-action-sheet__content__item"
        :class="{
          'c-mobile-action-sheet__content__item--disabled': option.disabled,
        }"
        @click="onClickOption(option)"
      >
        <span
          v-if="option.loading"
          class="c-mobile-action-sheet__content__item__spinner"
        />
        {{ option.name }}
      </div>

      <div
        class="c-mobile-action-sheet__content__cancel"
        @click="onClickCancel"
      >
        {{ $lang('base.cancel') }}
      </div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { useAttrs, useListeners } from 'vue';
import { actionSheetProps, actionSheetEmits, useActionSheet } from './use-action-sheet';

const props = defineProps(actionSheetProps());

const emit = defineEmits(actionSheetEmits());

const attrs = useAttrs();

const listeners = useListeners();

const { actionVisible, popupRef, onClickOption, onClickCancel } = useActionSheet({
  props,
  emit,
});
</script>

<style lang="scss">
.c-mobile-action-sheet .c-mobile-popup__content {
  border-radius: 16px 16px 0 0 !important;
}

.c-mobile-action-sheet__content__item,
.c-mobile-action-sheet__content__cancel {
  height: 56px;
  font-size: 16px;
  line-height: 56px;
  text-align: center;
}

.c-mobile-action-sheet__content__item {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #f2f2f2;

  &--disabled {
    opacity: 0.6;
  }

  &:last-of-type {
    border-bottom: none;
  }
}

.c-mobile-action-sheet__content__item__spinner {
  display: inline-block;
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: mobile-action-sheet-spin 0.6s linear infinite;
}

.c-mobile-action-sheet__content__cancel {
  border-top: 8px solid #f2f2f2;
}

@keyframes mobile-action-sheet-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
