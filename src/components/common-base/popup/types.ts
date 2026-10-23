/**
 * Popup 弹层主题
 */
export enum PopupTheme {
  /** 默认主题 */
  Default = 'default',
  /** 竖屏主题-黑色主题 */
  Portrait = 'portrait',
  /** 竖屏主题-白色主题 */
  PortraitLight = 'portrait-light',
  /** 跟随页面皮肤 */
  FollowPageSkin = 'follow-page-skin',
}

export interface PopupInstance {
  /** 打开 */
  openPopup(): void;
  /** 关闭 */
  closePopup(): void;
}

/** 屏幕横屏下的弹窗位置 */
export enum PopupHorizontalScreenPosition {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}
