/**
 * @file 验证相关的工具函数
 */

/**
 * 根据区号验证手机号是否正确
 * @param phoneNumber 手机号
 * @param areaCode 区号，默认：+86
 * @returns 正确的手机号返回 true
 */
export function validatePhoneNumber(phoneNumber: string, areaCode = '+86'): boolean {
  // 对于非国内的手机号，只需要 5～20 位
  if (areaCode !== '+86') {
    return /(^\d{5,20}$)/.test(phoneNumber);
  }

  return /^1[3-9]\d{9}$/.test(phoneNumber);
}

/**
 * 验证图片验证码
 * @param imageCaptcha 图片验证码
 * @param imageId 图片验证码 id
 * @returns 正确的验证码返回 true
 */
export function validateImageCaptcha(imageCaptcha: string, imageId: string): boolean {
  return imageCaptcha.length >= 5 && imageId.length > 0;
}

/**
 * 文本是否包含特殊字符
 * @param text 目标文本
 * @returns 如果存在特殊字符则返回 true
 */
export function validateSpecialString(text: string): boolean {
  const containSpecial = /[~!@#$%^&*()+=[\]{}|\\;:",./<>?]+/;
  return containSpecial.test(text);
}

/**
 * 检测文本中是否仅包含中英文和空格
 * @param text 目标文本
 * @returns 如果存在其他字符则返回 false
 */
export function validateCnAndEn(text: string): boolean {
  return /^[\u4e00-\u9fa5a-zA-Z ]+$/.test(text);
}
