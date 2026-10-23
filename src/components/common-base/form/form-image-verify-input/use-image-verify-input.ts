import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { PropUtils, VueProps, emitFunc, updateModelEmit, VueEmit } from '@polyv/vue-components';
import { computed, onMounted, ref, watch } from 'vue';
import { InputValueType } from '../form-input/hooks/use-form-input';
import { ImageVerifyInputInstance } from './type';

export const formImageVerifyInputProps = () => ({
  // 验证码绑定值
  value: PropUtils.string.def(''),
  // 图片 id，支持 .sync
  imageId: PropUtils.string.def(''),
});

export const formImageVerifyInputEmits = () => ({
  ...updateModelEmit<'imageId', string>('imageId'),
  input: emitFunc<string>(),
});

export const useImageVerifyInput = (options: {
  props: VueProps<typeof formImageVerifyInputProps>;
  emit: VueEmit<typeof formImageVerifyInputEmits>;
}) => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const { props, emit } = options;

  const inputPlaceholder = computed(() => {
    return translate('form.placeholder.imageVerify');
  });

  /** 验证码图片地址 */
  const imageUrl = ref('');

  /** 刷新验证码图片 */
  async function refreshVerifyImage(resetVal = false) {
    const data = await watchCore.sms.generateImageVerifyCode();
    imageUrl.value = data.url;
    emit('update:imageId', data.imageId);

    if (resetVal) {
      emit('input', '');
    }
  }

  onMounted(() => {
    refreshVerifyImage();
  });

  watch(
    () => props.imageId,
    () => {
      if (props.imageId === '') {
        refreshVerifyImage();
      }
    },
  );

  /** 处理输入框输入 */
  function onInputChange(val: InputValueType): void {
    emit('input', `${val}`);
  }

  const instance: ImageVerifyInputInstance = {
    refreshVerifyImage,
  };

  return {
    inputPlaceholder,
    imageUrl,
    refreshVerifyImage,
    onInputChange,
    instance,
  };
};
