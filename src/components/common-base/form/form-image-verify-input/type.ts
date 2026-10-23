export interface ImageVerifyInputInstance {
  /** 刷新图片验证码 */
  refreshVerifyImage(resetVal?: boolean): Promise<void>;
}
