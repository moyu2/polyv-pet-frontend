import Vue, { ComponentOptions } from 'vue';

export type PolyvIRSceneComponentOption = ComponentOptions<Vue>;

/**
 * PC 端入口
 */
export interface PolyvIRSceneEntrance {
  // 共有端
  BulletinTop: PolyvIRSceneComponentOption;
  BulletinBubble: PolyvIRSceneComponentOption;
  PortraitCheckIn: PolyvIRSceneComponentOption;
  EnrollLotteryPendant: PolyvIRSceneComponentOption;
  ProductBubble: PolyvIRSceneComponentOption;
  ProductDialog: PolyvIRSceneComponentOption;
  ProductJob: PolyvIRSceneComponentOption;
  ProductButton: PolyvIRSceneComponentOption;
  PushCard: PolyvIRSceneComponentOption;
  RedEnvelopePendant: PolyvIRSceneComponentOption;
  RedEnvelopeEntrance: PolyvIRSceneComponentOption;
  EvaluationPendant: PolyvIRSceneComponentOption;
  ProductDetail: PolyvIRSceneComponentOption;

  // PC 端下才有的
  PcBulletin: PolyvIRSceneComponentOption;
  PcEnrollLottery: PolyvIRSceneComponentOption;
  PcFeedBack: PolyvIRSceneComponentOption;
  PcProduct: PolyvIRSceneComponentOption;
  PcQuestionAnswer: PolyvIRSceneComponentOption;
  PcRedEnvelope: PolyvIRSceneComponentOption;
  PcRedpackRain: PolyvIRSceneComponentOption;
  PcEvaluationQuestionnaire: PolyvIRSceneComponentOption;
  PcTopic: PolyvIRSceneComponentOption;
  PcTuwen: PolyvIRSceneComponentOption;
  PcVote: PolyvIRSceneComponentOption;
  PcRushAnswer: PolyvIRSceneComponentOption;

  // 移动端下才有的
  MobileBulletin: PolyvIRSceneComponentOption;
  MobileAnnouncementBar: PolyvIRSceneComponentOption;
  MobileEnrollLottery: PolyvIRSceneComponentOption;
  MobileFeedBack: PolyvIRSceneComponentOption;
  MobileProduct: PolyvIRSceneComponentOption;
  MobileQuestionAnswer: PolyvIRSceneComponentOption;
  MobileRedEnvelope: PolyvIRSceneComponentOption;
  MobileRedpackRain: PolyvIRSceneComponentOption;
  MobileEvaluationQuestionnaire: PolyvIRSceneComponentOption;
  MobilePointRERecord: PolyvIRSceneComponentOption;
  MobileTopic: PolyvIRSceneComponentOption;
  MobileTuwen: PolyvIRSceneComponentOption;
  MobileVote: PolyvIRSceneComponentOption;
  MobileRushAnswer: PolyvIRSceneComponentOption;
  MobileSeatTableMeeting: PolyvIRSceneComponentOption;
  MobileSeatTableVertical: PolyvIRSceneComponentOption;
  MobileSeatUserCard: PolyvIRSceneComponentOption;
  MobileSeatFollowList: PolyvIRSceneComponentOption;
  MobileSeatTips: PolyvIRSceneComponentOption;
  MobileOrder: PolyvIRSceneComponentOption;
  MobileAddressList: PolyvIRSceneComponentOption;
  MobileAddressEdit: PolyvIRSceneComponentOption;
  MobileOrderList: PolyvIRSceneComponentOption;
  MobileOrderDetail: PolyvIRSceneComponentOption;
}

/**
 * 互动功能组件标识
 */
export type PolyvIRSceneKey = keyof PolyvIRSceneEntrance;

export interface PolyvIRSceneType {
  /** PC 端入口 */
  entrancePc?: PolyvIRSceneEntrance;
  /** 移动端入口 */
  entranceMobile?: PolyvIRSceneEntrance;
}

declare global {
  interface Window {
    PolyvIRScene?: PolyvIRSceneType;
  }
}
