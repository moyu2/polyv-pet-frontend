/**
 * <form-input> 实例
 */
export interface FormInputInstance {
  /** 强制更新 */
  forceUpdate(): void;
  /** 聚焦输入框 */
  focusInput(): void;
  /** 失焦输入框 */
  blurInput(): void;
}
