import { isMobile } from '@/assets/utils/browser';
import { PropUtils, VueProps, emitFunc, VueEmit } from '@polyv/vue-components';
import { getSelectData, isSelectFinish } from '@/plugins/polyv-ui/area-utils';
import type { AreaData, AreaPickerComponent } from '@/plugins/polyv-ui/types';
import { useCommonStore } from '@/store/use-common-store';
import { computed, ComputedRef, onBeforeMount, ref, unref, watch } from 'vue';
import { formCommonProps, useFormCommonValidate } from '../hooks/use-form-common';

export const formAreaPickerProps = () => ({
  ...formCommonProps(),
  /** 绑定值 */
  value: PropUtils.array<string>(),
  /** 占位文本 */
  placeholder: PropUtils.string,
});

export const formAreaPickerEmit = () => ({
  input: emitFunc<string[]>(),
});

export interface FormAreaPickerInstance {
  /** 是否已选择完成 */
  isFinish: ComputedRef<boolean>;
}

export const useFormAreaPicker = (options: {
  AreaPicker: AreaPickerComponent;
  props: VueProps<typeof formAreaPickerProps>;
  emit: VueEmit<typeof formAreaPickerEmit>;
}) => {
  const commonStore = useCommonStore();
  const { AreaPicker, props, emit } = options;

  const { formItemIsError, blurToValidateItem, focusToRemoveError } = useFormCommonValidate({
    props,
  });

  const innerValue = ref<string[]>([]);

  const inputPlaceholder = computed(() => props.placeholder);

  /** 是否已选择完成 */
  const isFinish = computed<boolean>(() => {
    return isSelectFinish(props.value, commonStore.areaData);
  });

  const innerIsFinish = computed<boolean>(() => {
    return isSelectFinish(innerValue.value, commonStore.areaData);
  });

  const inputValue = computed(() => {
    let data: AreaData[] = [];

    if (innerIsFinish.value) {
      data = getSelectData(innerValue.value, commonStore.areaData);
    } else if (isSelectFinish(props.value, commonStore.areaData)) {
      data = getSelectData(props.value, commonStore.areaData);
    }

    return data.map(item => item.name).join('/');
  });

  watch(
    () => unref(innerValue),
    () => {
      if (!isMobile) {
        emit('input', unref(innerValue));
      }
    },
  );

  const instance: FormAreaPickerInstance = {
    isFinish,
  };

  const pickerVisible = ref(false);

  const refreshKey = ref(1);

  function openPicker() {
    if (!isFinish.value) {
      refreshKey.value += 1;
    }
    pickerVisible.value = true;
    onShowPicker();
  }

  function closePicker() {
    pickerVisible.value = false;
    onHiddenPicker();
  }

  /** 处理隐藏弹层 */
  function onHiddenPicker() {
    if (!innerIsFinish.value) {
      innerValue.value = props.value;
    } else {
      emit('input', unref(innerValue));
    }
    blurToValidateItem();
  }

  /** 处理显示弹层 */
  function onShowPicker() {
    focusToRemoveError();
  }

  function onClickConfirm() {
    if (!unref(innerIsFinish)) {
      return;
    }
    emit('input', unref(innerValue));
    closePicker();
  }

  onBeforeMount(async () => {
    if (commonStore.areaData.length === 0) {
      const areaData = await AreaPicker.loadAreaDataUrl();
      commonStore.$patch({
        areaData,
      });
    }
  });

  return {
    innerValue,
    isFinish,
    innerIsFinish,
    instance,
    inputValue,
    inputPlaceholder,
    refreshKey,

    formItemIsError,
    blurToValidateItem,
    focusToRemoveError,

    pickerVisible,
    openPicker,
    closePicker,
    onHiddenPicker,
    onShowPicker,
    onClickConfirm,
  };
};
