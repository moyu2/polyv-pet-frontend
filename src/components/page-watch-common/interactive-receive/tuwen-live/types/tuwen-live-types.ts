/** 图文展示模式枚举 */
export enum AllTuwenMode {
  /** 图文模式 */
  Tuwen = 1,
  /** 图片模式 */
  Image = 2,
}

export interface IarTuwenLiveInstance {
  /** 设置页面滚动条监听 */
  initScrollLister?: () => void;
}
