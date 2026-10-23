/**
 * @file 互动功能V2相关全局事件
 */
export const iarEvents = {
  /**
   * 打开中奖记录弹层
   */
  OpenLotteryRecordDialog: 'OpenLotteryRecordDialog',
  /**
   * 刷新中奖记录列表
   */
  RefreshLotteryRecordList: 'RefreshLotteryRecordList',
  /**
   * 打开中奖领取弹层
   */
  OpenLotteryReceiveDialog: 'OpenLotteryReceiveDialog',
  /**
   * 打开平台抽奖中奖记录弹窗
   */
  OpenLuckyLotteryPrizeListDialog: 'OpenLuckyLotteryRecordDialog',
  /**
   * 幸运抽奖 UI 发出的打开我的奖品事件
   */
  OpenLuckyLotteryPrizeList: 'OpenLuckyLotteryPrizeList',
  /**
   * 刷新平台抽奖中奖记录列表
   */
  RefreshLuckyLotteryPrizeList: 'RefreshLuckyLotteryPrizeList',
  /**
   * 打开福袋中奖记录弹窗
   */
  OpenLuckyBagPrizeListDialog: 'OpenLuckyBagPrizeListDialog',
  /**
   * 刷新福袋个人中奖记录列表（领奖信息提交成功后触发，中奖记录 claimStatus 0→1）
   */
  RefreshLuckyBagWinRecord: 'RefreshLuckyBagWinRecord',
};
