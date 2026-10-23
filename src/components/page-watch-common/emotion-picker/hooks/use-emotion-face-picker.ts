import { useGlobalInject } from '@/app/use-global-inject';
import { emitFunc, VueEmit } from '@polyv/vue-components';
import { onMounted, ref, unref } from 'vue';

export const emotionFacePickerEmits = () => ({
  /** 点击表情 */
  'click-face': emitFunc<string>(),
});

/**
 * face 表情选取 hook
 */
export const useEmotionFacePicker = (options: { emit: VueEmit<typeof emotionFacePickerEmits> }) => {
  const { getWatchCore } = useGlobalInject();

  const { emit } = options;

  /** 容器节点 */
  const containerRef = ref<HTMLDivElement>();

  /** 处理点击容器 */
  function onClickContainer(event: Event) {
    const watchCore = getWatchCore();

    const title = watchCore.emotion.getEmotionFaceClickTarget(event);
    if (!title) {
      return;
    }

    emit('click-face', `[${title}]`);
  }

  /** 加载表情节点 */
  onMounted(() => {
    const watchCore = getWatchCore();
    const containerElem = unref(containerRef);
    if (containerElem) {
      containerElem.appendChild(watchCore.emotion.getEmotionFaceDomList());
    }
  });

  return {
    containerRef,
    onClickContainer,
  };
};
