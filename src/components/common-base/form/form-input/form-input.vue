<!-- @file 表单组件：输入框 -->
<template>
  <div
    class="c-form-input"
    :class="inputClassNames"
  >
    <div
      class="c-form-input__main"
      :class="{
        'pws-dark-white-bg-10 pws-dark-white-color-100': formTheme === FormTheme.FollowSkin,
        'pws-light-white-bg-100': formTheme === FormTheme.FollowSkin,
      }"
    >
      <slot name="prefix"></slot>
      <div class="c-form-input__main__inner">
        <input
          ref="inputRef"
          class="c-form-input__main__input"
          :type="type"
          :value="value"
          :placeholder="placeholder"
          :maxlength="maxlength"
          :disabled="disabled"
          :readonly="readonly"
          @input="onInputChanged"
          @blur="onInputBlur"
          @focus="onInputFocus"
          @keydown.enter="onInputEnter"
        />
      </div>
      <template v-if="clearabled && value">
        <div
          class="c-form-input__main__input__clearabled"
          @click="clearValue"
        >
          <pc-icon-close-round-fill />
        </div>
      </template>
      <slot
        v-else
        name="suffix"
      >
        <span
          v-if="suffixText"
          class="c-form-input__main__input__suffix-text"
        >
          {{ suffixText }}
        </span>
        <span
          v-else-if="wordLimitText"
          class="c-form-input__main__input__suffix-text"
        >
          {{ wordLimitText }}
        </span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PcIconCloseRoundFill } from '@/components/component-icons/pc/map';
import { useProps } from '@polyv/vue-components';
import { formInputEmits, formInputProps, useFormInput } from './hooks/use-form-input';
import { FormTheme } from '../types/enums';

const emit = defineEmits(formInputEmits());

const props = defineProps(formInputProps());

const { value, type, placeholder, maxlength } = useProps(props);

const {
  inputRef,
  inputClassNames,
  onInputChanged,
  onInputBlur,
  onInputFocus,
  onInputEnter,
  clearValue,
  formInstance,
  wordLimitText,
  formTheme,
} = useFormInput({
  props,
  emit,
  classPrefix: 'c-form-input',
});

defineExpose(formInstance);
</script>

<style lang="scss">
.c-form-input {
  display: flex;
}

.c-form-input__main {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  align-items: center;
  height: $--form-input-height;
  overflow: hidden;
  color: $--font-color-primary;
  background: $--form-input-bg;
  border: 1px solid $--form-input-border-color;
  border-radius: $--form-input-border-radius;
}

.c-form-input__main__input__clearabled {
  margin-right: 12px;
  font-size: 16px;
  color: inherit;
  cursor: pointer;
  opacity: 0.6;

  span {
    display: flex;
  }
}

.c-form-input__main__inner {
  flex: 1;
  height: 100%;
}

.c-form-input__main__input {
  @include clear-input-style;
  box-sizing: border-box;
  display: block;
  width: 100%;
  height: 100%;
  padding: $--form-input-padding;
  font-size: $--form-input-font-size;
  color: inherit;
  background: none;

  &:read-only {
    cursor: inherit;
  }
}

.c-form-input__main__input__suffix-text {
  padding-right: 12px;
  font-size: 12px;
  color: rgba(#000, 0.2);
  white-space: nowrap;
}

.c-form-input--theme-gray {
  .c-form-input__main {
    background: map.get($--form-input-themes, 'gray', 'background');
    border-color: map.get($--form-input-themes, 'gray', 'border-color');
  }
}

.c-form-input--theme-white {
  .c-form-input__main {
    background: map.get($--form-input-themes, 'white', 'background');
    border-color: map.get($--form-input-themes, 'white', 'border-color');
  }
}

.c-form-input--theme-simplicity {
  .c-form-input__main {
    color: $--color-white;
    background: none;
    border: none;
    border-bottom: 1px solid rgba($--color-white, 0.1);
    border-radius: 0;
  }
  .c-form-input__main__input {
    text-align: center;
  }
}

.c-form-input--error {
  .c-form-input__main {
    border-color: $--form-input-border-color-error;
  }
}

.c-form-input--size-small {
  .c-form-input__main {
    height: $--form-input-height-small;
  }
  .c-form-input__main__input {
    padding: $--form-input-padding-small;
    font-size: $--form-input-font-size-small;
  }
}
</style>
