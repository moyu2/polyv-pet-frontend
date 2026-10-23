export const useWeixinJSBridge = () => {
  /**
   * 获取桥接器
   */
  function getWeixinJSBridge(): Promise<WeixinJSBridgeInstance | undefined> {
    return Promise.resolve(window.WeixinJSBridge);
  }

  return {
    getWeixinJSBridge,
  };
};
