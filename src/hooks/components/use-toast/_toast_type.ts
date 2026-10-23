/**
 * 提示类型
 */
export enum ToastType {
  /** 信息类提示 */
  Info = 'info',
  /** 成功类提示 */
  Success = 'success',
  /** 警告类提示 */
  Warning = 'warning',
  /** 异常类提示 */
  Error = 'error',
  /** 帮助类提示 */
  Help = 'help',
  /** 加载中提示 */
  Loading = 'loading',
}

/**
 * toast 提示实例
 */
export interface ToastInstance {
  /** 打开提示 */
  openToast(): void;
  /** 关闭提示 */
  closeToast(): void;
  /** 设置提示 top 样式 */
  setToastTop(top: number): void;
}
