import { translate } from '@/assets/lang';

export const useWeixinOutTradeError = () => {
  function getWeixinOutTradeErrorTips(
    outTradeErr: string | undefined,
    defaultTips?: string,
  ): string {
    const errorCodeMap: Record<string, string> = {
      USER_ACCOUNT_FROZEN: translate('weixin.outTrade.error1'),
      ACCOUNT_FROZEN: translate('weixin.outTrade.error2'),
      ACCOUNT_NOT_EXIST: translate('weixin.outTrade.error3'),
      BANK_CARD_ACCOUNT_ABNORMAL: translate('weixin.outTrade.error4'),
      BANK_CARD_BANK_INFO_WRONG: translate('weixin.outTrade.error5'),
      BANK_CARD_CARD_INFO_WRONG: translate('weixin.outTrade.error6'),
      BANK_CARD_COLLECTIONS_ABOVE_QUOTA: translate('weixin.outTrade.error7'),
      BANK_CARD_PARAM_ERROR: translate('weixin.outTrade.error8'),
      BANK_CARD_STATUS_ABNORMAL: translate('weixin.outTrade.error9'),
      BLOCK_B2C_USERLIMITAMOUNT_BSRULE_MONTH: translate('weixin.outTrade.error10'),
      BLOCK_B2C_USERLIMITAMOUNT_MONTH: translate('weixin.outTrade.error11'),
      DAY_RECEIVED_COUNT_EXCEED: translate('weixin.outTrade.error12'),
      DAY_RECEIVED_QUOTA_EXCEED: translate('weixin.outTrade.error13'),
      EXCEEDED_ESTIMATED_AMOUNT: translate('weixin.outTrade.error14'),
      ID_CARD_NOT_CORRECT: translate('weixin.outTrade.error15'),
      MERCHANT_REJECT: translate('weixin.outTrade.error16'),
      MERCHANT_NOT_CONFIRM: translate('weixin.outTrade.error17'),
      NAME_NOT_CORRECT: translate('weixin.outTrade.error18'),
      OPENID_INVALID: translate('weixin.outTrade.error19'),
      OTHER_FAIL_REASON_TYPE: translate('weixin.outTrade.error20'),
      OVERDUE_CLOSE: translate('weixin.outTrade.error21'),
      PAYEE_ACCOUNT_ABNORMAL: translate('weixin.outTrade.error22'),
      PAYER_ACCOUNT_ABNORMAL: translate('weixin.outTrade.error23'),
      PRODUCT_AUTH_CHECK_FAIL: translate('weixin.outTrade.error24'),
      REALNAME_ACCOUNT_RECEIVED_QUOTA_EXCEED: translate('weixin.outTrade.error25'),
      REAL_NAME_CHECK_FAIL: translate('weixin.outTrade.error26'),
      RECEIVE_ACCOUNT_NOT_CONFIGURE: translate('weixin.outTrade.error27'),
      RESERVATION_INFO_NOT_MATCH: translate('weixin.outTrade.error28'),
      RESERVATION_SCENE_NOT_MATCH: translate('weixin.outTrade.error29'),
      RESERVATION_STATE_INVALID: translate('weixin.outTrade.error30'),
      TRANSFER_QUOTA_EXCEED: translate('weixin.outTrade.error31'),
      TRANSFER_REMARK_SET_FAIL: translate('weixin.outTrade.error32'),
      TRANSFER_RISK: translate('weixin.outTrade.error33'),
      TRANSFER_SCENE_INVALID: translate('weixin.outTrade.error34'),
      TRANSFER_SCENE_UNAVAILABLE: translate('weixin.outTrade.error35'),
      MANUAL_CLOSE: translate('weixin.outTrade.error36'),
      NOT_ENOUGH: translate('weixin.outTrade.error37'),
    };

    // 直接返回错误码对应的翻译，如果没有则返回默认信息
    return outTradeErr && errorCodeMap[outTradeErr]
      ? errorCodeMap[outTradeErr]
      : defaultTips || translate('taskActivity.rewardError.msg2');
  }

  return {
    getWeixinOutTradeErrorTips,
  };
};
