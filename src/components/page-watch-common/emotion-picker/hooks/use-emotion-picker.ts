import { PropUtils, VueProps, emitFunc, VueEmit } from '@polyv/vue-components';
import { onBeforeMount, ref } from 'vue';
import { EmotionImageData } from '@polyv/live-watch-sdk';

/**
 * 表情选择类型，face-普通表情，image-图片表情
 */
export type EmotionPickerType = 'face' | 'image';

export const emotionPickerProps = () => ({
  /** 黄脸表情开关 */
  faceEmotionEnabled: PropUtils.bool.def(true),
  /** 图片表情开关 */
  imageEmotionEnabled: PropUtils.bool.def(true),
  /** 点击 face 表情后关闭，默认：true */
  clickFaceToClose: PropUtils.bool.def(true),
});

export const emotionPickerEmits = () => ({
  /** 点击表情 */
  'click-face': emitFunc<string>(),
  /** 点击表情 */
  'click-image': emitFunc<EmotionImageData>(),
  /** 点击删除（仅移动端） */
  'click-delete': emitFunc<void>(),
  /** 点击发送（仅移动端） */
  'click-send': emitFunc<void>(),
  /** 关闭 */
  close: emitFunc<void>(),
});

export const useEmotionPicker = (options: {
  props: VueProps<typeof emotionPickerProps>;
  emit: VueEmit<typeof emotionPickerEmits>;
}) => {
  const { props, emit } = options;

  /** 当前面板类型 */
  const currentType = ref<EmotionPickerType>('face');

  /** 切换类型 */
  function switchEmotionTab(type: EmotionPickerType) {
    currentType.value = type;
  }

  /** 点击 face 表情 */
  function onClickFace(title: string) {
    emit('click-face', title);
    if (props.clickFaceToClose) {
      emit('close');
    }
  }

  /** 点击图片表情 */
  function onClickImage(data: EmotionImageData) {
    emit('click-image', data);
    emit('close');
  }

  /** 点击删除按钮 */
  function onClickDelete() {
    emit('click-delete');
  }

  /** 点击发送按钮 */
  function onClickSend() {
    emit('click-send');
  }

  function initCurrentPanelTypeByProps() {
    if (props.imageEmotionEnabled && !props.faceEmotionEnabled) {
      currentType.value = 'image';
    }
  }

  onBeforeMount(() => {
    initCurrentPanelTypeByProps();
  });

  return {
    currentType,
    switchEmotionTab,
    onClickFace,
    onClickImage,
    onClickDelete,
    onClickSend,
  };
};
