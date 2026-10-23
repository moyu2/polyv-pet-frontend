/**
 * 验证码选项。
 */

import type { IPlvCaptcha } from '@polyv/captcha-sdk';

declare global {
  interface Window {
    /**
     * 验证码 SDK 全局变量
     */
    PlvCaptcha?: IPlvCaptcha;
  }
}
