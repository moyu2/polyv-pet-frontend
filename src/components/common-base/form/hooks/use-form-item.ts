import { isMobile } from '@/assets/utils/browser';
import { formatStyleSize } from '@/assets/utils/dom';
import { PropUtils, VueProps } from '@polyv/vue-components';
import Schema from '@/plugins/async-validator';
import { computed, inject, InjectionKey, provide, ref, unref, watchEffect } from 'vue';
import {
  FormItemInstance,
  formItemLabelModels,
  FormItemLabelModel,
  FormValidateOptions,
} from '../types/form-types';
import { useFormWrapPropsInject } from './use-form';

export const formItemProps = () => ({
  /** 该节点属于表单数据中的哪个字段 */
  formField: PropUtils.looseString,
  /** 节点标签 */
  label: PropUtils.looseString,
  /** 表单标题宽度 */
  labelWidth: PropUtils.looseNumber,
  /** 表单标题高度 */
  labelHeight: PropUtils.looseNumber,
  /** 表单输入框内容宽度 */
  contentWidth: PropUtils.looseNumber,
  /** 是否显示异常信息 */
  showErrorMessage: PropUtils.bool.def(true),
  /** 节点异常信息 */
  errorMessage: PropUtils.looseString,
  /** label 模式 */
  labelModel: PropUtils.oneOf(formItemLabelModels),
  /** 是否显示必填星号 */
  required: PropUtils.bool.def(false),
  /** 提示 */
  tips: PropUtils.looseString,
});

/** <form-item> 组件名 */
export const FORM_ITEM_COMPONENT_NAME = 'form-item';

/**
 * 判断 vue 实例是否为 <form-item>
 * @param instance 实例
 */
export const isFormItemInstance = (instance: unknown): instance is FormItemInstance => {
  const _instance = instance as Partial<FormItemInstance> | undefined;
  return _instance?.isFormItem ?? false;
};

export const FORM_ITEM_PROVIDE_KEY: InjectionKey<FormItemInstance> =
  Symbol('FORM_ITEM_PROVIDE_KEY');

export const useFormItemInject = (): FormItemInstance | undefined => {
  return inject(FORM_ITEM_PROVIDE_KEY, undefined);
};

export const useFormItem = (options: { props: VueProps<typeof formItemProps> }) => {
  const { props } = options;

  const required = computed(() => props.required);

  const formProps = useFormWrapPropsInject();

  const labelText = computed(() => props.label);

  const labelModel = computed<FormItemLabelModel>(
    () => props.labelModel ?? formProps?.labelModel ?? 'inline',
  );

  /** 节点标签样式 */
  const labelStyle = computed(() => {
    if (unref(labelModel) === 'header') {
      return {};
    }

    const width = props.labelWidth ?? formProps?.labelWidth;
    const height = props.labelHeight ?? formProps?.labelHeight;

    return {
      width: formatStyleSize(width),
      height: formatStyleSize(height),
    };
  });

  /** 节点内容宽度样式 */
  const contentWidthStyle = computed(() => {
    const width = props.contentWidth ?? formProps?.contentWidth;

    return formatStyleSize(width);
  });

  const footerStyle = computed(() => {
    if (unref(labelModel) === 'header') {
      return {};
    }

    const width = props.labelWidth ?? formProps?.labelWidth;
    return {
      paddingLeft: formatStyleSize(width),
    };
  });

  /** 节点异常提示 */
  const itemErrorMessage = ref<string>();
  /** 当前表单节点是否异常 */
  const formItemIsError = computed(() => typeof unref(itemErrorMessage) !== 'undefined');

  watchEffect(() => {
    if (props.errorMessage) {
      setErrorMessage(props.errorMessage);
    } else {
      itemErrorMessage.value = undefined;
    }
  });

  /** 设置异常提示 */
  function setErrorMessage(message: string | undefined): void {
    if (message && !props.showErrorMessage) return;

    itemErrorMessage.value = message;
  }

  /** 移除异常提示 */
  function removeErrorMessage() {
    itemErrorMessage.value = undefined;
  }

  /** 验证当前表单节点 */
  function validateFormItem(validateOptions: FormValidateOptions = {}): Promise<void> {
    const showErrorMessage = validateOptions.showErrorMessage ?? true;

    // 当前节点验证的字段名
    const validateField = props.formField;
    const formDataVal = formProps?.formData;
    const formRulesVal = formProps?.formRules;

    /**
     * 没有传验证字段
     * <form-wrap> 中没有 formData
     * 以上条件满足其一则不进行验证，默认通过验证
     */
    if (!validateField || !formDataVal || !formRulesVal || !formRulesVal[validateField]) {
      return Promise.resolve();
    }

    // 创建验证对象
    const descriptor = {
      [validateField]: formRulesVal[validateField],
    };
    const validateVal = {
      [validateField]: formDataVal[validateField],
    };
    const validator = new Schema(descriptor);

    // 执行验证
    let message: string | undefined;
    validator.validate(validateVal, errors => {
      if (errors && errors.length) {
        message = errors[0].message;
      }
    });

    // 验证失败则提示
    if (showErrorMessage && props.showErrorMessage) {
      setErrorMessage(message);
    }

    return new Promise((resolve, reject) => {
      if (typeof message === 'undefined') {
        resolve();
      } else {
        reject(new Error(message));
      }
    });
  }

  // expose 导出对象
  const formItemInstance: FormItemInstance = {
    isFormItem: true,
    formItemIsError,
    setErrorMessage,
    removeErrorMessage,
    validateFormItem,
  };

  // 向下注入
  provide(FORM_ITEM_PROVIDE_KEY, formItemInstance);

  return {
    required,
    labelText,
    labelModel,
    labelStyle,
    contentWidthStyle,
    footerStyle,
    itemErrorMessage,
    formItemIsError,
    removeErrorMessage,
    validateFormItem,
    formItemInstance,
    isMobile,
  };
};
