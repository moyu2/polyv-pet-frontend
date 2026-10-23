import { PropUtils, VueProps, emitFunc, VueEmit } from '@polyv/vue-components';
import { usePanelVisible } from '@/hooks/behaviors/use-panel-visible';
import { CSSProperties, computed, ref, unref, watch } from 'vue';
import { PlvInputContent } from '@/plugins/polyv-ui/types';
import { useMsgInputController } from './use-msg-input-controller';
import { translate } from '@/assets/lang';
import { useGlobalInject } from '@/app/use-global-inject';
import { WatchSdkLangEnum } from '@polyv/live-watch-sdk';

export const msgInputWrapProps = () => ({
  /** 占位符 */
  placeholder: PropUtils.string,
  /** 输入框样式 */
  inputStyle: PropUtils.object<CSSProperties>().def({}),
  /** 是否禁用输入框 */
  disabledInput: PropUtils.bool.def(false),
  /** 是否禁用发送按钮 */
  disabledSubmitBtn: PropUtils.bool.def(false),
  /** 是否禁用表情选择 */
  disabledEmotionPicker: PropUtils.bool.def(false),
  /** 是否显示黄脸表情 */
  faceEmotionEnabled: PropUtils.bool.def(true),
  /** 是否显示图片表情 */
  imageEmotionEnabled: PropUtils.bool.def(true),
  /** 是否显示图片发送(仅 PC) */
  sendImageEnabled: PropUtils.bool.def(true),
  /** 是否禁用图片发送(仅 PC) */
  disabledSendImage: PropUtils.bool.def(false),
  /** 是否使用图片粘贴输入框(仅 PC) */
  imagePasteInputEnabled: PropUtils.bool.def(false),
});

export const msgInputWrapEmits = () => ({
  input: emitFunc<string>(),
  /** 提交事件 */
  submit: emitFunc<{ contentList: PlvInputContent[] }>(),
  /** 发送系统消息 */
  'system-msg': emitFunc<{ content: string }>(),
  /** 点击发送图片 */
  'click-send-image': emitFunc<void>(),
  /** 点击表情 */
  'click-image-emotion': emitFunc<void>(),
  /** 点击表情入口 */
  'click-image-emotion-enter': emitFunc<void>(),
  /** 点击输入框 */
  'click-input-wrap': emitFunc<void>(),
});

export interface MsgInputWrapInstance {
  /** 聚焦输入框 */
  focusInput(): void;
  /** 清除输入框 */
  clearInput(): void;
  /** 获取输入内容 */
  getInputContentList(): PlvInputContent[];
  /** 重置状态 */
  resetStatus(): void;
}

/**
 * @hook 消息输入框包装层
 */
export const useMsgInputWrap = (options: {
  /** 点击表情后是否聚焦输入框，默认：true */
  clickFaceToFocus?: boolean;
  props: VueProps<typeof msgInputWrapProps>;
  emit: VueEmit<typeof msgInputWrapEmits>;
}) => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  /** 消息输入框控制器 */
  const msgInputController = useMsgInputController();

  const { props, emit, clickFaceToFocus = false } = options;

  // 监听是否禁用输入框
  watch(
    () => props.disabledInput,
    () => {
      if (props.disabledInput) {
        msgInputController.clearInput();
      }
    },
  );

  /** 是否显示字数统计 */
  const wordLimitVisible = ref(false);

  /** 监听输入框溢出事件 */
  function onInputWidgetOverflow(isOverflow: boolean) {
    wordLimitVisible.value = isOverflow;
  }

  /** 表情选择按钮是否展示 */
  const emotionPickerBtnVisible = computed(() => {
    return props.faceEmotionEnabled || props.imageEmotionEnabled;
  });

  /** 表情面板节点 */
  const emotionRef = ref<HTMLDivElement>();

  /** 表情面板显示 */
  const {
    visible: emotionVisible,
    togglePanel: toggleEmotionPanel,
    hidePanel: hideEmotionPanel,
  } = usePanelVisible([emotionRef, '[data-emotion-picker-btn]']);

  /** 处理点击表情面板开关 */
  function onClickEmotionPickerBtn() {
    emit('click-image-emotion-enter');

    if (props.disabledEmotionPicker) {
      return;
    }

    toggleEmotionPanel();
  }

  /** 处理点击 face 表情 */
  function onClickFace(title: string) {
    msgInputController.insertEmotion(title);

    if (clickFaceToFocus) {
      msgInputController.focusInput();
    }
  }

  /** 处理点击图片表情 */
  function onClickImageEmotion() {
    emit('click-image-emotion');
  }

  /** 处理点击图片发送 */
  function onClickSendImage() {
    if (props.disabledSendImage) {
      return;
    }
    emit('click-send-image');
  }

  /** 发送按钮是否禁用 */
  const sendBtnDisabled = computed(() => {
    return props.disabledSubmitBtn || msgInputController.isEmptyInputContent.value;
  });

  /** 上一次发言的时间戳 */
  let lastSendTime: number | undefined;

  /**
   * 输入框触发提交/发送按钮点击处理
   * @desc 提交后，由外部自行去重置输入框内容，清空组件状态
   * */
  function submitInput() {
    if (unref(sendBtnDisabled)) return;

    const now = Date.now();
    if (lastSendTime && now - lastSendTime < 1000) {
      emit('system-msg', {
        content: translate('chat.msg.fast'),
      });
      return;
    }
    lastSendTime = now;

    const contentList = msgInputController.getInputContentList();
    contentList.forEach(item => {
      if (item.type === 'text') {
        item.content = watchCore.emotion.translateEmotions(item.content, WatchSdkLangEnum.ZH_CN);
      }
    });

    emit('submit', { contentList });
  }

  /** 重置组件状态 */
  function resetStatus() {
    hideEmotionPanel();
  }

  /** 消息包装层组件实例 */
  const msgInputWrapInstance: MsgInputWrapInstance = {
    focusInput: msgInputController.focusInput,
    clearInput: msgInputController.clearInput,
    getInputContentList: msgInputController.getInputContentList,
    resetStatus,
  };

  return {
    ...msgInputController,
    msgInputWrapInstance,

    wordLimitVisible,
    onInputWidgetOverflow,

    emotionPickerBtnVisible,
    emotionRef,
    emotionVisible,
    toggleEmotionPanel,
    hideEmotionPanel,
    onClickEmotionPickerBtn,
    onClickFace,
    onClickImageEmotion,

    onClickSendImage,

    sendBtnDisabled,
    submitInput,
  };
};
