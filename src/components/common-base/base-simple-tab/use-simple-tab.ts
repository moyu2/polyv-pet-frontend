import { PropUtils, VueProps, emitFunc, VueEmit } from '@polyv/vue-components';

export type SimpleTabItemValue = string | number;

export interface SimpleTabItem<T extends SimpleTabItemValue = SimpleTabItemValue> {
  /** 文本 */
  label: string;
  /** 绑定值 */
  value: T;
}

export const simpleTabsProps = () => ({
  /** 是否显示边框 */
  border: PropUtils.bool.def(true),
  /** 绑定值，支持 v-model */
  value: PropUtils.oneOfType<SimpleTabItemValue>([]).isRequired,
  /** tab 列表 */
  tabs: PropUtils.array<SimpleTabItem>().def([]),
});

export const simpleTabsEmits = () => ({
  input: emitFunc<SimpleTabItemValue>(),
  'tab-click': emitFunc<SimpleTabItemValue>(),
});

export const useSimpleTabs = (options: {
  props: VueProps<typeof simpleTabsProps>;
  emit: VueEmit<typeof simpleTabsEmits>;
}) => {
  const { props, emit } = options;

  function onClickTab(value: SimpleTabItemValue) {
    if (value !== props.value) {
      emit('input', value);
    }
    emit('tab-click', value);
  }

  return {
    onClickTab,
  };
};
