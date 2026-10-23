import { emitFunc, updateModelEmit, VueEmit, PropUtils, VueProps } from '@polyv/vue-components';
import { computed, unref } from 'vue';

export const formCheckboxProps = () => ({
  /** 使用圆形样式 */
  circle: PropUtils.bool.def(false),
  /** 是否选中，支持.sync */
  checked: PropUtils.bool.def(false),
});

export const formCheckboxEmits = () => ({
  ...updateModelEmit<'checked', boolean>('checked'),
  change: emitFunc<boolean>(),
});

export const useFormCheckbox = (options: {
  props: VueProps<typeof formCheckboxProps>;
  emit: VueEmit<typeof formCheckboxEmits>;
}) => {
  const { props, emit } = options;

  /** 是否已选中 */
  const isChecked = computed(() => props.checked);

  /** 处理点击复选框 */
  function onClickCheckbox(): void {
    emit('update:checked', !unref(isChecked));
    emit('change', !unref(isChecked));
  }

  return {
    isChecked,
    onClickCheckbox,
  };
};
