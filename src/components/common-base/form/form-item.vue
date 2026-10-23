<!-- @file 表单节点 -->
<template>
  <div
    class="c-form-item"
    :class="{
      'c-form-item--header': labelModel === 'header',
      'c-form-item--mobile': isMobile,
    }"
  >
    <div
      v-if="formItemIsError"
      class="c-form-item__anchor"
      data-form-item-error
    ></div>
    <div class="c-form-item__body">
      <div
        v-if="labelText"
        class="c-form-item__label"
        :style="labelStyle"
      >
        <span
          v-if="required"
          class="c-form-item__label__required"
        >
          *
        </span>
        {{ labelText }}
      </div>

      <div
        class="c-form-item__content"
        :class="{
          'c-form-item__content--has-width': !!contentWidthStyle,
        }"
        :style="{
          width: contentWidthStyle,
        }"
      >
        <slot></slot>
      </div>
    </div>

    <div
      class="c-form-item__footer"
      :style="footerStyle"
    >
      <div
        v-if="tips"
        class="c-form-item__content__tips"
      >
        {{ tips }}
      </div>

      <div
        v-if="itemErrorMessage"
        class="c-form-item__content__error"
      >
        <div class="c-form-item__content__error__content">
          {{ itemErrorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formItemProps, useFormItem } from './hooks/use-form-item';

const props = defineProps(formItemProps());

const {
  required,
  labelText,
  labelModel,
  labelStyle,
  footerStyle,
  itemErrorMessage,
  contentWidthStyle,
  formItemIsError,
  formItemInstance,
  isMobile,
} = useFormItem({
  props,
});

defineExpose(formItemInstance);
</script>

<style lang="scss">
.c-form-item {
  position: relative;
  margin-bottom: 24px;
}

.c-form-item__body {
  display: flex;
  align-items: center;
}

.c-form-item__anchor {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
}

.c-form-item__label__required {
  color: #ff3636;
}
.c-form-item__label {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: flex-end;
  padding-right: 16px;
  font-size: 14px;
}

.c-form-item__content {
  // min-height: 40px;
  position: relative;
  flex-shrink: 0;

  &:not(.c-form-item__content--has-width) {
    flex: 1;
  }
}

.c-form-item--header {
  .c-form-item__body {
    flex-direction: column;
  }

  .c-form-item__label {
    justify-content: flex-start;
    width: 100%;
    padding-right: 0;
    margin-bottom: 8px;
    line-height: 1.5;
    color: $--font-color-primary;
  }
  .c-form-item__content {
    width: 100%;
  }
}

.c-form-item__content__tips {
  padding-top: 5px;
  font-size: 12px;
  line-height: 17px;
  color: $--font-color-info;
}

.c-form-item__content__error {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  font-size: 12px;
  color: $--font-color-error;
}

.c-form-item__content__error__content {
  position: absolute;
  top: 0;
  left: 0;
  padding-top: 5px;
}
</style>
