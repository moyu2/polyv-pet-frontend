/** 微信的回调方法 */
export type WeixinGeneralCallback = (res?: WechatJsSdk.GeneralCallbackResult) => void;

export interface WxCallback {
  /** 成功的回调 */
  successCb?: WeixinGeneralCallback;
  /** 取消的回调 */
  cancelCb?: WeixinGeneralCallback;
}

/**
 * 微信分享配置信息（提供给 feed-inject 外部容器使用）
 */
export interface WxShareConfigInfo {
  /** 是否开启分享 */
  shareEnabled: boolean;
  /** 分享标题 */
  title: string;
  /** 分享描述 */
  desc: string;
  /** 分享链接 */
  link: string;
  /** 分享图标地址 */
  imgUrl: string;

  channelId?: string;
}
