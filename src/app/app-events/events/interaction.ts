/**
 * @file 互动功能相关全局事件
 */
export const interactionEvents = {
  /**
   * 打开公告列表
   */
  OpenAnnouncementList: 'OpenAnnouncementList',
  /**
   * 打开某个公告详情
   * @param {object} data 公告详情
   */
  OpenAnnouncementDetail: 'OpenAnnouncementDetail',
  /**
   * 打开签到弹窗
   * @param {boolean} visible 显示状态
   */
  OpenCheckIn: 'OpenCheckIn',
  /**
   * 打开问卷弹窗
   * @param {string} questionnaireId 问卷ID
   */
  OpenQuestionnaire: 'OpenQuestionnaire',
  /**
   * 打开答题卡弹窗
   * @param {boolean} visible 显示状态
   */
  OpenAnswerCard: 'OpenAnswerCard',
  /**
   * 打开快速答题卡弹窗
   * @param {boolean} visible 显示状态
   */
  OpenQuickAnswerCard: 'OpenQuickAnswerCard',
  /**
   * 打开竖屏的商品库列表弹窗
   * @param {boolean} visible 显示状态
   */
  OpenPortraitProductList: 'OpenPortraitProductList',
  /**
   * 打开举报反馈弹窗
   * @param {boolean} visible 显示状态
   */
  OpenFeedback: 'OpenFeedback',
  /**
   * 判断发言是否满足评论抽奖
   * @param {string} comment 消息内容
   */
  CheckCommentLotteryComment: 'CheckCommentLotteryComment',
  /**
   * 打开红包雨
   * @param {object} data 红包消息
   */
  OpenRedpackRain: 'OpenRedpackRain',
  /**
   * 打开红包弹窗
   * @param {object} data 红包消息
   */
  OpenRedpack: 'OpenRedpack',
  /**
   * 设置红包状态
   */
  SetRedpackStatus: 'SetRedpackStatus',
  /**
   * 打开抽奖动画
   * @param {boolean} visible 显示状态
   */
  OpenLotteryAnimation: 'OpenLotteryAnimation',
  /**
   * 打开抽奖结果弹窗
   * @param {boolean} visible 显示状态
   * @param {object} record 中奖记录
   */
  OpenLotteryResult: 'OpenLotteryResult',
  /**
   * 打开积分记录弹层
   * @param {boolean} visible 显示状态
   */
  OpenScoreRecord: 'OpenScoreRecord',
  /**
   * 打开中奖记录
   * @param {boolean} visible 显示状态
   */
  OpenLotteryRecord: 'OpenLotteryRecord',
  /**
   * 打开报名抽奖
   * @param {boolean} visible 显示状态
   */
  OpenEnrollLottery: 'OpenEnrollLottery',
  /**
   * 打开发送红包
   * @param {boolean} visible 显示状态
   */
  OpenSendRedpack: 'OpenSendRedpack',
  /**
   * 打开问答弹层
   * @param {boolean} visible 显示状态
   */
  OpenQuestionAnswer: 'OpenQuestionAnswer',
  /**
   * 打开商品库的职位详情
   * @param {object} jobDetail 职位详情
   */
  OpenProductJobDetail: 'OpenProductJobDetail',
  /**
   * 打开用户卡片
   */
  OpenSeatTableUserCard: 'OpenSeatTableUserCard',
  /**
   * 打开收藏弹层
   */
  OpenSeatTableFollowerPopup: 'OpenSeatTableFollowerPopup',
  /**
   * 刷新收藏列表
   */
  RefreshSeatTableFollowList: 'RefreshSeatTableFollowList',
  /**
   * 签到完成
   */
  CheckInFinish: 'CheckInFinish',
  /**
   * 打开下单弹窗
   */
  OpenOrderPopup: 'OpenOrderPopup',
  /**
   * 打开订单中心弹窗
   */
  OpenOrderCenterPopup: 'OpenOrderCenterPopup',
  /**
   * 打开优惠券待领取弹窗
   */
  OpenCouponCommonList: 'OpenCouponCommonList',
  /**
   * 打开优惠券已领取弹窗
   */
  OpenCouponUserList: 'OpenCouponUserList',
  /**
   * 打开商品详情
   */
  OpenProductDetail: 'OpenProductDetail',
  /**
   * 打开投票弹窗
   * @param {boolean} visible 显示状态
   */
  OpenVote: 'OpenVote',
  /**
   * 打开投票规则弹窗
   * @param {string} ruleText 规则文本
   */
  OpenVoteRule: 'OpenVoteRule',
  /**
   * 打开公告 V2 弹窗
   */
  OpenBulletinPopup: 'OpenBulletinPopup',
};
