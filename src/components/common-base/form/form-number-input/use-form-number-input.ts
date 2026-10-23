import { PropUtils, useProps, VueProps, emitFunc, VueEmit } from '@polyv/vue-components';
import { computed, ref, unref } from 'vue';
import { InputValueType } from '../form-input/hooks/use-form-input';
import { FormInputInstance } from '../form-input/types/form-input-types';
import { formCommonProps } from '../hooks/use-form-common';

export type NumberInputValueType = string | number;

export const formNumberInputProps = () => ({
  ...formCommonProps(),
  // 绑定值
  value: PropUtils.oneOfType<NumberInputValueType>([String, Number]).def(''),
  // 最大值
  max: PropUtils.number.def(Infinity),
  // 最小值
  min: PropUtils.number.def(-Infinity),
});

export const formNumberInputEmits = () => ({
  input: emitFunc<NumberInputValueType>(),
});

export const useFormNumberInput = (options: {
  props: VueProps<typeof formNumberInputProps>;
  emit: VueEmit<typeof formNumberInputEmits>;
}) => {
  const { props, emit } = options;

  const { value } = useProps(props);

  const inputRef = ref<FormInputInstance>();

  /** 记录输入的值 */
  const tempInputVal = ref('');

  const stringVal = computed(() => {
    // 兼容处理，需要界面能够展示 1.0， 0.01 之类的字符
    if (Number(tempInputVal.value) === props.value && tempInputVal.value.substring(0, 1) !== '.') {
      return tempInputVal.value;
    }

    return String(props.value);
  });

  /**
   * 格式化值
   * 整数字符串超出 JS 安全整数范围（Number.MAX_SAFE_INTEGER）时，
   * Number() 转换会丢失精度（如 150428198605070018 -> 150428198605070000），
   * 因此需要保留字符串形式，避免保存错误的值。
   */
  function formatValue(val: string | number): NumberInputValueType {
    if (val === '') {
      return val;
    }

    if (typeof val === 'string' && /^-?\d+$/.test(val)) {
      const _val = Number(val);
      if (Number.isSafeInteger(_val) === false) {
        return val;
      }
    }

    return Number(val);
  }

  /**
   * 检查最大值和最小值
   */
  function checkMaxMin(val: NumberInputValueType): NumberInputValueType {
    if (val === '') {
      return val;
    }

    const _val = Number(val);
    if (_val > props.max) {
      return props.max;
    }
    if (_val < props.min) {
      return props.min;
    }
    return val;
  }

  function onInputChange(val: InputValueType): void {
    const newVal = checkMaxMin(val);

    tempInputVal.value = String(newVal);
    const emitVal = formatValue(newVal);

    emit('input', emitVal);

    const inputInstance = unref(inputRef);
    if (inputInstance) {
      inputInstance.forceUpdate();
    }
  }

  return {
    inputRef,
    stringVal,
    value,
    onInputChange,
  };
};
