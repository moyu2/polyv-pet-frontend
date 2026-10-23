/**
 * 按钮类型
 */
export enum ButtonType {
  /** 自定义按钮，由外部自行设置样式，不跟随多皮肤 */
  Custom = 'custom',
  /** 主题按钮 */
  Primary = 'primary',
  /** 信息按钮 */
  Info = 'info',
  /** 取消按钮 */
  Cancel = 'cancel',
  /** 加重按钮 */
  Aggravate = 'aggravate',
  /** 侧边菜单栏 */
  AsideMenu = 'aside-menu',
  /** 置灰按钮 */
  Gray = 'gray',
}

/**
 * 按钮尺寸
 */
export enum ButtonSize {
  /** 大 - 56px */
  Large = 'large',
  /** 中 - 48px */
  Medium = 'medium',
  /** 默认 - 40px */
  Default = 'default',
  /** 小 - 32px */
  Small = 'small',
  /** 超小 - 28px */
  Mini = 'mini',
  /** 超级小 - 24px */
  XMini = 'x-mini',
}

/**
 * 按钮原生类型
 */
export enum ButtonNativeType {
  Button = 'button',
  Submit = 'submit',
  Reset = 'reset',
}
