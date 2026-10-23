import { computed, ref, unref, watch } from 'vue';
import { useLangStore } from '@/store/use-lang-store';
import { AutoTextareaInstance } from './auto-textarea/use-auto-textarea';
import {
  PlvInputContent,
  PlvInputContentText,
  PlvInputImagePasteInstance,
} from '@/plugins/polyv-ui/types';
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useMobileInput } from '@/hooks/behaviors/use-mobile-input';

/**
 * @hook 对消息输入框的封装，统一提供给到组件外部使用的的方法
 * @desc 内部优先级: imagePasteInputRef > autoTextareaRef > inputElemRef
 */
export const useMsgInputController = () => {
  const { getEmitter, getWatchCore } = useGlobalInject();
  const mobileInput = useMobileInput();

  const watchCore = getWatchCore();

  /** 图片粘贴输入框组件实例 */
  const imagePasteInputRef = ref<PlvInputImagePasteInstance>();

  /** 文本输入框组件实例 */
  const autoTextareaRef = ref<AutoTextareaInstance>();
  /** 文本输入框组件绑定值 */
  const autoTextareaInputValue = ref('');

  /** HTML 输入框 */
  const inputElemRef = ref<HTMLInputElement>();
  /** HTML 输入框绑定值 */
  const inputElmValue = ref('');

  /** 当前输入框是否聚焦 */
  const isInputFocus = ref(false);

  const langStore = useLangStore();
  watch(
    () => langStore.currentLang,
    () => {
      if (imagePasteInputRef.value) {
        // 因组件库没有提供覆盖内容的方法，只能先覆盖 innerHTML 去实现
        const editor = imagePasteInputRef.value.$el.firstElementChild;
        if (editor) {
          editor.innerHTML = watchCore.emotion.translateEmotions(editor.innerHTML);
        }
        return;
      }

      if (autoTextareaRef.value) {
        autoTextareaInputValue.value = watchCore.emotion.translateEmotions(
          autoTextareaInputValue.value,
        );
        return;
      }

      if (inputElemRef.value) {
        inputElmValue.value = watchCore.emotion.translateEmotions(inputElmValue.value);
      }
    },
  );

  function onInputFocus() {
    isInputFocus.value = true;
    getEmitter().emit(appEvents.global.MsgInputFocus);

    mobileInput.onInputFocus();
  }

  function onInputBlur() {
    /**
     * 这里延迟 1 毫秒的原因是如果在输入框没有输入内容时，点击表情，
     * 输入框因为长度缩短导致触点无法达到表情入口处，进而无法打开表情
     */
    setTimeout(() => {
      isInputFocus.value = false;
      mobileInput.onInputBlur();
    }, 1);
  }

  /** 聚焦输入框 */
  function focusInput() {
    if (imagePasteInputRef.value) {
      imagePasteInputRef.value.focus();
      return;
    }

    if (autoTextareaRef.value) {
      autoTextareaRef.value.focusTextarea();
      return;
    }

    if (inputElemRef.value) {
      inputElemRef.value.focus();
    }
  }

  /** 当前图片粘贴输入框文本长度 */
  const curImagePasteInputTextLength = ref(0);

  /** 最多支持输入的文本长度 */
  const maxInputTextLength = 200;

  /** 当前输入文本长度 */
  const curInputTextLength = computed(() => {
    if (imagePasteInputRef.value) {
      return curImagePasteInputTextLength.value;
    }

    if (autoTextareaRef.value) {
      return unref(autoTextareaInputValue).length;
    }

    if (inputElemRef.value) {
      return unref(inputElmValue).length;
    }

    return 0;
  });

  /** 图片粘贴输入框内容区域是否为空 */
  const isEmptyImagePasteInput = ref(true);

  /** 监听图片粘贴输入框输入变更 */
  function onImagePasteInputChange(contents: PlvInputContent[]) {
    isEmptyImagePasteInput.value = contents.every(item => {
      return item.type === 'text' ? !item.content.trim() : false;
    });
    curImagePasteInputTextLength.value = (
      contents.filter(i => i.type === 'text') as PlvInputContentText[]
    ).reduce((accu, cur) => {
      if (!accu) {
        accu = cur.content.length;
      } else {
        accu += cur.content.length;
      }
      return accu;
    }, 0);
  }

  /** 输入框内容是否为空 */
  const isEmptyInputContent = computed(() => {
    if (imagePasteInputRef.value) {
      return unref(isEmptyImagePasteInput);
    }

    if (autoTextareaRef.value) {
      return !unref(autoTextareaInputValue).trim();
    }

    if (inputElemRef.value) {
      return !unref(inputElmValue).trim();
    }

    return true;
  });

  /** 删除单个字符 */
  function deleteWord() {
    if (imagePasteInputRef.value) {
      console.warn('暂不支持 deleteWord');
      return;
    }

    if (autoTextareaRef.value) {
      autoTextareaRef.value.deleteWord();
      return;
    }

    if (unref(inputElemRef)) {
      const length = unref(inputElmValue.value).length;
      const newValue = unref(inputElmValue).substr(0, length - 1);
      inputElmValue.value = newValue;
    }
  }

  /** 清除输入框内容 */
  function clearInput() {
    if (imagePasteInputRef.value) {
      isEmptyImagePasteInput.value = true;
      imagePasteInputRef.value.clear();
      return;
    }

    if (autoTextareaRef.value) {
      autoTextareaInputValue.value = '';
      return;
    }

    if (unref(inputElemRef)) {
      inputElmValue.value = '';
    }
  }

  /** 插入表情 */
  function insertEmotion(title: string) {
    if (imagePasteInputRef.value) {
      // 插入后会自动聚焦
      imagePasteInputRef.value.insertEmotion(title);
      return;
    }

    if (autoTextareaRef.value) {
      const newValue = (unref(autoTextareaInputValue) + title).slice(0, maxInputTextLength);
      autoTextareaInputValue.value = newValue;
      return;
    }

    if (inputElemRef.value) {
      const newValue = (unref(inputElmValue) + title).slice(0, maxInputTextLength);
      inputElmValue.value = newValue;
    }
  }

  /** 获取输入框内容 */
  function getInputContentList(): PlvInputContent[] {
    if (imagePasteInputRef.value) {
      return imagePasteInputRef.value.getContentList();
    }

    if (autoTextareaRef.value) {
      return autoTextareaRef.value.getContentList();
    }

    if (inputElemRef.value) {
      return [
        {
          type: 'text',
          content: inputElmValue.value,
        },
      ];
    }

    return [];
  }

  return {
    imagePasteInputRef,
    autoTextareaRef,
    inputElemRef,

    autoTextareaInputValue,
    inputElmValue,

    isInputFocus,
    focusInput,
    onInputFocus,
    onInputBlur,

    curInputTextLength,
    maxInputTextLength,
    isEmptyInputContent,
    onImagePasteInputChange,

    clearInput,
    deleteWord,
    insertEmotion,
    getInputContentList,
  };
};
