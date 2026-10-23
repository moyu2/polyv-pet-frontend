import { PropUtils, VueProps, emitFunc, VueEmit } from '@polyv/vue-components';

export interface SimpleTabItem {
  /** 文本 */
  label: string;
  /** 绑定值 */
  value: string;
}

export const simpleTabsProps = () => ({
  /** 是否显示边框 */
  border: PropUtils.bool.def(true),
  /** 绑定值，支持 v-model */
  value: PropUtils.string.def(''),
  /** tab 列表 */
  tabs: PropUtils.array<SimpleTabItem>().def([]),
});

export const simpleTabsEmits = () => ({
  input: emitFunc<string>(),
  'tab-click': emitFunc<string>(),
});

export const useSimpleTabs = (options: {
  props: VueProps<typeof simpleTabsProps>;
  emit: VueEmit<typeof simpleTabsEmits>;
}) => {
  const { props, emit } = options;

  function onClickTab(value: string) {
    if (value !== props.value) {
      emit('input', value);
    }
    emit('tab-click', value);
  }

  return {
    onClickTab,
  };
};
