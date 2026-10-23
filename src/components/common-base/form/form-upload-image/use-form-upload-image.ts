import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { isMobile } from '@/assets/utils/browser';
import { PropUtils, useProps, VueProps, emitFunc, VueEmit } from '@polyv/vue-components';
import { useToastManager } from '@/hooks/components/use-toast';
import { computed, unref } from 'vue';

export const formUploadImageProps = () => ({
  /** 绑定值 */
  value: PropUtils.array<string>(),
  /** 最大上传数量 */
  maxCount: PropUtils.number.def(Infinity),
});

export const formUploadImageEmit = () => ({
  input: emitFunc<string[]>(),
});

export const useFormUploadImage = (options: {
  props: VueProps<typeof formUploadImageProps>;
  emit: VueEmit<typeof formUploadImageEmit>;
}) => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const { props, emit } = options;
  const { value, maxCount } = useProps(props);

  /** 处理点击上传 */
  async function onClickUpload() {
    try {
      if (unref(value).length >= unref(maxCount)) {
        return;
      }

      const watchCore = getWatchCore();
      const { imageUrl } = await watchCore.utils.uploadImage();
      const newVal = [...unref(value), imageUrl];
      emit('input', newVal);
    } catch (error) {
      toast.error(translate('watchCore.error.uploadImage'));
    }
  }

  /** 处理点击删除 */
  function onClickDelete(index: number) {
    const newVal = unref(value).filter((url, _index) => _index !== index);
    emit('input', newVal);
  }

  /** 数量提示 */
  const countTips = computed(() => {
    if (props.maxCount === 1 || props.maxCount === Infinity) {
      return '';
    }
    const surplusCount = props.maxCount - props.value.length;
    if (surplusCount === 0) {
      return '';
    }
    return `(${translate('form.uploadImage.prefixTips')}${surplusCount}${translate(
      'form.uploadImage.suffixTips',
    )})`;
  });

  return {
    value,
    maxCount,
    onClickUpload,
    onClickDelete,
    countTips,
    isMobile,
  };
};
