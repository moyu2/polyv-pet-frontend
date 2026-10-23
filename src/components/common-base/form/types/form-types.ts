import { tupleString } from '@/assets/utils/array';
import { ComputedRef } from 'vue';

/**
 * 表单验证选项
 */
export interface FormValidateOptions {
  /** 是否显示异常消息 */
  showErrorMessage?: boolean;
}

/**
 * 表单节点对象
 */
export interface FormItemInstance {
  isFormItem: true;
  /** 表单节点是否验证异常 */
  formItemIsError: ComputedRef<boolean>;
  /** 设置异常提示 */
  setErrorMessage(message: string | undefined): void;
  /** 移除异常提示 */
  removeErrorMessage(): void;
  /** 验证表单节点 */
  validateFormItem(validateOptions?: FormValidateOptions): Promise<void>;
}

export const formItemLabelModels = tupleString('inline', 'header');
/** 表单节点 label 样式，inline-行内，header-头部 */
export type FormItemLabelModel = typeof formItemLabelModels[number];
