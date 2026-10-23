<!-- @file PC 端表单组件：下拉选择 -->
<template>
  <div class="c-pc-form-select">
    <div
      ref="referenceRef"
      class="c-pc-form-select__reference"
    >
      <form-input
        :value="inputValue"
        :placeholder="inputPlaceholder"
        readonly
        :clearabled="false"
      >
        <template #suffix>
          <pc-icon-arrow-down
            class="c-pc-form-select__body__icon"
            :class="{
              'is-open': popperVisible,
            }"
          />
        </template>
      </form-input>
    </div>
    <!-- <div
      ref="referenceRef"
      class="c-pc-form-select__body"
      :class="[
        {
          'c-pc-form-select__body--open': popperVisible,
        },
      ]"
    >
      <input
        type="text"
        class="c-pc-form-select__body__input"
        :value="inputValue"
        :placeholder="inputPlaceholder"
        readonly
      />
      <pc-icon-arrow-down class="c-pc-form-select__body__icon" />
    </div> -->

    <transition name="fade">
      <div
        ref="popperRef"
        v-show="popperVisible"
        class="c-pc-form-select__options-wrapper"
      >
        <div class="c-pc-form-select__options">
          <!-- 搜索 -->
          <div
            v-if="searchEnabled"
            class="c-pc-form-select__options__search"
          >
            <form-input
              v-model="searchKeyword"
              :placeholder="$lang('base.searchKeyword')"
              :size="FormSize.Small"
              clearabled
              :validate-form="false"
            >
              <template #suffix>
                <pc-icon-search class="c-pc-form-select__options__search__icon" />
              </template>
            </form-input>
          </div>

          <div
            v-if="optionList.length === 0"
            class="c-pc-form-select__options__empty"
          >
            {{ $lang('base.emptyOptions') }}
          </div>

          <div
            v-for="(option, index) in optionList"
            class="c-pc-form-select__options__item"
            :key="index"
            @click="onClickOption(option)"
          >
            <pc-form-checkbox
              v-if="multiple"
              :checked="isSelectedOption(option.value)"
            />
            <span class="c-pc-form-select__options__item__text">{{ option.label }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { PcIconArrowDown, PcIconSearch } from '@/components/component-icons/pc/map';
import FormInput from '../form-input/form-input.vue';
import PcFormCheckbox from '../form-checkbox/pc-form-checkbox.vue';
import { formSelectProps, formSelectEmits, useFormSelect } from './use-form-select';
import { FormSize } from '../types/enums';
import { usePopper } from '@/hooks/components/use-popper';
import { watch, unref } from 'vue';

const props = defineProps(formSelectProps());

const emit = defineEmits(formSelectEmits());

const { referenceRef, popperRef, popperVisible, hidePopper } = usePopper({
  placement: 'bottom-start',
  followReferenceWidth: true,
  popperOffset: [0, 10],
});

const {
  multiple,
  inputValue,
  inputPlaceholder,
  optionList,
  searchEnabled,
  searchKeyword,
  onClickOption,
  isSelectedOption,
  blurToValidateItem,
  focusToRemoveError,
} = useFormSelect({
  props,
  emit,
  closeOptions: () => {
    hidePopper();
  },
});

watch(
  () => unref(popperVisible),
  () => {
    if (unref(popperVisible) === false) {
      blurToValidateItem();
    } else {
      focusToRemoveError();
      searchKeyword.value = '';
    }
  },
);
</script>

<style lang="scss">
.c-pc-form-select__reference {
  cursor: pointer;
}
.c-pc-form-select__body__icon {
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

.c-pc-form-select__options-wrapper {
  overflow: hidden;
  background: $--color-white;
  border-radius: $--popper-border-radius;
  box-shadow: $--popper-shadow;
}

.c-pc-form-select__options {
  box-sizing: border-box;
  max-height: 200px;
  padding: 8px;
  overflow-y: auto;
  @include scroll-style;
}

.c-pc-form-select__options__search {
  margin-bottom: 8px;
}

.c-pc-form-select__options__search__icon {
  margin-right: 8px;
  font-size: 12px;
  color: #757575;
}

.c-pc-form-select__options__empty {
  font-size: 14px;
  line-height: 40px;
  color: #757575;
  text-align: center;
}

.c-pc-form-select__options__item {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 0 12px;
  font-size: 14px;
  line-height: 22px;
  color: rgba(#000, 0.6);
  cursor: pointer;
  user-select: none;
  border-radius: 8px;

  & + & {
    margin-top: 3px;
  }
}
.c-pc-form-select__options__item:hover {
  color: rgba(#000, 0.8);
  background: #f2f3f5;
}
.c-pc-form-select__options__item__text {
  flex: 1;
}
</style>
