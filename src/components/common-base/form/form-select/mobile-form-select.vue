<!-- @file 移动端表单组件：下拉选择 -->
<template>
  <div class="c-mobile-form-select">
    <div
      class="c-mobile-form-select__body"
      @click="openOption"
    >
      <form-input
        :value="inputValue"
        :placeholder="inputPlaceholder"
        readonly
        :clearabled="false"
      >
        <template #suffix>
          <mobile-icon-arrow-down class="c-mobile-form-select__body__icon" />
        </template>
      </form-input>
    </div>

    <mobile-popup :visible.sync="optionVisible">
      <template #header>
        <div class="c-mobile-form-select__header">
          <div
            class="c-mobile-form-select__header__cancel"
            @click="closeOption"
          >
            {{ $lang('base.cancel') }}
          </div>
          <div
            class="c-mobile-form-select__header__confirm"
            @click="onClickConfirm"
          >
            {{ $lang('base.confirm') }}
          </div>
        </div>
      </template>

      <div class="c-mobile-form-select__options">
        <div
          v-if="title"
          class="c-mobile-form-select__options__title"
        >
          {{ title }}
        </div>

        <div
          v-if="searchEnabled"
          class="c-mobile-form-select__options__search"
        >
          <form-input
            v-model="searchKeyword"
            :placeholder="$lang('base.searchKeyword')"
            :size="FormSize.Medium"
            clearabled
            :validate-form="false"
          >
            <template #prefix>
              <mobile-icon-search class="c-mobile-form-select__options__search__icon" />
            </template>
          </form-input>
        </div>

        <div
          v-if="optionList.length === 0"
          class="c-mobile-form-select__options__empty"
        >
          {{ $lang('base.emptyOptions') }}
        </div>

        <div
          v-for="(item, index) in optionList"
          :key="index"
          class="c-mobile-form-select__options__item"
          :class="{
            'is-multiple': multiple,
            'c-mobile-form-select__options__item--active': isSelectedOption(item.value),
          }"
          @click="onClickOption(item)"
        >
          <span>{{ item.label }}</span>
          <mobile-icon-check
            v-if="multiple && isSelectedOption(item.value)"
            class="c-mobile-form-select__options__item__icon"
          />
        </div>
      </div>
    </mobile-popup>
  </div>
</template>

<script setup lang="ts">
import {
  MobileIconArrowDown,
  MobileIconCheck,
  MobileIconSearch,
} from '@/components/component-icons/mobile/map';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import { FormSize } from '../types/enums';
import {
  formSelectProps,
  formSelectEmits,
  useFormSelect,
  useFormSelectMobile,
} from './use-form-select';
import { watch } from 'vue';

const props = defineProps(formSelectProps());

const emit = defineEmits(formSelectEmits());

const { title, inputValue, inputPlaceholder, optionList, searchEnabled, searchKeyword } =
  useFormSelect({
    props,
    emit,
  });

const { optionVisible, openOption, closeOption, onClickOption, onClickConfirm, isSelectedOption } =
  useFormSelectMobile({
    props,
    emit,
  });

watch(
  () => optionVisible.value,
  () => {
    if (optionVisible.value) {
      searchKeyword.value = '';
    }
  },
);
</script>

<style lang="scss">
.c-mobile-form-select__body__icon {
  display: flex;
  margin-right: 16px;
  font-size: 20px !important;
  color: inherit;
  opacity: 0.6;
}

.c-mobile-form-select__header {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  width: 100%;
  height: 50px;
  padding: 0 16px;
  font-size: 16px;
  line-height: 50px;
  border-bottom: 1px solid $--border-color-primary;
}

.c-mobile-form-select__options {
  padding: 16px;
}

.c-mobile-form-select__header__cancel {
  color: #9195a1;
}
.c-mobile-form-select__header__confirm {
  color: #3082fe;
}

.c-mobile-form-select__options__search {
  margin-bottom: 12px;
}

.c-mobile-form-select__options__search__icon {
  margin-right: -4px;
  margin-left: 16px;
  font-size: 16px;
  color: #757575;
}

.c-mobile-form-select__options__empty {
  font-size: 14px;
  line-height: 40px;
  color: #757575;
  text-align: center;
}

.c-mobile-form-select__options__title {
  margin-bottom: 18px;
  font-size: 14px;
  line-height: 22px;
  color: #666;
}

.c-mobile-form-select__options__item {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 8px 42px 8px 16px;
  margin-bottom: 8px;
  line-height: 22px;
  color: #333;
  text-align: center;
  background: #f6f6f6;
  border: 1px solid transparent;
  border-radius: 8px;

  &:last-of-type {
    margin-bottom: 0;
  }

  &.is-multiple {
    justify-content: flex-start;
  }
}

.c-mobile-form-select__options__item__icon {
  position: absolute;
  top: 50%;
  right: 20px;
  display: flex;
  font-size: 18px;
  color: #3f76fc;
  transform: translateY(-50%);
}

.c-mobile-form-select__options__item--active {
  color: #3f76fc;
  background: rgba(#3f76fc, 0.1);
  border-color: #3f76fc;

  &.is-multiple {
    background: #f6f6f6;
    border-color: transparent;
  }
}
</style>
