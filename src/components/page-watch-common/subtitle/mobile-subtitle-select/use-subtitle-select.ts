import { PropUtils, VueProps, emitFunc, VueEmit } from '@polyv/vue-components';
import { TreeSelectDataValue } from '@/components/common-base/tree-select/tree-select-types';
import { computed, ref } from 'vue';

export interface SubtitleSelectOptionItem {
  label: string;
  value: string;
  children?: SubtitleSelectOptionItem[];
}

export const subtitleSelectProps = () => ({
  /** 绑定值 */
  value: PropUtils.oneOfType<unknown[]>([]).def([]),
  /** 选项列表 */
  options: PropUtils.array<SubtitleSelectOptionItem>(),
});

export const subtitleSelectEmits = () => ({
  input: emitFunc<TreeSelectDataValue[]>(),
});

export const useSubtitleSelect = (options: {
  props: VueProps<typeof subtitleSelectProps>;
  emit: VueEmit<typeof subtitleSelectEmits>;
}) => {
  const { props, emit } = options;

  /** 输入框的 value 值 */
  const inputValue = computed<string>(() => {
    const valText = '';

    if (props.value.length) {
      let _nextOption: SubtitleSelectOptionItem | undefined;
      let _text = '';
      for (let index = 0; index < props.value.length; index++) {
        const _value = props.value[index];
        if (!_nextOption) {
          _nextOption = props.options.find(i => i.value === _value);
          _text = _nextOption?.label || '';
        } else {
          _nextOption = _nextOption.children?.find(i => i.value === _value);
          _text += '/' + _nextOption?.label;
        }
      }

      return _text;
    }

    return valText;
  });

  /** 选项列表 */
  const optionList = computed<SubtitleSelectOptionItem[]>(() => {
    return props.options;
  });

  const innerValue = ref<TreeSelectDataValue[]>([]);

  /** 选项是否显示 */
  const optionVisible = ref(false);

  /** 打开选项 */
  function openOption() {
    innerValue.value = props.value as TreeSelectDataValue[];
    optionVisible.value = true;
  }

  /** 关闭选项 */
  function closeOption() {
    optionVisible.value = false;
  }

  function onOptionSelectFinish() {
    emit('input', innerValue.value);
    closeOption();
  }

  return {
    inputValue,

    innerValue,
    optionList,
    optionVisible,
    openOption,
    closeOption,
    onOptionSelectFinish,
  };
};
