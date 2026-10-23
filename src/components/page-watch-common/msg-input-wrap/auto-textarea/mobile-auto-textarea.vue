<!-- @file 移动端消息 textarea 输入框 -->
<template>
  <div
    class="c-mobile-auto-textarea pws-mobile-chat-msg-input"
    :class="{
      'c-mobile-auto-textarea--multi-row': textAreaIsMultiRow,
    }"
    :style="inputStyle"
  >
    <textarea
      ref="textareaRef"
      class="c-mobile-auto-textarea__inner pws-mobile-chat-msg-input-textarea"
      :class="{
        'c-mobile-auto-textarea__inner--disabled': disabled,
      }"
      enterkeyhint="send"
      rows="1"
      :value="realValue"
      :maxlength="maxlength"
      :placeholder="textareaPlaceholder"
      :disabled="disabled"
      :style="{
        maxHeight: `${textareaMaxHeight}px`,
        fontSize: `${fontSize}px`,
        lineHeight: `${lineHeight}`,
      }"
      @blur="onBlur"
      @focus="onFocus"
      @input="onInput"
      @keypress.enter.exact.prevent="onSubmit"
      @keypress.shift.enter="onEnter"
    ></textarea>

    <slot name="suffix"></slot>
  </div>
</template>

<script setup lang="ts">
import { useProps } from '@polyv/vue-components';
import { autoTextareaProps, autoTextareaEmits, useAutoTextarea } from './use-auto-textarea';

const props = defineProps(autoTextareaProps());

const emit = defineEmits(autoTextareaEmits());

const { maxlength, disabled, lineHeight, fontSize } = useProps(props);

const {
  textareaRef,
  textAreaIsMultiRow,
  textareaPlaceholder,
  textareaMaxHeight,
  realValue,
  textareaInstance,
  onBlur,
  onFocus,
  onInput,
  onEnter,
  onSubmit,
} = useAutoTextarea({
  props,
  emit,
});

defineExpose(textareaInstance);
</script>

<style lang="scss">
$--textarea-min-height: 36px;

.c-mobile-auto-textarea {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: $--textarea-min-height;
  border: 1px solid transparent;
  border-radius: 18px;
  transition: 0.3s;
}
.c-mobile-auto-textarea--multi-row {
  border-radius: 4px;
}

.c-mobile-auto-textarea__inner {
  box-sizing: border-box;
  flex: 1;
  width: 100%;
  min-height: 17px;
  padding: 0 12px;
  margin: 8px 0;
  overflow-x: hidden;
  overflow-y: auto;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6; // (14 + 8)/14
  color: inherit;
  vertical-align: top;
  resize: none;
  background: transparent;
  border: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::placeholder {
    color: #adadc0;
  }

  &:disabled,
  &:disabled::placeholder {
    color: rgba(#adadc0, 0.5);
  }
}

.c-mobile-auto-textarea__inner--disabled {
  pointer-events: none;
}
</style>
