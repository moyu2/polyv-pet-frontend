import { useVue } from '@/hooks/core/use-vue';
import { PropUtils, useProps, VueProps, emitFunc, VueEmit } from '@polyv/vue-components';
import { ValidatorRules } from '@/plugins/async-validator';
import { ComputedRef, inject, InjectionKey, provide, Ref, ref, unref } from 'vue';
import { FormTheme } from '../types/enums';
import { formItemLabelModels, FormValidateOptions } from '../types/form-types';
import { isFormItemInstance } from './use-form-item';

export const formWrapProps = () => ({
  /** 绑定的表单对象 */
  formData: PropUtils.object().def({}),
  /** 验证规则 */
  formRules: PropUtils.object<ValidatorRules>().def({}),
  /** 表单标题宽度 */
  labelWidth: PropUtils.number.def(170),
  /** 表单标题高度 */
  labelHeight: PropUtils.number.def(40),
  /** 表单输入框内容宽度 */
  contentWidth: PropUtils.looseNumber,
  /** 表单提交方法 */
  submitAction: PropUtils.func(),
  /** 表单主题，dark-黑暗 */
  theme: PropUtils.enum<FormTheme>().def(FormTheme.Gray),
  /** label 模式，默认：inline */
  labelModel: PropUtils.oneOf(formItemLabelModels).def('inline'),
  /** 是否开启 debug 打印，默认：false */
  debug: PropUtils.bool.def(false),
});

export const formWrapEmits = () => ({
  // 表单提交事件
  'submit-form': emitFunc<UniversalParams>(),
});

export type FormWrapProps = VueProps<typeof formWrapProps>;

/** <form-wrap> 注入类型 */
export interface FormWrapInjectData {
  /** 是否正在提交 */
  isSubmiting: Ref<boolean>;
  /** debug */
  debug: ComputedRef<boolean>;
  /** 验证当前表单 */
  validateCurrentForm(validateOptions?: FormValidateOptions): Promise<void>;
  /** 提交当前表单 */
  submitForm(validateOptions?: FormValidateOptions): Promise<void>;
}

export const FORM_WRAP_PROPS_PROVIDE_KEY: InjectionKey<FormWrapProps> = Symbol(
  'FORM_WRAP_PROPS_PROVIDE_KEY',
);

export const useFormWrapPropsInject = (): FormWrapProps | undefined => {
  return inject(FORM_WRAP_PROPS_PROVIDE_KEY);
};

export const FORM_WRAP_PROVIDE_KEY: InjectionKey<FormWrapInjectData> =
  Symbol('FORM_WRAP_PROVIDE_KEY');

export const useFormWrapInject = (): FormWrapInjectData | undefined => {
  return inject(FORM_WRAP_PROVIDE_KEY);
};

export const useFormWrap = (options: {
  props: VueProps<typeof formWrapProps>;
  emit: VueEmit<typeof formWrapEmits>;
}) => {
  const { props, emit } = options;

  const { formData, submitAction, debug } = useProps(props);
  const { getCurrentChildrens } = useVue();

  /** 表单是否正在提交 */
  const isSubmiting = ref(false);

  /** 验证当前表单 */
  async function validateCurrentForm(validateOptions: FormValidateOptions = {}): Promise<void> {
    const childrens = getCurrentChildrens();
    if (!childrens || childrens.length === 0) {
      return;
    }

    for (let i = 0; i < childrens.length; i++) {
      const instance = childrens[i];
      if (isFormItemInstance(instance)) {
        try {
          await instance.validateFormItem(validateOptions);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }
  }

  /** 验证并触发表单提交 */
  async function submitForm(validateOptions: FormValidateOptions): Promise<void> {
    try {
      await validateCurrentForm(validateOptions);

      emit('submit-form', unref(formData));

      const submitActionFn = unref(submitAction);
      if (typeof submitActionFn === 'function') {
        isSubmiting.value = true;
        try {
          await submitActionFn(unref(formData));
        } catch (e) {
          isSubmiting.value = false;
        } finally {
          isSubmiting.value = false;
        }
      }
    } catch (error) {
      console.error('submitForm-error', (error as Error).message);
    }
  }

  // 向下注入 props
  provide(FORM_WRAP_PROPS_PROVIDE_KEY, props);

  provide(FORM_WRAP_PROVIDE_KEY, {
    debug,
    isSubmiting,
    validateCurrentForm,
    submitForm,
  });

  return {
    isSubmiting,
    validateCurrentForm,
    submitForm,
  };
};
