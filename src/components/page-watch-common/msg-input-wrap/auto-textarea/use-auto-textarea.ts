import { isDesktopIPad } from '@/assets/utils/browser';
import { useMobileInput } from '@/hooks/behaviors/use-mobile-input';
import { PlvInputContent } from '@/plugins/polyv-ui/types';
import {
  PropUtils,
  VueEmit,
  VueProps,
  emitFunc,
  updateModelEmit,
  useProps,
} from '@polyv/vue-components';
import { throttle } from 'lodash-es';
import {
  CSSProperties,
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  unref,
  watch,
} from 'vue';

export const autoTextareaProps = () => ({
  /** 绑定值 */
  value: PropUtils.string.def(''),
  /** 空占位文本 */
  placeholder: PropUtils.string,
  /** 最大长度 */
  maxlength: PropUtils.number.def(200),
  /** 行高，默认：1.6 */
  lineHeight: PropUtils.number.def(1.6),
  /** 字体大小，默认：14 */
  fontSize: PropUtils.number.def(14),
  /** 是否禁用 */
  disabled: PropUtils.bool.def(false),
  /** 是否文字溢出，.sync */
  isOverflow: PropUtils.bool.def(false),
  /** 输入框是否 2 行以上，.sync */
  isMultiRow: PropUtils.bool.def(false),
  /** 输入框样式 */
  inputStyle: PropUtils.object<CSSProperties>().def({}),
});

export const autoTextareaEmits = () => ({
  ...updateModelEmit<'isOverflow', boolean>('isOverflow'),
  ...updateModelEmit<'isMultiRow', boolean>('isMultiRow'),
  /** 绑定值更改 */
  input: emitFunc<string>(),
  /** 失焦事件 */
  blur: emitFunc<void>(),
  /** 聚焦事件 */
  focus: emitFunc<void>(),
  /** 回车事件 */
  enter: emitFunc<void>(),
  /** 提交事件 */
  submit: emitFunc<string>(),
});

export interface AutoTextareaInstance {
  /** 失焦输入框 */
  blurTextarea(): void;
  /** 聚焦输入框 */
  focusTextarea(): void;
  /** 删除一个字符 */
  deleteWord(): void;
  /** 清除输入框内容 */
  clearTextarea(): void;
  /** 获取内容列表 */
  getContentList(): PlvInputContent[];
}

export const useAutoTextarea = (options: {
  props: VueProps<typeof autoTextareaProps>;
  emit: VueEmit<typeof autoTextareaEmits>;
}) => {
  const { props, emit } = options;
  const { value, lineHeight, fontSize, placeholder } = useProps(props);

  const { onInputFocus, onInputBlur } = useMobileInput();

  const textareaRef = ref<HTMLTextAreaElement>();

  /** 是否聚焦中 */
  const isFocus = ref(false);

  /** 输入框原始高度 */
  const originHeight = ref(0);

  /** 当前高度 */
  const clientHeight = ref(0);

  /** 输入框是否多行显示 */
  const textAreaIsMultiRow = computed(() => {
    return clientHeight.value > originHeight.value;
  });

  const textareaPlaceholder = computed(() => {
    if (unref(isFocus)) {
      return '';
    }

    return unref(placeholder);
  });

  /** 输入框最大高度 */
  const textareaMaxHeight = computed(() => {
    const fontSizeVal = unref(fontSize);
    const lineHeightVal = unref(lineHeight);
    // 三行文字+两行间距的高度
    return fontSizeVal + fontSizeVal * lineHeightVal * 2;
  });

  /** 输入框真实 value */
  const realValue = computed(() => {
    return unref(value) || '';
  });

  /**
   * 自适应高度
   */
  async function resizeHeight(reset: boolean = false) {
    const textareaElem = unref(textareaRef);
    if (!textareaElem) return;

    textareaElem.style.height = 'auto';

    await nextTick();
    const scrollHeight = textareaElem.scrollHeight;
    const displayHeight = reset ? originHeight.value : scrollHeight;
    if (displayHeight) {
      textareaElem.style.height = `${displayHeight}px`;
    }

    clientHeight.value = textareaElem.clientHeight;

    if (textareaElem.scrollHeight > textareaElem.clientHeight + 2 && unref(value).length) {
      emit('update:isOverflow', true);
    } else {
      emit('update:isOverflow', false);
    }

    emit('update:isMultiRow', textAreaIsMultiRow.value);
  }

  const throttleRestHeight = throttle((reset: boolean) => resizeHeight(reset), 300);

  watch(
    () => unref(value),
    val => {
      if (!originHeight.value) {
        initHeightInfo();
      }

      throttleRestHeight(!val);
    },
  );

  function onBlur() {
    isFocus.value = false;
    emit('blur');
    onInputBlur();
  }

  function onFocus() {
    isFocus.value = true;
    emit('focus');
    onInputFocus();
  }

  function onInput() {
    if (props.disabled) {
      return;
    }
    const textareaElem = unref(textareaRef);
    if (!textareaElem) return;
    const newValue = textareaElem.value;
    emit('input', newValue);
  }

  function onEnter() {
    emit('enter');
  }

  function onSubmit() {
    emit('submit', props.value);
  }

  /**
   * 失焦输入框
   */
  function blurTextarea() {
    unref(textareaRef)?.blur();
  }

  /**
   * 聚焦输入框
   */
  function focusTextarea() {
    unref(textareaRef)?.focus();
  }

  /** 清除输入框内容 */
  function clearTextarea() {
    emit('input', '');
  }

  /**
   * 删除一个字符
   */
  function deleteWord() {
    const length = unref(props.value).length;
    const newValue = props.value.substr(0, length - 1);
    emit('input', newValue);
  }

  /**
   * 获取内容列表
   */
  function getContentList(): PlvInputContent[] {
    const textareaElem = unref(textareaRef);
    if (!textareaElem) return [];

    const newValue = textareaElem.value;
    return [
      {
        type: 'text',
        content: newValue,
      },
    ];
  }

  function onOrientationChange() {
    blurTextarea();
  }

  /**
   * 初始化高度信息，便于后续配置
   */
  function initHeightInfo() {
    if (!textareaRef.value) return;

    clientHeight.value = textareaRef.value.clientHeight;
    originHeight.value = textareaRef.value.clientHeight;
  }

  onMounted(() => {
    if (isDesktopIPad) {
      // 兼容ipad横竖屏切换，系统键盘遮挡观看页输入框的问题。
      // 这里监听屏幕方向改变的事件，用于系统横屏时使播放器满屏显示。
      window.addEventListener(
        'onorientationchange' in window ? 'orientationchange' : 'resize',
        onOrientationChange,
        false,
      );
    }

    setTimeout(() => {
      initHeightInfo();
    }, 0);
  });

  onBeforeUnmount(() => {
    if (isDesktopIPad) {
      window.removeEventListener(
        'onorientationchange' in window ? 'orientationchange' : 'resize',
        onOrientationChange,
        false,
      );
    }
  });

  const textareaInstance: AutoTextareaInstance = {
    blurTextarea,
    focusTextarea,
    deleteWord,
    clearTextarea,
    getContentList,
  };

  return {
    textareaPlaceholder,
    textareaRef,
    textareaMaxHeight,
    realValue,
    clientHeight,
    originHeight,
    textAreaIsMultiRow,
    onBlur,
    onFocus,
    onInput,
    onEnter,
    onSubmit,
    blurTextarea,
    focusTextarea,
    deleteWord,
    clearTextarea,
    getContentList,
    textareaInstance,
  };
};
