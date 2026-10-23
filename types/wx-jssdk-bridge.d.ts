declare interface RequestMerchantTransferOptions {
  mchId: string;
  appId: string;
  package: string;
}

declare interface WeixinJSBridgeInvokeCallbackParams {
  err_msg: string;
}

declare type WeixinJSBridgeInvokeCallback = (params: WeixinJSBridgeInvokeCallbackParams) => unknown;

/**
 * 微信 JSSDK 桥接器实例
 */
declare interface WeixinJSBridgeInstance {
  invoke(
    name: 'requestMerchantTransfer',
    options: RequestMerchantTransferOptions,
    callback?: WeixinJSBridgeInvokeCallback,
  ): void;
}

interface Window {
  /** 微信 JSSDK 桥接器实例 */
  WeixinJSBridge?: WeixinJSBridgeInstance;
}
