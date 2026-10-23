import { ref, computed, watch, ComputedRef, unref, onBeforeMount } from 'vue';
import { PropUtils, VueProps, emitFunc, updateModelEmit, VueEmit } from '@polyv/vue-components';
import type { AreaPickerComponent } from '@/plugins/polyv-ui/types';
import { getSelectData, isSelectFinish } from '@/plugins/polyv-ui/area-utils';
import { useCommonStore } from '@/store/use-common-store';

export const areaPickerProps = () => ({
  visible: PropUtils.bool,
  areaInfo: PropUtils.array<string>(),
});

export const areaPickerEmit = () => ({
  ...updateModelEmit<'visible', boolean>('visible'),
  ...updateModelEmit<'areaInfo', string[]>('areaInfo'),
  change: emitFunc<string[]>(),
});

export interface AreaPickerInstance {
  /** 是否已选择完成 */
  isFinish: ComputedRef<boolean>;
}

export function useAreaPicker(options: {
  AreaPicker: AreaPickerComponent;
  props: VueProps<typeof areaPickerProps>;
  emit: VueEmit<typeof areaPickerEmit>;
}) {
  const { emit, props, AreaPicker } = options;
  const commonStore = useCommonStore();
  /** 内部值 */
  const innerValue = ref<string[]>([]);
  const refreshKey = ref(1);

  watch(props.areaInfo, newVal => {
    innerValue.value = [...newVal];
  });

  /** 检测是否选择完毕 */
  const isFinish = computed<boolean>(() => {
    return isSelectFinish(innerValue.value, commonStore.areaData);
  });

  const instance: AreaPickerInstance = {
    isFinish,
  };

  /** 关闭弹窗 */
  function closePicker() {
    // remark 需要修复polyv 组件库
    // innerValue.value = [...props.areaInfo];
    emit('update:visible', false);
  }

  function onClickConfirm() {
    if (!unref(isFinish)) return;

    let data: string[] = [];
    if (isFinish.value) {
      data = getSelectData(innerValue.value, commonStore.areaData).map(item => item.name);
    }
    emit('update:areaInfo', data);
    emit('change', data);
    emit('update:visible', false);
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
    isFinish,
    instance,
    closePicker,
    innerValue,
    refreshKey,
    onClickConfirm,
  };
}
