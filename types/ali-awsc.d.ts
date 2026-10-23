/**
 * @file 阿里云滑块验证码类型
 */

/**
 * 阿里云滑块验证数据
 */
declare interface AliAwscSliceData {
  /** 会话 id */
  sessionId: string;
  /** 签名串 */
  sig: string;
  /** 请求唯一标识 */
  token: string;
  /** 场景 */
  scene: string;
}
