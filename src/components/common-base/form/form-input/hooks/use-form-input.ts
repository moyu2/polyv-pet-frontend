/**
 * @file 表单组件输入框 hook
 */

import { useVue } from '@/hooks/core/use-vue';
import { PropUtils, VueProps, emitFunc, VueEmit } from '@polyv/vue-components';
import {
  formCommonProps,
  useFormCommon,
  useFormCommonValidate,
} from '@/components/common-base/form/hooks/use-form-common';
import { computed, ref, unref } from 'vue';
import { FormInputInstance } from '../types/form-input-types';
import { isMobile } from '@/assets/utils/browser';

export type InputValueType = string | number;

export const formInputProps = () => ({
  ...formCommonProps(),
  /** 禁用输入 */
  disabled: PropUtils.bool.def(false),
  /** 只读 */
  readonly: PropUtils.bool.def(false),
  /** 绑定值 */
  value: PropUtils.oneOfType<InputValueType>([String, Number]).def(''),
  /** 输入框原生类型 */
  type: PropUtils.string.def('text'),
  /** 输入框占位 */
  placeholder: PropUtils.string.def(''),
  /** 最大长度 */
  maxlength: PropUtils.number.def(Infinity),
  /** 显示字数限制，默认：false */
  showWordLimit: PropUtils.bool.def(false),
  /** 尾部文字 */
  suffixText: PropUtils.string.def(''),
  /** 清空，PC 端默认 true，移动端默认 false */
  clearabled: PropUtils.bool.def(isMobile),

  /** 输入框标题，仅移动端下适用 */
  inputTitle: PropUtils.string.def(''),
  /** 输入框标题宽度，仅移动端下适用 */
  inputTitleWidth: PropUtils.number.def(undefined),
});

export const formInputEmits = () => ({
  input: emitFunc<InputValueType>(),
  /** 失焦 */
  blur: emitFunc<InputValueType>(),
  /** 聚焦 */
  focus: emitFunc<InputValueType>(),
  /** 回车事件 */
  enter: emitFunc<InputValueType>(),
});

export const useFormInput = (options: {
  props: VueProps<typeof formInputProps>;
  emit: VueEmit<typeof formInputEmits>;
  classPrefix: string;
}) => {
  const { emit, props, classPrefix } = options;

  const { blurToValidateItem, focusToRemoveError, formItemIsError } = useFormCommonValidate({
    props,
  });

  const { commonClassNames, formTheme } = useFormCommon({
    props,
    classPrefix,
  });

  /** <input /> 实例 */
  const inputRef = ref<HTMLInputElement>();

  /** 是否正在聚焦 */
  const isFocus = ref(false);

  /** 输入框 className */
  const inputClassNames = computed(() => {
    const classNames = [...unref(commonClassNames)];

    if (unref(formItemIsError)) {
      classNames.push(`${classPrefix}--error`);
    }

    return classNames;
  });

  /** 字数限制文案 */
  const wordLimitText = computed<string>(() => {
    if (!props.showWordLimit) {
      return '';
    }

    const length = `${props.value ?? ''}`.length;
    if (props.maxlength === Infinity) {
      return `${length}`;
    }

    return `${length}/${props.maxlength}`;
  });

  /** 清空输入值 */
  function clearValue() {
    emit('input', '');
    focusInput();
  }

  /** 处理输入框输入事件 */
  function onInputChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    let value = target.value;
    if (props.type === 'number') {
      value = value.slice(0, props.maxlength);
      if (inputRef.value) {
        inputRef.value.setAttribute('value', value);
      }
    }
    emit('input', value);
  }

  /** 处理输入框失焦事件 */
  function onInputBlur() {
    isFocus.value = false;
    blurToValidateItem();
    emit('blur', props.value);
  }

  /** 处理输入框聚焦事件 */
  function onInputFocus() {
    isFocus.value = true;
    focusToRemoveError();
    emit('focus', props.value);
  }

  /** 处理输入框回车事件 */
  function onInputEnter() {
    emit('enter', props.value);
  }

  const { getInstance } = useVue();

  /** 强制更新 */
  function forceUpdate(): void {
    const instance = getInstance();
    instance?.$forceUpdate();
  }

  /** 聚焦输入框 */
  function focusInput() {
    inputRef.value?.focus();
  }

  /** 失焦输入框 */
  function blurInput() {
    inputRef.value?.blur();
  }

  const formInstance: FormInputInstance = {
    forceUpdate,
    focusInput,
    blurInput,
  };

  return {
    inputRef,
    inputClassNames,
    formTheme,
    isFocus,
    onInputChanged,
    onInputBlur,
    onInputFocus,
    onInputEnter,
    clearValue,
    formInstance,
    wordLimitText,
  };
};
