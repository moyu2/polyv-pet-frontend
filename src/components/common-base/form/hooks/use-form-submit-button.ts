import { ref, unref, watch, computed, nextTick } from 'vue';
import { useFormWrapInject, useFormWrapPropsInject } from './use-form';
import debounce from 'lodash-es/debounce';
import { normalButtonProps } from '../../normal-button/use-normal-button';
import { PropUtils, VueProps } from '@polyv/vue-components';

export const formSubmitButtonProps = () => ({
  ...normalButtonProps(),
  /** 防抖提交，默认：false */
  debounceSubmit: PropUtils.bool.def(false),
});

export interface FormSubmitButtonInstance {
  checkDisabled: () => Promise<void>;
}

export const useFormSubmitButton = (options: { props: VueProps<typeof formSubmitButtonProps> }) => {
  const props = options.props;
  const formProps = useFormWrapPropsInject();
  const formCtx = useFormWrapInject();

  /** 标识位：根据表单上下文判断按钮是否禁用 */
  const isDisabledByFormCtx = ref(false);

  /** 检查按钮是否需要禁用 */
  async function checkDisabled(): Promise<void> {
    let isDisabled = false;

    if (!formCtx) {
      return;
    }

    // 表单正在提交中
    if (unref(formCtx.isSubmiting)) {
      isDisabled = true;
      isDisabledByFormCtx.value = isDisabled;
      return;
    }

    // 进行表单验证
    try {
      if (formCtx.validateCurrentForm) {
        await formCtx.validateCurrentForm({
          showErrorMessage: false,
        });
      }
    } catch (e) {
      if (unref(formCtx.debug)) {
        console.error('form-submit-button-error', e);
      }
      isDisabled = true;
    }

    isDisabledByFormCtx.value = isDisabled;
  }

  /** 提交按钮是否禁用 */
  const buttonIsDisabled = computed(() => {
    return props.disabled || isDisabledByFormCtx.value;
  });

  watch(
    () => {
      return [formProps && formProps.formData, formCtx && unref(formCtx.isSubmiting)];
    },
    () => checkDisabled(),
    {
      immediate: true,
      deep: true,
    },
  );

  /** 触发表单提交 */
  const triggerSubmitForm = () => {
    if (props.allowDisabledClick && formCtx && formCtx.validateCurrentForm) {
      formCtx
        .validateCurrentForm({
          showErrorMessage: true,
        })
        // eslint-disable-next-line promise/prefer-await-to-then
        .catch(err => {
          console.error('validateCurrentForm Err', err);
          nextTick(() => {
            const $formErrDom = document.querySelector('[data-form-item-error]') || undefined;
            $formErrDom && $formErrDom.scrollIntoView({ behavior: 'smooth', block: 'center' });
          });
        });
    }

    if (buttonIsDisabled.value) {
      return;
    }

    formCtx && formCtx.submitForm();
  };

  /** 防抖触发表单提交 */
  const debounceTriggerSubmitForm = debounce(triggerSubmitForm, 500);

  /** 处理按钮点击 */
  function onButtonClick() {
    if (props.debounceSubmit) {
      debounceTriggerSubmitForm();
    } else {
      triggerSubmitForm();
    }
  }

  const formSubmitButtonInstance: FormSubmitButtonInstance = {
    checkDisabled,
  };

  return {
    buttonIsDisabled,
    checkDisabled,
    onButtonClick,
    formSubmitButtonInstance,
  };
};
