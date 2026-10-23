import { translate } from '@/assets/lang';
import { isArray, tupleString } from '@/assets/utils/array';
import { PropUtils, useProps, VueProps, emitFunc, VueEmit } from '@polyv/vue-components';
import { computed, ref } from 'vue';
import { SelectOptionItem, SelectValueType } from './types/select-types';

export const selectProps = () => ({
  /** 主题 */
  theme: PropUtils.oneOf(tupleString('dark', 'light')).def('light'),
  /** 绑定值 */
  value: PropUtils.oneOfType<SelectValueType | SelectValueType[]>([
    String,
    Number,
    Array,
    Boolean,
  ]).def(''),
  /** 输入框标题 */
  title: PropUtils.string,
  /** 占位符 */
  placeholder: PropUtils.string,
  /** 选项列表 */
  options: PropUtils.array<SelectOptionItem>(),
  /** 是否多选 */
  multiple: PropUtils.bool.def(false),
  /** 搜索 */
  search: PropUtils.bool.def(false),
  /** popper 选项 */
  popperOptions: PropUtils.object().def({}),
});

export const selectEmits = () => ({
  input: emitFunc<SelectValueType | SelectValueType[]>(),
});

export const useSelect = (options: {
  props: VueProps<typeof selectProps>;
  emit: VueEmit<typeof selectEmits>;
  closeOptions?: () => void;
}) => {
  const { props, emit, closeOptions } = options;

  const { title } = useProps(props);

  /** 输入框的 value 值 */
  const inputValue = computed<string>(() => {
    let valText = '';

    if (props.multiple && isArray<SelectValueType[]>(props.value) && props.value.length) {
      return `${translate('form.select.multiPrefix')}${props.value.length}${translate(
        'form.select.multiSuffix',
      )}`;
    }

    if (!props.multiple) {
      const index = props.options.findIndex(option => option.value === props.value);
      if (index !== -1) {
        valText = props.options[index].label;
      }
    }

    return valText;
  });

  /** 输入框占位符 */
  const inputPlaceholder = computed(() => props.placeholder);

  /** 选项列表 */
  const optionList = computed<SelectOptionItem[]>(() => {
    return props.options;
  });

  function onClickOption(option: SelectOptionItem): void {
    if (props.multiple && isArray<SelectValueType[]>(props.value)) {
      if (props.value.includes(option.value)) {
        emit(
          'input',
          props.value.filter(item => item !== option.value),
        );
      } else {
        emit('input', [...props.value, option.value]);
      }
    }

    if (!props.multiple) {
      if (option.value !== props.value) {
        emit('input', option.value);
      }

      if (closeOptions) {
        closeOptions();
      }
    }
  }

  return {
    title,
    inputValue,
    inputPlaceholder,
    optionList,
    onClickOption,
  };
};

/**
 * 移动端下的 select
 */
export const useSelectMobile = (options: {
  props: VueProps<typeof selectProps>;
  emit: VueEmit<typeof selectEmits>;
}) => {
  const { props, emit } = options;

  /** 选项是否显示 */
  const optionVisible = ref(false);

  /** 打开选项 */
  function openOption() {
    optionVisible.value = true;
  }

  /** 关闭选项 */
  function closeOption() {
    optionVisible.value = false;
  }

  /** 已选的 value */
  const selectValue = ref<SelectValueType | SelectValueType[]>('');

  /** 处理点击选项 */
  function onClickOption(option: SelectOptionItem): void {
    if (!props.multiple) {
      selectValue.value = option.value;
      return;
    }

    if (!isArray(selectValue.value)) {
      selectValue.value = [];
    }

    if (selectValue.value.includes(option.value)) {
      selectValue.value = selectValue.value.filter(item => item !== option.value);
    } else {
      selectValue.value = [...selectValue.value, option.value];
    }
  }

  /** 处理点击确认 */
  function onClickConfirm() {
    if (!props.multiple) {
      if (!selectValue.value) {
        return;
      }

      if (selectValue.value !== props.value) {
        emit('input', selectValue.value);
        closeOption();
      } else {
        closeOption();
      }
    }

    if (props.multiple) {
      if (!isArray(selectValue.value)) {
        selectValue.value = [];
      }

      emit('input', selectValue.value);
      closeOption();
    }
  }

  /** 是否已选中 */
  function isSelectedOption(value: SelectValueType): boolean {
    if (props.multiple && isArray<SelectValueType[]>(selectValue.value)) {
      return selectValue.value.includes(value);
    }
    if (!props.multiple) {
      return value === selectValue.value;
    }
    return false;
  }

  return {
    optionVisible,
    openOption,
    closeOption,
    onClickOption,
    onClickConfirm,
    isSelectedOption,
  };
};
