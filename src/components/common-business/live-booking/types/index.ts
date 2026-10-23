/**
 * 短信预约表单实例
 */
export interface LiveBookingFormInstance {
  /** 打开表单弹层 */
  openBookingForm: () => Promise<void> | void;
  /** 提交预约 */
  submitLiveBookingForm: () => Promise<void>;
  /** 取消预约 */
  cancelLiveBooking: () => Promise<void>;
}

/**
 * 公众号二维码实例
 */
export interface SubscribeInstance {
  /** 打开公众号二维码弹层 */
  openPopup: (qrcodeUrl?: string) => void;
  /** 关闭弹层 */
  closePopup: () => void;
}
