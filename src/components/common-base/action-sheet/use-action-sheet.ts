import { PropUtils, VueEmit, VueProps, emitFunc, updateModelEmit } from '@polyv/vue-components';
import { ref, watch } from 'vue';
import { PopupInstance } from '@/components/common-base/popup/types';
import { popupEmits, popupProps } from '@/components/common-base/popup/use-popup';
import { ActionSheetItem, ActionSheetValue } from './types';

export const actionSheetProps = () => ({
  ...popupProps(),
  /** 操作选项列表 */
  actions: PropUtils.array<ActionSheetItem>(),
  /** 当前选择的操作，支持.sync */
  actionValue: PropUtils.oneOfType<ActionSheetValue>([String, Number]).def(''),
  /** 点击选项后是否自动关闭，默认：true */
  closeOnAction: PropUtils.bool.def(true),
  /** 是否显示取消，默认：true */
  showCancel: PropUtils.bool.def(false),
});

export const actionSheetEmits = () => ({
  ...popupEmits(),
  ...updateModelEmit<'actionValue', ActionSheetValue>('actionValue'),
  /** 点击选项 */
  'click-action': emitFunc<ActionSheetValue>(),
});

export const useActionSheet = (options: {
  props: VueProps<typeof actionSheetProps>;
  emit: VueEmit<typeof actionSheetEmits>;
}) => {
  const { props, emit } = options;

  const actionVisible = ref(false);

  watch(
    () => props.visible,
    () => {
      actionVisible.value = props.visible;
    },
  );

  watch(
    () => actionVisible.value,
    () => {
      if (actionVisible.value === props.visible) return;
      emit('update:visible', actionVisible.value);
    },
  );

  const popupRef = ref<PopupInstance>();

  /** 处理点击选项 */
  function onClickOption(option: ActionSheetItem) {
    if (option.disabled) {
      return;
    }

    if (props.actionValue !== option.value) {
      emit('update:actionValue', option.value);
    }

    if (props.closeOnAction && popupRef.value) {
      popupRef.value.closePopup();
    }

    emit('click-action', option.value);
  }

  /** 处理点击取消 */
  function onClickCancel() {
    if (popupRef.value) {
      popupRef.value.closePopup();
    }
  }

  return {
    actionVisible,
    popupRef,
    onClickOption,
    onClickCancel,
  };
};
