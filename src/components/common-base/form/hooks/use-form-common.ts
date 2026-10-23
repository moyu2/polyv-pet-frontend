import { PropUtils, VueProps } from '@polyv/vue-components';
import { computed, unref } from 'vue';
import { FormSize, FormTheme } from '../types/enums';
import { useFormItemInject } from './use-form-item';
import { useFormWrapPropsInject } from './use-form';

export const formCommonProps = () => ({
  /** 尺寸 */
  size: PropUtils.enum<FormSize>(),
  /** 主题 */
  theme: PropUtils.enum<FormTheme>(),
  /** 是否进行表单验证 */
  validateForm: PropUtils.bool.def(true),
});

export const useFormCommon = (options: {
  props: VueProps<typeof formCommonProps>;
  classPrefix: string;
}) => {
  const { props, classPrefix } = options;
  const formProps = useFormWrapPropsInject();

  /** 表单组件公用 className */
  const commonClassNames = computed(() => {
    const list = [];

    // 尺寸
    const sizeVal = props.size;
    if (sizeVal && sizeVal !== FormSize.Default) {
      list.push(`${classPrefix}--size-${sizeVal}`);
    }

    // 主题
    const themeVal = props.theme || formProps?.theme;
    if (unref(themeVal)) {
      list.push(`${classPrefix}--theme-${themeVal}`);
    }

    return list;
  });

  const formTheme = computed(() => {
    return props.theme || formProps?.theme;
  });

  return {
    commonClassNames,
    formTheme,
  };
};

/** 表单组件下的验证状态 hook */
export const useFormCommonValidate = (options: { props: VueProps<typeof formCommonProps> }) => {
  const { props } = options;
  const formItemContext = useFormItemInject();

  /** 验证当前的表单节点 */
  async function validateCurrentFormItem() {
    await formItemContext?.validateFormItem();
  }

  /** 在失焦时进行表单节点验证 */
  async function blurToValidateItem() {
    if (!props.validateForm) {
      return;
    }

    try {
      await validateCurrentFormItem();
    } catch (error) {
      console.error('blur-validate', (error as Error).message);
    }
  }

  /** 在聚焦时移除表单节点异常提示 */
  function focusToRemoveError() {
    if (!props.validateForm) {
      return;
    }

    formItemContext?.removeErrorMessage();
  }

  /** 表单节点是否处于异常 */
  const formItemIsError = computed(() => {
    if (!props.validateForm || !formItemContext) {
      return false;
    }

    return unref(formItemContext.formItemIsError);
  });

  return {
    validateCurrentFormItem,
    blurToValidateItem,
    focusToRemoveError,
    formItemIsError,
  };
};
